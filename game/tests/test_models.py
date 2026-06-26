from django.test import SimpleTestCase

from game.models import Game


class IsActiveQuestionHtmlTests(SimpleTestCase):
    def _game(self, content):
        game = Game()
        game.data = [{"themes": [{"questions": [{"question_content": content}]}]}]
        game.active_question = {"round_id": 0, "theme_id": 0, "question_id": 0}
        return game

    def test_true_when_active_question_has_html_item(self):
        game = self._game([{"type": "html", "value": "mini.html"}])
        self.assertTrue(game.is_active_question_html())

    def test_true_when_html_mixed_with_other_content(self):
        game = self._game([
            {"type": "text", "value": "intro"},
            {"type": "html", "value": "mini.html"},
        ])
        self.assertTrue(game.is_active_question_html())

    def test_false_for_non_html_content(self):
        game = self._game([{"type": "video", "value": "clip.mp4"}])
        self.assertFalse(game.is_active_question_html())

    def test_false_when_no_active_question(self):
        game = Game()
        game.data = []
        game.active_question = {}
        self.assertFalse(game.is_active_question_html())
