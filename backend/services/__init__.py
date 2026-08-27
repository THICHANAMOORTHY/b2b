# Services package
from .matching_engine import (
    get_model,
    material_similarity,
    find_matches,
    compute_embedding,
    calculate_match_score,
)
from .impact_calculator import (
    calculate_transaction_impact,
    aggregate_company_impact,
    MATERIAL_FACTORS,
    DEFAULT_FACTOR,
)
