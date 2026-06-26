import io
import zipfile

from django.core.files.uploadedfile import SimpleUploadedFile

# Matches the structure parse_content_xml_from_zip expects:
# .//round -> .//theme -> .//question (price attr) -> .//atom and .//answer
_CONTENT_XML = """<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://vladimirkhil.com/ygpackage3.0.xsd" name="Test Pack">
  <rounds>
    <round name="Round 1">
      <themes>
        <theme name="Theme 1">
          <questions>
            <question price="100">
              <scenario><atom>{question}</atom></scenario>
              <right><answer>{answer}</answer></right>
            </question>
          </questions>
        </theme>
      </themes>
    </round>
  </rounds>
</package>"""


def make_siq_upload(question="Question text", answer="Answer text"):
    """Return a SimpleUploadedFile holding a minimal valid .siq package."""
    xml = _CONTENT_XML.format(question=question, answer=answer)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("content.xml", xml)
    buf.seek(0)
    return SimpleUploadedFile("game.siq", buf.read(), content_type="application/zip")
