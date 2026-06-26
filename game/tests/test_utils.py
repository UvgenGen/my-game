import io
import zipfile

from django.core.exceptions import SuspiciousOperation
from django.test import SimpleTestCase

from game.api.utils import _safe_extractall


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
