from pathlib import PurePosixPath

from cloudinary_storage.storage import MediaCloudinaryStorage, RESOURCE_TYPES


class SkillBridgeCloudinaryStorage(MediaCloudinaryStorage):
    def _get_resource_type(self, name):
        if PurePosixPath(name).suffix.lower() == ".pdf":
            return RESOURCE_TYPES["RAW"]
        return RESOURCE_TYPES["IMAGE"]
