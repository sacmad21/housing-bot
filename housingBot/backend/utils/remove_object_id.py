from typing import Dict
from bson import ObjectId


# Function to remove ObjectId
def remove_object_ids(data: Dict):
    """
    Utility package to remove object id record from a dict
    """
    if isinstance(data, dict):
        return {
            k: remove_object_ids(v)
            for k, v in data.items()
            if not isinstance(v, ObjectId)
        }
    elif isinstance(data, list):
        return [remove_object_ids(v) for v in data]
    return data
