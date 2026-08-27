"""
matching_engine.py
-------------------
Circula AI Matching Engine
3-layer pipeline: rule-based hard filter -> semantic similarity (embeddings) -> weighted ranking

Usage:
    from services.matching_engine import find_matches, get_model

    # warm up the model once at app startup (e.g. FastAPI startup event)
    get_model()

    matches = find_matches(requirement, resource_list, min_score=60)
"""

from __future__ import annotations

import json
import math
from functools import lru_cache
from typing import Any, Iterable

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

try:
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    cosine_similarity = None


# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def get_model() -> Any:
    """
    Loads the sentence-transformer model once and caches it in memory.
    Call this at app startup so the first real request isn't slow.
    """
    if SentenceTransformer is None:
        return None
    return SentenceTransformer("all-MiniLM-L6-v2")


# ---------------------------------------------------------------------------
# Embedding helpers (with optional caching support)
# ---------------------------------------------------------------------------

def compute_embedding(text: str) -> list[float]:
    """Encode a single text string into a vector. Store the result (as JSON)
    on the RESOURCES / REQUIREMENTS row so you never recompute it at match time."""
    model = get_model()
    if model is None:
        return []
    vector = model.encode(text)
    return vector.tolist()


def embedding_from_json(raw: str | None) -> list[float] | None:
    """Load a cached embedding stored as a JSON string in the database."""
    if not raw:
        return None
    try:
        return json.loads(raw)
    except Exception:
        return None


def material_similarity(
    resource_material: str,
    required_material: str,
    resource_embedding: list[float] | None = None,
    required_embedding: list[float] | None = None,
) -> float:
    """
    Returns a 0.0-1.0 similarity score between two material descriptions.
    Pass in cached embeddings when available to avoid re-encoding on every call.
    """
    res_mat = (resource_material or "").strip().lower()
    req_mat = (required_material or "").strip().lower()
    if not res_mat or not req_mat:
        return 0.0
    if res_mat == req_mat:
        return 1.0

    if SentenceTransformer is not None and cosine_similarity is not None:
        try:
            vec_a = resource_embedding or compute_embedding(resource_material)
            vec_b = required_embedding or compute_embedding(required_material)
            if vec_a and vec_b:
                sim = cosine_similarity([vec_a], [vec_b])[0][0]
                # cosine similarity can dip slightly negative for unrelated text; clamp to 0-1
                return max(0.0, min(1.0, float(sim)))
        except Exception:
            pass

    # Basic substring / word overlap fallback
    if res_mat in req_mat or req_mat in res_mat:
        return 0.85

    words_a = set(res_mat.split())
    words_b = set(req_mat.split())
    if words_a & words_b:
        return 0.70

    return 0.0


# ---------------------------------------------------------------------------
# Distance helper (haversine for coordinates or heuristic for text locations)
# ---------------------------------------------------------------------------

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two lat/long points, in kilometers."""
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
        return 25.0
    l1 = loc1.strip().lower()
    l2 = loc2.strip().lower()
    if l1 == l2:
        return 2.0
    city1 = l1.split()[0].replace(",", "")
    city2 = l2.split()[0].replace(",", "")
    if city1 == city2:
        return 12.0
    return 110.0


def _get_val(obj: Any, *keys: str, default: Any = None) -> Any:
    """Helper to retrieve value from object or dict across multiple key variations."""
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
# Layer 1: rule-based hard filter
# ---------------------------------------------------------------------------

MAX_DISTANCE_KM = 200


def hard_filter(resource: Any, requirement: Any) -> bool:
    """
    Reject impossible matches before spending compute on similarity/scoring.
    """
    res_qty = _get_val(resource, "quantity", default=0)
    req_qty = _get_val(requirement, "min_quantity", "quantity", default=0)
    
    # Skip if quantity is completely 0 or negative
    if res_qty <= 0:
        return False

    # Distance check if coordinates are present
    res_lat = _get_val(resource, "latitude")
    res_lon = _get_val(resource, "longitude")
    req_lat = _get_val(requirement, "latitude")
    req_lon = _get_val(requirement, "longitude")

    if res_lat is not None and req_lat is not None:
        dist = haversine_distance_km(float(res_lat), float(res_lon), float(req_lat), float(req_lon))
        if dist > MAX_DISTANCE_KM:
            return False

    return True


# ---------------------------------------------------------------------------
# Layer 3: weighted scoring (Layer 2 similarity feeds into this)
# ---------------------------------------------------------------------------

WEIGHTS = {
    "material": 0.40,
    "distance": 0.25,
    "quantity": 0.20,
    "quality": 0.10,
    "availability": 0.05,
}


def quality_match(resource_grade: str | None, required_grade: str | None) -> float:
    """Match on quality grade."""
    if not resource_grade or not required_grade:
        return 0.7  # neutral score
    r_g = str(resource_grade).strip().lower()
    q_g = str(required_grade).strip().lower()
    if r_g == q_g:
        return 1.0
    if any(w in r_g for w in q_g.split()) or any(w in q_g for w in r_g.split()):
        return 0.85
    return 0.5


def availability_match(available_info: Any, required_info: Any) -> float:
    """1.0 if the resource is immediately available or matches timeline."""
    if not available_info:
        return 0.8
    avail_str = str(available_info).lower()
    if "immediate" in avail_str or "ready" in avail_str or "now" in avail_str:
        return 1.0
    return 0.75


def calculate_match_score(resource: Any, requirement: Any) -> dict:
    """
    Computes the final weighted match score (0-100) and a breakdown by factor.
    """
    mat_res = str(_get_val(resource, "material_type", "materialType", "material", default=""))
    mat_req = str(_get_val(requirement, "material_type", "materialType", "material", default=""))

    resource_embedding = embedding_from_json(_get_val(resource, "embedding"))
    required_embedding = embedding_from_json(_get_val(requirement, "embedding"))

    material_score = material_similarity(
        mat_res,
        mat_req,
        resource_embedding,
        required_embedding,
    )

    res_lat = _get_val(resource, "latitude")
    res_lon = _get_val(resource, "longitude")
    req_lat = _get_val(requirement, "latitude")
    req_lon = _get_val(requirement, "longitude")

    if res_lat is not None and req_lat is not None:
        distance_km = haversine_distance_km(float(res_lat), float(res_lon), float(req_lat), float(req_lon))
    else:
        loc_res = str(_get_val(resource, "location", default=""))
        loc_req = str(_get_val(requirement, "location", default=""))
        distance_km = estimate_text_distance_km(loc_res, loc_req)

    distance_score = max(0.0, 1.0 - (distance_km / MAX_DISTANCE_KM))

    res_qty = float(_get_val(resource, "quantity", default=1))
    req_qty = float(_get_val(requirement, "quantity", default=1)) or 1.0
    quantity_score = min(res_qty / req_qty, 1.0)

    quality_score = quality_match(
        _get_val(resource, "grade", "quality"),
        _get_val(requirement, "grade", "quality")
    )
    availability_score = availability_match(
        _get_val(resource, "availability_date", "availability"),
        _get_val(requirement, "required_by", "requiredDate")
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
        "distance_km": round(distance_km, 1) if distance_km is not None else 10.0,
        "breakdown": {
            "material": round(material_score * 100, 1),
            "distance": round(distance_score * 100, 1),
            "quantity": round(quantity_score * 100, 1),
            "quality": round(quality_score * 100, 1),
            "availability": round(availability_score * 100, 1),
        },
    }


# ---------------------------------------------------------------------------
# Full pipeline
# ---------------------------------------------------------------------------

def find_matches(
    requirement: Any,
    resources: Iterable[Any],
    min_score: float = 60.0,
) -> list[dict]:
    """
    Runs the full 3-layer pipeline against a list of candidate resources
    and returns matches sorted by score, highest first.
    """
    candidates = [r for r in resources if hard_filter(r, requirement)]

    scored = [
        {**calculate_match_score(r, requirement), "resource": r}
        for r in candidates
    ]

    return sorted(
        [s for s in scored if s["match_score"] >= min_score],
        key=lambda x: -x["match_score"],
    )
