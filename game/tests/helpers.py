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
    """Return a SimpleUploadedFile holding a minimal valid (legacy) .siq package."""
    xml = _CONTENT_XML.format(question=question, answer=answer)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("content.xml", xml)
    buf.seek(0)
    return SimpleUploadedFile("game.siq", buf.read(), content_type="application/zip")


# Newer SIGame (package version 5) format: question/answer content lives in
# <params>/<param name="..."><item type="...">, NOT in <atom> elements, and the
# answer text is under <right>/<answer>.
_CONTENT_XML_V5 = """<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://vladimirkhil.com/ygpackage3.0.xsd" name="V5 Pack" version="5">
  <rounds>
    <round name="Round 1">
      <themes>
        <theme name="Theme 1">
          <questions>
            <question price="100">
              <params>
                <param name="question" type="content">
                  <item type="video" isRef="True">q_clip.mp4</item>
                  <item type="html" isRef="True" duration="00:00:01">mini_game.html</item>
                  <item type="say">Name this game</item>
                </param>
                <param name="answer" type="content">
                  <item type="image" isRef="True">a_pic.avif</item>
                  <item type="audio" isRef="True">a_sound.mp3</item>
                </param>
              </params>
              <right><answer>Right Answer</answer><answer>alt</answer></right>
              <wrong><answer>Nope</answer></wrong>
            </question>
          </questions>
        </theme>
      </themes>
    </round>
  </rounds>
</package>"""


def make_siq_upload_v5():
    """Return a SimpleUploadedFile holding a minimal SIGame v5 .siq package."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("content.xml", _CONTENT_XML_V5)
    buf.seek(0)
    return SimpleUploadedFile("game_v5.siq", buf.read(), content_type="application/zip")
