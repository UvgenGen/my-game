from django.contrib.auth.models import User
from django.test import TestCase

from game import engine
from game import services
from game.models import Game, Player


class ApplyEventTests(TestCase):
    def setUp(self):
        self.creator = User.objects.create_user("creator", password="pw")
        self.u1 = User.objects.create_user("u1", password="pw")
        self.game = Game.objects.create(
            title="G", password="p", max_player_count=5, creator=self.creator,
            state=engine.SELECT_ACTIVE_USER, active_round=0,
            data=[{"name": "R1", "themes": [
                {"name": "T1", "questions": [
                    {"question_content": [], "price": "100", "answer": "A",
                     "answer_content": [], "completed": False}]}]}],
        )
        self.p1 = Player.objects.create(user=self.u1)
        self.game.players.add(self.p1)

    def test_set_active_player_persists_and_transitions(self):
        res = services.apply_event(self.game.id, self.creator.id,
                                   engine.EV_SET_ACTIVE_PLAYER, {"user_id": self.u1.id})
        self.assertTrue(res.accepted)
        self.game.refresh_from_db()
        self.p1.refresh_from_db()
        self.assertEqual(self.game.state, engine.SELECT_QUESTION)
        self.assertTrue(self.p1.is_active)

    def test_non_creator_rejected_no_mutation(self):
        res = services.apply_event(self.game.id, self.u1.id,
                                   engine.EV_SET_ACTIVE_PLAYER, {"user_id": self.u1.id})
        self.assertFalse(res.accepted)
        self.game.refresh_from_db()
        self.assertEqual(self.game.state, engine.SELECT_ACTIVE_USER)  # unchanged

    def test_show_question_marks_completed_and_sets_active_question(self):
        self.game.state = engine.SELECT_QUESTION
        self.game.save()
        res = services.apply_event(self.game.id, self.creator.id, engine.EV_SHOW_QUESTION,
                                   {"round_id": 0, "theme_id": 0, "question_id": 0})
        self.assertTrue(res.accepted)
        self.game.refresh_from_db()
        self.assertEqual(self.game.state, engine.SHOW_QUESTION)
        self.assertTrue(self.game.data[0]["themes"][0]["questions"][0]["completed"])
        self.assertEqual(self.game.active_question["question_id"], 0)

    def test_review_answer_correct_scores_responder(self):
        # put a responder in ANSWERING
        self.game.state = engine.ANSWERING
        self.game.save()
        self.p1.is_responder = True
        self.p1.score = 0
        self.p1.save()
        res = services.apply_event(self.game.id, self.creator.id, engine.EV_REVIEW_ANSWER,
                                   {"is_correct": True, "price": "100"})
        self.assertTrue(res.accepted)
        self.p1.refresh_from_db()
        self.game.refresh_from_db()
        self.assertEqual(self.p1.score, 100)
        self.assertTrue(self.p1.is_active)
        self.assertFalse(self.p1.is_responder)
        self.assertEqual(self.game.state, engine.SHOW_ANSWER)

    def test_review_answer_incorrect_penalizes_and_marks_answered(self):
        self.game.state = engine.ANSWERING
        self.game.save()
        self.p1.is_responder = True
        self.p1.score = 50
        self.p1.save()
        res = services.apply_event(self.game.id, self.creator.id, engine.EV_REVIEW_ANSWER,
                                   {"is_correct": False, "price": "100"})
        self.assertTrue(res.accepted)
        self.p1.refresh_from_db()
        self.assertEqual(self.p1.score, -50)
        self.assertTrue(self.p1.answered)
        self.assertFalse(self.p1.is_responder)
        self.game.refresh_from_db()
        self.assertEqual(self.game.state, engine.SHOW_QUESTION)

    def test_update_score_sets_exact_score_without_state_change(self):
        res = services.apply_event(self.game.id, self.creator.id, engine.EV_UPDATE_SCORE,
                                   {"player_id": self.p1.id, "score": 777})
        self.assertTrue(res.accepted)
        self.p1.refresh_from_db()
        self.assertEqual(self.p1.score, 777)
        self.game.refresh_from_db()
        self.assertEqual(self.game.state, engine.SELECT_ACTIVE_USER)

    def test_fresh_state_used_not_stale(self):
        # Simulate another actor advancing state in the DB after game was created.
        Game.objects.filter(id=self.game.id).update(state=engine.SHOW_ANSWER)
        # answer_timeout is only valid from SHOW_ANSWER; if apply_event read fresh, it is accepted.
        res = services.apply_event(self.game.id, self.creator.id, engine.EV_ANSWER_TIMEOUT, {})
        self.assertTrue(res.accepted)
        self.game.refresh_from_db()
        self.assertEqual(self.game.state, engine.SELECT_QUESTION)
