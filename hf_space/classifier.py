"""
Vehicle Classification and Category Mapping Module for Hugging Face Space
Maps standard COCO detection classes into TollTrack's scientific vehicle categories.
Includes explicit transparency warnings regarding axle-level classification limitations.
"""

# Standard TollTrack vehicle categories matching emission factor registry
VALID_TOLLTRACK_CATEGORIES = [
    'Car / Jeep / Van',
    'Mini LCV',
    'LCV',
    'Bus',
    '2-Axle Truck',
    '3-Axle Truck',
    'Multi-Axle Vehicle / OSV',
    'Motorcycle / 2-Wheeler'
]

# Primary categories tracked at Chokkenahalli Toll Plaza
PRIMARY_TOLL_CATEGORIES = [
    'Car / Jeep / Van',
    'Mini LCV',
    'LCV',
    'Bus',
    '2-Axle Truck',
    '3-Axle Truck',
    'Multi-Axle Vehicle / OSV'
]

# COCO 80-class mapping to TollTrack categories
# COCO class IDs: 2: 'car', 3: 'motorcycle', 5: 'bus', 7: 'truck'
COCO_CLASS_MAPPING = {
    'car': {
        'target_category': 'Car / Jeep / Van',
        'category_code': 'CAR',
        'pcu_factor': 1.0,
        'requires_manual_refinement': False,
        'note': 'Standard 4-wheeled passenger vehicles, taxis, SUVs, and personal vans.'
    },
    'motorcycle': {
        'target_category': 'Motorcycle / 2-Wheeler',
        'category_code': 'TWO_WHEELER',
        'pcu_factor': 0.5,
        'requires_manual_refinement': False,
        'note': 'Two-wheelers / motorcycles. Note: NHAI national toll plazas generally exempt 2-wheelers under National Highways Fee Rules.'
    },
    'bus': {
        'target_category': 'Bus',
        'category_code': 'BUS',
        'pcu_factor': 3.0,
        'requires_manual_refinement': False,
        'note': 'Heavy commercial passenger buses (intercity and state transit coaches).'
    },
    'truck': {
        'target_category': '2-Axle Truck',
        'category_code': 'TRUCK_2AXLE',
        'pcu_factor': 3.0,
        'requires_manual_refinement': True,
        'note': 'Pretrained YOLO COCO weights identify generic "truck" without axle counting. Classified as 2-Axle Truck by default. Use manual override to reassign to 3-Axle, Multi-Axle, or LCV if applicable.'
    }
}

# Scientific disclaimer required by Objective 2
AXLE_CLASSIFICATION_DISCLAIMER = (
    "Pretrained YOLO models trained on MS COCO detect general vehicle classes ('car', 'motorcycle', 'bus', 'truck'). "
    "Pretrained vision weights cannot distinguish between 2-axle, 3-axle, or multi-axle freight configurations without "
    "specialized multi-camera axle induction sensors or custom-trained axle classification models. "
    "Detected trucks are classified as '2-Axle Truck' by default. You can manually adjust the category for any vehicle."
)


def map_coco_class(raw_class_name: str) -> dict:
    """
    Maps a raw COCO class name to TollTrack vehicle category specifications.
    """
    normalized = (raw_class_name or '').lower().strip()
    if normalized in COCO_CLASS_MAPPING:
        mapping = COCO_CLASS_MAPPING[normalized]
        return {
            'mapped_category': mapping['target_category'],
            'category_code': mapping['category_code'],
            'pcu_factor': mapping['pcu_factor'],
            'requires_manual_refinement': mapping['requires_manual_refinement'],
            'classification_note': mapping['note']
        }

    # Fallback for unrecognized classes
    return {
        'mapped_category': 'Car / Jeep / Van',
        'category_code': 'CAR',
        'pcu_factor': 1.0,
        'requires_manual_refinement': True,
        'classification_note': f"Unmapped class '{raw_class_name}' defaulted to Car / Jeep / Van."
    }


def aggregate_counts_by_category(detections: list) -> dict:
    """
    Aggregates list of detection items into category counts.
    Input item structure: {'id': ..., 'category': 'Car / Jeep / Van', ...}
    """
    counts = {cat: 0 for cat in VALID_TOLLTRACK_CATEGORIES}
    for item in detections:
        cat = item.get('category')
        if cat in counts:
            counts[cat] += 1
        else:
            # Map unrecognized category to Car
            counts['Car / Jeep / Van'] += 1
    return counts

