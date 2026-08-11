import os
from unittest.mock import Mock, patch

from django.core.files.base import ContentFile
from django.test import SimpleTestCase

with patch.dict(
    os.environ,
    {
        "CLOUDINARY_CLOUD_NAME": "test-cloud",
        "CLOUDINARY_API_KEY": "test-key",
        "CLOUDINARY_API_SECRET": "test-secret",
    },
):
    from cloudinary_storage.storage import RESOURCE_TYPES

    from .storage import SkillBridgeCloudinaryStorage


class SkillBridgeCloudinaryStorageTests(SimpleTestCase):
    def setUp(self):
        self.storage = SkillBridgeCloudinaryStorage()

    def test_resource_type_matches_skillbridge_media(self):
        cases = {
            "student_profiles/student.jpg": RESOURCE_TYPES["IMAGE"],
            "mentor_profiles/mentor.png": RESOURCE_TYPES["IMAGE"],
            "startup_logos/startup.jpeg": RESOURCE_TYPES["IMAGE"],
            "student_resumes/student.pdf": RESOURCE_TYPES["RAW"],
            "application_resumes/application.pdf": RESOURCE_TYPES["RAW"],
        }

        for name, expected_resource_type in cases.items():
            with self.subTest(name=name):
                self.assertEqual(
                    self.storage._get_resource_type(name),
                    expected_resource_type,
                )

    @patch("cloudinary_storage.storage.cloudinary.uploader.upload")
    def test_save_uploads_pdf_as_raw(self, upload):
        upload.return_value = {"public_id": "student_resumes/student.pdf"}

        saved_name = self.storage.save(
            "student_resumes/student.pdf",
            ContentFile(b"pdf content"),
        )

        self.assertEqual(saved_name, "student_resumes/student.pdf")
        self.assertEqual(upload.call_args.kwargs["resource_type"], RESOURCE_TYPES["RAW"])

    @patch("cloudinary_storage.storage.cloudinary.uploader.upload")
    def test_save_uploads_image_as_image(self, upload):
        upload.return_value = {"public_id": "student_profiles/student"}

        self.storage.save(
            "student_profiles/student.jpg",
            ContentFile(b"image content"),
        )

        self.assertEqual(upload.call_args.kwargs["resource_type"], RESOURCE_TYPES["IMAGE"])

    @patch("cloudinary_storage.storage.cloudinary.CloudinaryResource")
    def test_url_uses_raw_resource_type_for_pdf(self, cloudinary_resource):
        cloudinary_resource.return_value.url = "https://example.invalid/resume.pdf"

        url = self.storage.url("student_resumes/student.pdf")

        self.assertEqual(url, "https://example.invalid/resume.pdf")
        cloudinary_resource.assert_called_once_with(
            "media/student_resumes/student.pdf",
            default_resource_type=RESOURCE_TYPES["RAW"],
        )

    @patch("cloudinary_storage.storage.requests.get")
    @patch("cloudinary_storage.storage.cloudinary.CloudinaryResource")
    def test_open_uses_raw_resource_url_for_pdf(self, cloudinary_resource, get):
        cloudinary_resource.return_value.url = "https://example.invalid/resume.pdf"
        response = Mock(status_code=200, content=b"pdf content")
        response.raise_for_status.return_value = None
        get.return_value = response

        opened_file = self.storage.open("application_resumes/application.pdf")

        self.assertEqual(opened_file.read(), b"pdf content")
        cloudinary_resource.assert_called_once_with(
            "media/application_resumes/application.pdf",
            default_resource_type=RESOURCE_TYPES["RAW"],
        )
        get.assert_called_once_with("https://example.invalid/resume.pdf")

    @patch("cloudinary_storage.storage.cloudinary.uploader.destroy")
    def test_delete_uses_raw_resource_type_for_pdf(self, destroy):
        destroy.return_value = {"result": "ok"}

        self.assertTrue(self.storage.delete("student_resumes/student.pdf"))

        destroy.assert_called_once_with(
            "student_resumes/student.pdf",
            invalidate=True,
            resource_type=RESOURCE_TYPES["RAW"],
        )

    @patch("cloudinary_storage.storage.requests.head")
    @patch("cloudinary_storage.storage.cloudinary.CloudinaryResource")
    def test_exists_uses_raw_resource_url_for_pdf(self, cloudinary_resource, head):
        cloudinary_resource.return_value.url = "https://example.invalid/resume.pdf"
        response = Mock(status_code=200)
        response.raise_for_status.return_value = None
        head.return_value = response

        self.assertTrue(self.storage.exists("student_resumes/student.pdf"))

        cloudinary_resource.assert_called_once_with(
            "media/student_resumes/student.pdf",
            default_resource_type=RESOURCE_TYPES["RAW"],
        )
        head.assert_called_once_with("https://example.invalid/resume.pdf")
