import os
import shutil
import xml.etree.ElementTree as ET
import zipfile
from urllib.parse import unquote

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage


def parse_and_save_files_from_zip(temp_uploaded_file, game_id):
    with zipfile.ZipFile(temp_uploaded_file, 'r') as zip_ref:
        # Extract the contents of the zip file
        extraction_folder = f'/tmp/game_files/{game_id}/'
        zip_ref.extractall(extraction_folder)

        # Get the paths to Video, Audio, and Images directories
        video_dir = os.path.join(extraction_folder, 'Video')
        audio_dir = os.path.join(extraction_folder, 'Audio')
        images_dir = os.path.join(extraction_folder, 'Images')

        # Save files from the directories to Django's static directory
        save_files_to_static(video_dir, f'{game_id}/videos')
        save_files_to_static(audio_dir, f'{game_id}/audios')
        save_files_to_static(images_dir, f'{game_id}/images')

        # Delete the temporary extracted folder
        shutil.rmtree(extraction_folder)


def save_files_to_static(source_dir, destination_subdir):
    print(destination_subdir)
    for root, _, files in os.walk(source_dir):
        for file in files:
            print(file)
            source_path = os.path.join(root, file)
            destination_path = os.path.join(settings.MEDIA_ROOT, destination_subdir, unquote(file))

            # Create necessary subdirectories if they don't exist
            os.makedirs(os.path.dirname(destination_path), exist_ok=True)

            # Read the file content and save it using Django's storage
            with open(source_path, 'rb') as f:
                content = f.read()
                destination_file = default_storage.open(destination_path, 'wb')
                destination_file.write(content)
                destination_file.close()


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
                        question_data = {
                            'question_content': [],
                            'price': question_elem.attrib['price'],
                            'answer': question_elem.find('.//{*}answer').text,
                            'answer_content': []
                        }
                        content_type = 'question_content'
                        for atom in question_elem.findall('.//{*}atom'):
                            if atom.get('type') == 'marker':
                                content_type = 'answer_content'
                                continue
                            if atom.text:
                                question_data[content_type].append({
                                    'type': atom.get('type', 'text'),
                                    'value': atom.text
                                })
                        theme_data['questions'].append(question_data)

                    round_data['themes'].append(theme_data)

                parsed_data.append(round_data)

    return parsed_data

