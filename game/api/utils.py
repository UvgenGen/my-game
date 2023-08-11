import xml.etree.ElementTree as ET
import zipfile


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
                            'question_texts': [],
                            'price': question_elem.attrib['price'],
                            'answer': question_elem.find('.//{*}answer').text
                        }
                        for atom in question_elem.findall('.//{*}atom'):
                            if atom.text:
                                question_data['question_texts'].append(atom.text)
                        theme_data['questions'].append(question_data)

                    round_data['themes'].append(theme_data)

                parsed_data.append(round_data)

    return parsed_data

