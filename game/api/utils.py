import os
import shutil
import xml.etree.ElementTree as ET
import zipfile
from urllib.parse import unquote

from django.conf import settings
from django.core.exceptions import SuspiciousOperation
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage


def _safe_extractall(zip_ref, target_dir):
    """Extract a zip while rejecting members that escape ``target_dir`` (Zip Slip)."""
    target_root = os.path.realpath(target_dir)
    for member in zip_ref.namelist():
        member_path = os.path.realpath(os.path.join(target_dir, member))
        if member_path != target_root and not member_path.startswith(target_root + os.sep):
            raise SuspiciousOperation(f"Unsafe path in uploaded archive: {member!r}")
    zip_ref.extractall(target_dir)


def parse_and_save_files_from_zip(temp_uploaded_file, game_id):
    with zipfile.ZipFile(temp_uploaded_file, 'r') as zip_ref:
        # Extract the contents of the zip file
        extraction_folder = f'/tmp/game_files/{game_id}/'
        _safe_extractall(zip_ref, extraction_folder)

        # Get the paths to the media directories bundled in the pack
        video_dir = os.path.join(extraction_folder, 'Video')
        audio_dir = os.path.join(extraction_folder, 'Audio')
        images_dir = os.path.join(extraction_folder, 'Images')
        html_dir = os.path.join(extraction_folder, 'Html')

        # Save files from the directories to Django's media directory
        save_files_to_static(video_dir, f'{game_id}/videos')
        save_files_to_static(audio_dir, f'{game_id}/audios')
        save_files_to_static(images_dir, f'{game_id}/images')
        save_files_to_static(html_dir, f'{game_id}/html')

        # Delete the temporary extracted folder
        shutil.rmtree(extraction_folder)


def save_files_to_static(source_dir, destination_subdir):
    print(destination_subdir)
    for root, _, files in os.walk(source_dir):
        for file in files:
            print(file)
            source_path = os.path.join(root, file)
            # basename() neutralizes any path separators that unquote() may reintroduce
            safe_name = os.path.basename(unquote(file))
            destination_path = os.path.join(settings.MEDIA_ROOT, destination_subdir, safe_name)

            # Create necessary subdirectories if they don't exist
            os.makedirs(os.path.dirname(destination_path), exist_ok=True)

            # Read the file content and save it using Django's storage
            with open(source_path, 'rb') as f:
                content = f.read()
                destination_file = default_storage.open(destination_path, 'wb')
                destination_file.write(content)
                destination_file.close()


# SIGame content-item types -> the types the frontend (question.js/answer.js)
# knows how to render. Image/video/text pass through unchanged.
_ITEM_TYPE_MAP = {'audio': 'voice', 'say': 'text'}


def _map_item_type(raw_type):
    return _ITEM_TYPE_MAP.get(raw_type, raw_type)


def _items_from_param(param_elem):
    """Build content entries from a v5 ``<param>``'s ``<item>`` children."""
    items = []
    for item in param_elem.findall('{*}item'):
        value = (item.text or '').strip()
        if not value:
            continue
        items.append({'type': _map_item_type(item.get('type', 'text')), 'value': value})
    return items


def _answer_text(question_elem):
    """The displayed answer: the first ``<answer>`` under ``<right>`` (v5), else any."""
    right = question_elem.find('{*}right')
    if right is not None:
        answer = right.find('{*}answer')
        if answer is not None and answer.text:
            return answer.text
    answer = question_elem.find('.//{*}answer')
    return answer.text if answer is not None else ''


def _parse_question(question_elem):
    question_data = {
        'question_content': [],
        'price': question_elem.attrib['price'],
        'answer': _answer_text(question_elem),
        'answer_content': [],
    }

    params = question_elem.find('{*}params')
    if params is not None:
        # Newer SIGame (package version 5+): <params>/<param name="..."><item>
        for param in params.findall('{*}param'):
            if param.get('name') == 'question':
                question_data['question_content'] = _items_from_param(param)
            elif param.get('name') == 'answer':
                question_data['answer_content'] = _items_from_param(param)
    else:
        # Legacy format: a flat list of <atom>, with a type="marker" atom
        # separating the question content from the answer content.
        content_type = 'question_content'
        for atom in question_elem.findall('.//{*}atom'):
            if atom.get('type') == 'marker':
                content_type = 'answer_content'
                continue
            if atom.text:
                question_data[content_type].append({
                    'type': _map_item_type(atom.get('type', 'text')),
                    'value': atom.text,
                })

    return question_data


def parse_content_xml_from_zip(temp_uploaded_file):
    parsed_data = []

    with zipfile.ZipFile(temp_uploaded_file, 'r') as zip_ref:
        with zip_ref.open('content.xml') as xml_file:
            tree = ET.parse(xml_file)
            root = tree.getroot()

            # Iterate through rounds, themes, and questions
            for round_elem in root.findall('.//{*}round'):
                round_data = {'name': round_elem.attrib['name'], 'themes': []}

                for theme_elem in round_elem.findall('.//{*}theme'):
                    theme_data = {'name': theme_elem.attrib['name'], 'questions': []}

                    for question_elem in theme_elem.findall('.//{*}question'):
                        theme_data['questions'].append(_parse_question(question_elem))

                    round_data['themes'].append(theme_data)

                parsed_data.append(round_data)

    return parsed_data

