"""
impact_calculator.py (v2 — sourced data)
------------------------------------------
Circula Impact Engine

CO2e factors below are derived from the US EPA Waste Reduction Model
(WARM), Version 16, December 2023 — the standard US government tool for
comparing recycling vs. landfill GHG impact. Source:
https://www.epa.gov/waste-reduction-model
https://www.epa.gov/system/files/documents/2023-12/warm_containers_packaging_and_non-durable_goods_materials_v16_dec.pdf

Method: WARM publishes "GHG Emissions per Ton of Material Recycled" and
"...Landfilled" (both in MTCO2E per US short ton = 907.185 kg). The net
CO2e avoided by recycling instead of landfilling = recycled_value -
landfilled_value (per EPA's own worked example for aluminum:
https://www.epa.gov/waste-reduction-model/basic-information-about-waste-reduction-model).
That net figure is converted below to kg CO2e avoided per kg of material.

CONFIDENCE LABELS (be upfront about this in a demo/report):
- co2e_per_kg: HIGH confidence — sourced directly from EPA WARM v16.
- water_l_per_kg: LOW-MEDIUM confidence — no single authoritative
  per-kg dataset exists; figures below are back-calculated from
  industry-reported PERCENTAGE reductions (e.g. steel recycling uses
  ~40% less water than virgin production), applied to typical virgin
  water-footprint estimates. Treat as directional, not precise, until
  replaced with a proper water-footprint LCA source (e.g. Water
  Footprint Network, or a material-specific ISO 14046 study).
- disposal_cost_per_kg: LOW confidence — highly region/market
  dependent (local landfill tipping fees + scrap value vary a lot by
  country/state). Replace with your local municipal tipping fee data
  for a more defensible number.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Any


SHORT_TON_TO_KG = 907.185


@dataclass
class MaterialFactor:
    co2e_per_kg: float          # kg CO2e avoided per kg reused (HIGH confidence — EPA WARM v16)
    water_l_per_kg: float       # litres saved per kg reused (LOW-MEDIUM confidence — see note above)
    disposal_cost_per_kg: float # currency saved per kg diverted (LOW confidence — set to local rate)
    source_note: str


# ---------------------------------------------------------------------------
# CO2e: net MTCO2E avoided per short ton (recycled - landfilled), from
# EPA WARM v16 Appendix / GHG Emission Factors tables, converted to kg/kg.
#   Aluminum Cans:  -8.89 recycled, 0.05 landfilled -> net 8.94/ton -> 9.85 kg/kg
#   Copper Wire:    -7.26 recycled, 0.04 landfilled -> net 7.30/ton -> 8.05 kg/kg
#   Steel Cans:     -3.18 recycled, 0.04 landfilled -> net 3.22/ton -> 3.55 kg/kg
#   Glass:          -0.53 recycled, 0.04 landfilled -> net 0.57/ton -> 0.63 kg/kg
#   HDPE:           -1.47 recycled, 0.04 landfilled -> net 1.51/ton -> 1.66 kg/kg
#   PET:            -2.22 recycled, 0.04 landfilled -> net 2.26/ton -> 2.49 kg/kg
#   Corrugated/paper: -5.59 recycled, -0.76 landfilled -> net 4.83/ton -> 5.32 kg/kg
# ---------------------------------------------------------------------------

MATERIAL_FACTORS: dict[str, MaterialFactor] = {
    "aluminium": MaterialFactor(
        co2e_per_kg=9.85, water_l_per_kg=110.0, disposal_cost_per_kg=15.0,
        source_note="EPA WARM v16 (aluminum cans, recycled vs landfilled)",
    ),
    "aluminum": MaterialFactor(
        co2e_per_kg=9.85, water_l_per_kg=110.0, disposal_cost_per_kg=15.0,
        source_note="EPA WARM v16 (aluminum cans, recycled vs landfilled)",
    ),
    "copper": MaterialFactor(
        co2e_per_kg=8.05, water_l_per_kg=70.0, disposal_cost_per_kg=18.0,
        source_note="EPA WARM v16 (copper wire, recycled vs landfilled)",
    ),
    "steel": MaterialFactor(
        co2e_per_kg=3.55, water_l_per_kg=35.0, disposal_cost_per_kg=10.0,
        source_note="EPA WARM v16 (steel cans, recycled vs landfilled)",
    ),
    "plastic": MaterialFactor(
        co2e_per_kg=2.08, water_l_per_kg=18.0, disposal_cost_per_kg=12.0,
        source_note="EPA WARM v16 (avg of HDPE 1.66 kg/kg and PET 2.49 kg/kg)",
    ),
    "hdpe": MaterialFactor(
        co2e_per_kg=1.66, water_l_per_kg=15.0, disposal_cost_per_kg=12.0,
        source_note="EPA WARM v16 (HDPE, recycled vs landfilled)",
    ),
    "pet": MaterialFactor(
        co2e_per_kg=2.49, water_l_per_kg=20.0, disposal_cost_per_kg=12.0,
        source_note="EPA WARM v16 (PET, recycled vs landfilled)",
    ),
    "paper": MaterialFactor(
        co2e_per_kg=5.32, water_l_per_kg=45.0, disposal_cost_per_kg=8.0,
        source_note="EPA WARM v16 (corrugated containers, recycled vs landfilled)",
    ),
    "glass": MaterialFactor(
        co2e_per_kg=0.63, water_l_per_kg=8.0, disposal_cost_per_kg=6.0,
        source_note="EPA WARM v16 (glass, recycled vs landfilled)",
    ),
}

DEFAULT_FACTOR = MaterialFactor(
    co2e_per_kg=2.0, water_l_per_kg=20.0, disposal_cost_per_kg=10.0,
    source_note="fallback — material not in known factor table, treat as low confidence",
)

TRANSPORT_EMISSION_FACTOR = 0.00012  # kg CO2e per kg per km, road freight, rough average


def _lookup_factor(material_type: str) -> MaterialFactor:
    normalized = material_type.strip().lower()
    for key, factor in MATERIAL_FACTORS.items():
        if key in normalized:
            return factor
    return DEFAULT_FACTOR


@dataclass
class TransactionImpact:
    material_type: str
    quantity_kg: float
    waste_diverted_tons: float
    co2e_avoided_kg: float
    transport_emissions_kg: float
    net_co2e_avoided_kg: float
    water_saved_litres: float
    disposal_cost_avoided: float
    source_note: str


def calculate_transaction_impact(
    material_type: str,
    quantity_kg: float,
    distance_km: float = 0.0,
) -> TransactionImpact:
    factor = _lookup_factor(material_type)

    waste_diverted_tons = quantity_kg / 1000
    co2e_avoided = quantity_kg * factor.co2e_per_kg
    transport_emissions = quantity_kg * distance_km * TRANSPORT_EMISSION_FACTOR
    net_co2e_avoided = max(0.0, co2e_avoided - transport_emissions)
    water_saved = quantity_kg * factor.water_l_per_kg
    disposal_cost_avoided = quantity_kg * factor.disposal_cost_per_kg

    return TransactionImpact(
        material_type=material_type,
        quantity_kg=quantity_kg,
        waste_diverted_tons=round(waste_diverted_tons, 3),
        co2e_avoided_kg=round(co2e_avoided, 2),
        transport_emissions_kg=round(transport_emissions, 2),
        net_co2e_avoided_kg=round(net_co2e_avoided, 2),
        water_saved_litres=round(water_saved, 1),
        disposal_cost_avoided=round(disposal_cost_avoided, 2),
        source_note=factor.source_note,
    )


def aggregate_company_impact(impact_rows: Iterable[Any]) -> dict:
    total_waste_tons = total_co2e_kg = total_water_l = total_cost_saved = 0.0
    transaction_count = 0
    for row in impact_rows:
        total_waste_tons += row.waste_diverted_tons
        total_co2e_kg += row.net_co2e_avoided_kg
        total_water_l += row.water_saved_litres
        total_cost_saved += row.disposal_cost_avoided
        transaction_count += 1

    return {
        "waste_diverted_tons": round(total_waste_tons, 2),
        "co2e_avoided_tons": round(total_co2e_kg / 1000, 2),
        "water_saved_litres": round(total_water_l, 0),
        "disposal_cost_avoided": round(total_cost_saved, 2),
        "completed_transactions": transaction_count,
    }
