"""
matching_engine.py
-------------------
Circula AI Matching Engine
3-layer pipeline: Rule-based hard filter -> Semantic vector similarity (embeddings) -> Multi-factor weighted ranking

Features:
- SentenceTransformer ("all-MiniLM-L6-v2") vector embeddings with cosine similarity
- Industrial material synonym & abbreviation expansion (Cu, Al, MS, HDPE, PP, etc.) with strict word-boundary matching
- Calibrated similarity rescaling (eliminates false-positive cross-material matches)
- Haversine distance computation and linear distance decay
- Precomputed embedding caching for fast, low-latency matching
- Offline / fallback support with token overlap & synonym clustering
"""

from __future__ import annotations

import json
import math
import os
import re
from functools import lru_cache
from typing import Any, Iterable

# Suppress HuggingFace unauthenticated / symlink warnings
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

try:
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    cosine_similarity = None


# ---------------------------------------------------------------------------
# Industrial Material Knowledge Base & Synonyms
# ---------------------------------------------------------------------------

MATERIAL_SYNONYMS: dict[str, list[str]] = {
    "copper": ["copper", "cu", "copper scrap", "copper wire", "copper alloy", "copper rod", "copper cathode", "copper tube"],
    "aluminium": ["aluminium", "aluminum", "al", "aluminium scrap", "al scrap", "aluminum scrap", "6061", "6063", "dross", "aluminium sheet"],
    "steel": ["steel", "ms", "mild steel", "steel scrap", "iron", "stainless steel", "ss", "carbon steel", "galvanized steel", "gi scrap"],
    "plastic": ["plastic", "hdpe", "pp", "pet", "pvc", "ldpe", "polymer", "resin", "polyethylene", "polypropylene", "plastic scrap", "regrind"],
    "paper": ["paper", "cardboard", "carton", "newsprint", "corrugated", "kraft", "occ", "paper scrap"],
    "rubber": ["rubber", "tyre scrap", "tire scrap", "crumb rubber", "epdm", "nitrile", "latex"],
    "glass": ["glass", "cullet", "glass bottle", "flint glass", "amber glass"],
    "textile": ["textile", "cotton scrap", "polyester yarn", "fabric waste", "denim scrap", "yarn scrap"],
}

ABBREVIATIONS: dict[str, str] = {
    r"\bcu\b": "copper",
    r"\bal\b": "aluminium",
    r"\bms\b": "mild steel",
    r"\bss\b": "stainless steel",
    r"\bhdpe\b": "high density polyethylene plastic",
    r"\bpp\b": "polypropylene plastic",
    r"\bpet\b": "polyethylene terephthalate plastic",
    r"\bpvc\b": "polyvinyl chloride plastic",
    r"\bldpe\b": "low density polyethylene plastic",
    r"\bgi\b": "galvanized iron",
}

def expand_material_text(text: str) -> str:
    """Expand domain abbreviations and lowercase material text for better embedding representation."""
    if not text:
        return ""
    t = text.lower().strip()
    for pattern, expansion in ABBREVIATIONS.items():
        t = re.sub(pattern, expansion, t)
    return t


def find_material_group(text: str) -> str | None:
    """Identify the overarching material category using strict whole-word boundaries."""
    if not text:
        return None
    t = text.lower().strip()
    words = set(re.findall(r"\b[a-z0-9]+\b", t))
    for group, synonyms in MATERIAL_SYNONYMS.items():
        for s in synonyms:
            if " " in s:
                if s in t:
                    return group
            else:
                if s in words:
                    return group
    return None


# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def get_model() -> Any:
    """
    Loads the sentence-transformer model once and caches it in memory.
    """
    if SentenceTransformer is None:
        return None
    try:
        return SentenceTransformer("all-MiniLM-L6-v2")
    except Exception as e:
        print(f"Warning: Could not load SentenceTransformer: {e}")
        return None


# ---------------------------------------------------------------------------
# Embedding helpers
# ---------------------------------------------------------------------------

def compute_embedding(text: str) -> list[float]:
    """Encode a single material string into a normalized 384-dimensional vector."""
    expanded = expand_material_text(text)
    if not expanded:
        return []
    
    model = get_model()
    if model is None:
        return []
    try:
        vector = model.encode(expanded, normalize_embeddings=True)
        return vector.tolist()
    except Exception as e:
        print(f"Error computing embedding for '{text}': {e}")
        return []


def embedding_from_json(raw: str | None) -> list[float] | None:
    """Load a cached embedding stored as a JSON string in the database."""
    if not raw:
        return None
    try:
        data = json.loads(raw)
        if isinstance(data, list) and len(data) > 0:
            return data
    except Exception:
        pass
    return None


# ---------------------------------------------------------------------------
# Semantic Material Similarity
# ---------------------------------------------------------------------------

def material_similarity(
    resource_material: str,
    required_material: str,
    resource_embedding: list[float] | None = None,
    required_embedding: list[float] | None = None,
) -> float:
    """
    Returns a calibrated 0.0-1.0 similarity score between two material descriptions.
    Enforces strict compatibility to prevent cross-material false positives.
    """
    res_raw = (resource_material or "").strip()
    req_raw = (required_material or "").strip()
    if not res_raw or not req_raw:
        return 0.0

    res_lower = res_raw.lower()
    req_lower = req_raw.lower()

    # Exact string match
    if res_lower == req_lower:
        return 1.0

    # Check material family group
    group_res = find_material_group(res_lower)
    group_req = find_material_group(req_lower)

    # If both belong to known groups and they differ, they are strictly incompatible
    if group_res and group_req and group_res != group_req:
        return 0.0

    # If both belong to the same known family group
    if group_res and group_req and group_res == group_req:
        base_group_score = 0.92
    else:
        base_group_score = 0.0

    # Substring / overlap check
    if res_lower in req_lower or req_lower in res_lower:
        base_group_score = max(base_group_score, 0.88)

    # Try Transformer Vector Cosine Similarity
    ai_score = 0.0
    if SentenceTransformer is not None and cosine_similarity is not None:
        try:
            vec_a = resource_embedding or compute_embedding(res_raw)
            vec_b = required_embedding or compute_embedding(req_raw)
            if vec_a and vec_b:
                raw_sim = float(cosine_similarity([vec_a], [vec_b])[0][0])
                # Calibrate: MiniLM typically outputs 0.40-0.55 for unrelated text.
                # Threshold at 0.58; rescale [0.58, 1.0] -> [0.50, 1.0]
                if raw_sim >= 0.58:
                    ai_score = 0.50 + ((raw_sim - 0.58) / (1.0 - 0.58)) * 0.50
                    ai_score = min(1.0, max(0.0, ai_score))
                else:
                    ai_score = 0.0
        except Exception:
            ai_score = 0.0

    # Combine AI embedding score and synonym group score
    final_sim = max(base_group_score, ai_score)

    # If words have partial token overlap
    words_a = set(re.findall(r"\b[a-z0-9]+\b", expand_material_text(res_raw)))
    words_b = set(re.findall(r"\b[a-z0-9]+\b", expand_material_text(req_raw)))
    if words_a & words_b and final_sim == 0.0:
        final_sim = 0.70

    return round(final_sim, 3)


# ---------------------------------------------------------------------------
# Distance Helpers
# ---------------------------------------------------------------------------

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two lat/long points in kilometers."""
    r = 6371.0  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def estimate_text_distance_km(loc1: str, loc2: str) -> float:
    """Estimate distance in km between two location strings."""
    if not loc1 or not loc2:
        return 20.0
    l1 = loc1.strip().lower()
    l2 = loc2.strip().lower()
    if l1 == l2:
        return 2.0

    city1 = l1.split()[0].replace(",", "").replace("-", "")
    city2 = l2.split()[0].replace(",", "").replace("-", "")
    if city1 == city2:
        return 12.0
    return 110.0


def _get_val(obj: Any, *keys: str, default: Any = None) -> Any:
    """Helper to retrieve value from object or dict across multiple key naming styles."""
    if obj is None:
        return default
    if isinstance(obj, dict):
        for k in keys:
            if k in obj and obj[k] is not None:
                return obj[k]
        return default
    for k in keys:
        if hasattr(obj, k):
            val = getattr(obj, k)
            if val is not None:
                return val
    return default


# ---------------------------------------------------------------------------
# Layer 1: Rule-Based Hard Filter
# ---------------------------------------------------------------------------

MAX_DISTANCE_KM = 200.0


def hard_filter(resource: Any, requirement: Any) -> bool:
    """
    Reject impossible matches before spending compute on ranking:
    - Same company cannot trade with itself
    - Non-positive quantities
    - Incompatible materials (similarity == 0)
    - Exceeds maximum delivery radius (> 200 km)
    """
    res_comp = _get_val(resource, "companyId", "company_id")
    req_comp = _get_val(requirement, "companyId", "company_id")
    if res_comp and req_comp and str(res_comp) == str(req_comp):
        return False

    res_qty = float(_get_val(resource, "quantity", default=0) or 0)
    if res_qty <= 0:
        return False

    # Check material similarity
    mat_res = str(_get_val(resource, "material_type", "materialType", "name", default=""))
    mat_req = str(_get_val(requirement, "material_type", "materialType", "name", default=""))
    
    res_embed = embedding_from_json(_get_val(resource, "embedding"))
    req_embed = embedding_from_json(_get_val(requirement, "embedding"))
    
    mat_sim = material_similarity(mat_res, mat_req, res_embed, req_embed)
    if mat_sim <= 0.0:
        return False

    # Distance check if coordinates are present
    res_lat = _get_val(resource, "latitude")
    res_lon = _get_val(resource, "longitude")
    req_lat = _get_val(requirement, "latitude")
    req_lon = _get_val(requirement, "longitude")

    if res_lat is not None and req_lat is not None and res_lon is not None and req_lon is not None:
        try:
            dist = haversine_distance_km(float(res_lat), float(res_lon), float(req_lat), float(req_lon))
            if dist > MAX_DISTANCE_KM:
                return False
        except (ValueError, TypeError):
            pass

    return True


# ---------------------------------------------------------------------------
# Layer 3: Weighted Multi-Factor Scoring
# ---------------------------------------------------------------------------

WEIGHTS = {
    "material": 0.40,
    "distance": 0.25,
    "quantity": 0.20,
    "quality": 0.10,
    "availability": 0.05,
}


def quality_match(resource_grade: str | None, required_grade: str | None) -> float:
    """Evaluate quality compatibility."""
    if not resource_grade or not required_grade:
        return 0.75  # neutral score
    r_g = str(resource_grade).strip().lower()
    q_g = str(required_grade).strip().lower()
    if r_g == q_g:
        return 1.0
    if any(w in r_g for w in q_g.split()) or any(w in q_g for w in r_g.split()):
        return 0.85
    return 0.50


def availability_match(available_info: Any, required_info: Any) -> float:
    """1.0 if immediately available, 0.80 if timeline matches."""
    if not available_info:
        return 0.80
    avail_str = str(available_info).lower()
    if "immediate" in avail_str or "ready" in avail_str or "now" in avail_str:
        return 1.0
    return 0.80


def calculate_match_score(resource: Any, requirement: Any) -> dict | None:
    """
    Computes the final weighted match score (0-100) and a breakdown by factor.
    Returns None if the materials are incompatible or out of range.
    """
    mat_res = str(_get_val(resource, "material_type", "materialType", "name", default=""))
    mat_req = str(_get_val(requirement, "material_type", "materialType", "name", default=""))

    resource_embedding = embedding_from_json(_get_val(resource, "embedding"))
    required_embedding = embedding_from_json(_get_val(requirement, "embedding"))

    material_score = material_similarity(
        mat_res,
        mat_req,
        resource_embedding,
        required_embedding,
    )

    if material_score <= 0.0:
        return None  # Incompatible material

    res_lat = _get_val(resource, "latitude")
    res_lon = _get_val(resource, "longitude")
    req_lat = _get_val(requirement, "latitude")
    req_lon = _get_val(requirement, "longitude")

    if res_lat is not None and req_lat is not None and res_lon is not None and req_lon is not None:
        try:
            distance_km = haversine_distance_km(float(res_lat), float(res_lon), float(req_lat), float(req_lon))
        except Exception:
            distance_km = 15.0
    else:
        loc_res = str(_get_val(resource, "location", default=""))
        loc_req = str(_get_val(requirement, "location", default=""))
        distance_km = estimate_text_distance_km(loc_res, loc_req)

    if distance_km > MAX_DISTANCE_KM:
        return None

    distance_score = max(0.0, 1.0 - (distance_km / MAX_DISTANCE_KM))

    res_qty = float(_get_val(resource, "quantity", default=1) or 1)
    req_qty = float(_get_val(requirement, "quantity", default=1) or 1) or 1.0
    quantity_score = min(res_qty / req_qty, 1.0)

    quality_score = quality_match(
        _get_val(resource, "quality", "grade"),
        _get_val(requirement, "quality", "grade")
    )
    availability_score = availability_match(
        _get_val(resource, "availability", "availability_date"),
        _get_val(requirement, "requiredDate", "required_by")
    )

    final_score = (
        material_score * WEIGHTS["material"]
        + distance_score * WEIGHTS["distance"]
        + quantity_score * WEIGHTS["quantity"]
        + quality_score * WEIGHTS["quality"]
        + availability_score * WEIGHTS["availability"]
    ) * 100

    return {
        "match_score": round(final_score, 1),
        "score": round(final_score, 1),
        "distance_km": round(distance_km, 1),
        "breakdown": {
            "material": round(material_score * 100, 1),
            "distance": round(distance_score * 100, 1),
            "geo": round(distance_score * 100, 1),
            "quantity": round(quantity_score * 100, 1),
            "quality": round(quality_score * 100, 1),
            "availability": round(availability_score * 100, 1),
        },
    }


# ---------------------------------------------------------------------------
# Full Pipeline
# ---------------------------------------------------------------------------

def find_matches(
    requirement: Any,
    resources: Iterable[Any],
    min_score: float = 60.0,
) -> list[dict]:
    """
    Runs the full 3-layer pipeline against candidate resources and returns matches sorted by score.
    """
    candidates = [r for r in resources if hard_filter(r, requirement)]

    scored = []
    for r in candidates:
        res_calc = calculate_match_score(r, requirement)
        if res_calc and res_calc["match_score"] >= min_score:
            scored.append({**res_calc, "resource": r})

    return sorted(scored, key=lambda x: -x["match_score"])
