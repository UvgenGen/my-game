import io
import zipfile

from django.core.exceptions import SuspiciousOperation
from django.test import SimpleTestCase

from game.api.utils import _safe_extractall, parse_content_xml_from_zip
from game.tests.helpers import make_siq_upload, make_siq_upload_v5


class ParseContentXmlTests(SimpleTestCase):
    def test_parses_legacy_atom_format(self):
        data = parse_content_xml_from_zip(make_siq_upload(question="Q text", answer="A text"))
        question = data[0]["themes"][0]["questions"][0]
        self.assertEqual(question["answer"], "A text")
        self.assertEqual(question["question_content"], [{"type": "text", "value": "Q text"}])

    def test_parses_v5_params_item_format(self):
        data = parse_content_xml_from_zip(make_siq_upload_v5())
        question = data[0]["themes"][0]["questions"][0]

        self.assertEqual(question["price"], "100")
        self.assertEqual(question["answer"], "Right Answer")
        # question content: video item + spoken-text item (say -> text)
        self.assertEqual(
            question["question_content"],
            [
                {"type": "video", "value": "q_clip.mp4"},
                {"type": "html", "value": "mini_game.html"},
                {"type": "text", "value": "Name this game"},
            ],
        )
        # answer content: image item + audio item (audio -> voice, matching the frontend)
        self.assertEqual(
            question["answer_content"],
            [
                {"type": "image", "value": "a_pic.avif"},
                {"type": "voice", "value": "a_sound.mp3"},
            ],
        )


class SafeExtractAllTests(SimpleTestCase):
    def _zip_with(self, *names):
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            for name in names:
                zf.writestr(name, "data")
        buf.seek(0)
        return zipfile.ZipFile(buf)

    def test_rejects_parent_traversal(self):
        with self._zip_with("../evil.txt") as zf:
            with self.assertRaises(SuspiciousOperation):
                _safe_extractall(zf, "/tmp/game_files/test/")

    def test_rejects_absolute_path(self):
        with self._zip_with("/etc/passwd") as zf:
            with self.assertRaises(SuspiciousOperation):
                _safe_extractall(zf, "/tmp/game_files/test/")
