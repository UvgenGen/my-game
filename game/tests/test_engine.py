from django.test import SimpleTestCase

from game import engine as e


def ctx(roles=(), user_id=1, payload=None, can_answer=False,
        has_responder=False):
    return e.Context(roles=frozenset(roles), user_id=user_id,
                     payload=payload or {}, can_answer=can_answer,
                     has_responder=has_responder)


class DecideTests(SimpleTestCase):
    # --- unknown / illegal ---
    def test_unknown_event_rejected(self):
        self.assertIsInstance(e.decide(e.SELECT_QUESTION, "nonsense", ctx()), e.Rejected)

    def test_event_in_wrong_state_rejected(self):
        # answering only legal from SHOW_QUESTION
        r = e.decide(e.SELECT_QUESTION, e.EV_ANSWERING, ctx(roles=[e.PLAYER], can_answer=True))
        self.assertIsInstance(r, e.Rejected)

    # --- set_active_player ---
    def test_set_active_player_ok(self):
        r = e.decide(e.SELECT_ACTIVE_USER, e.EV_SET_ACTIVE_PLAYER,
                     ctx(roles=[e.CREATOR], payload={"user_id": 7}))
        self.assertEqual(r.next_state, e.SELECT_QUESTION)
        self.assertEqual(r.effects, (e.ResetPlayers(), e.SetActivePlayer(7)))

    def test_set_active_player_requires_creator(self):
        r = e.decide(e.SELECT_ACTIVE_USER, e.EV_SET_ACTIVE_PLAYER,
                     ctx(roles=[e.PLAYER], payload={"user_id": 7}))
        self.assertIsInstance(r, e.Rejected)

    # --- show_question (cross-state OR guard) ---
    def test_show_question_by_creator(self):
        r = e.decide(e.ANSWERING, e.EV_SHOW_QUESTION,
                     ctx(roles=[e.CREATOR], payload={"round_id": 0, "theme_id": 1, "question_id": 2}))
        self.assertEqual(r.next_state, e.SHOW_QUESTION)
        self.assertEqual(
            r.effects,
            (e.ClearResponders(),
             e.SetActiveQuestion({"round_id": 0, "theme_id": 1, "question_id": 2})),
        )

    def test_show_question_in_select_question_state_without_role(self):
        r = e.decide(e.SELECT_QUESTION, e.EV_SHOW_QUESTION,
                     ctx(roles=[], payload={"round_id": 0, "theme_id": 0, "question_id": 0}))
        self.assertEqual(r.next_state, e.SHOW_QUESTION)

    def test_show_question_denied_without_role_or_state(self):
        r = e.decide(e.SHOW_ANSWER, e.EV_SHOW_QUESTION,
                     ctx(roles=[e.PLAYER], payload={"round_id": 0, "theme_id": 0, "question_id": 0}))
        self.assertIsInstance(r, e.Rejected)

    # --- answering ---
    def test_answering_ok(self):
        r = e.decide(e.SHOW_QUESTION, e.EV_ANSWERING, ctx(roles=[e.PLAYER], user_id=5, can_answer=True))
        self.assertEqual(r.next_state, e.ANSWERING)
        self.assertEqual(r.effects, (e.SetResponder(5),))

    def test_answering_denied_when_already_answered(self):
        r = e.decide(e.SHOW_QUESTION, e.EV_ANSWERING, ctx(roles=[e.PLAYER], can_answer=False))
        self.assertIsInstance(r, e.Rejected)

    # --- review_answer branches ---
    def test_review_answer_correct(self):
        r = e.decide(e.ANSWERING, e.EV_REVIEW_ANSWER,
                     ctx(roles=[e.CREATOR], has_responder=True,
                         payload={"is_correct": True, "price": "100"}))
        self.assertEqual(r.next_state, e.SHOW_ANSWER)
        self.assertEqual(r.effects, (e.ScoreResponder(100), e.PromoteResponderToActive()))

    def test_review_answer_incorrect(self):
        r = e.decide(e.ANSWERING, e.EV_REVIEW_ANSWER,
                     ctx(roles=[e.CREATOR], has_responder=True,
                         payload={"is_correct": False, "price": "100"}))
        self.assertEqual(r.next_state, e.SHOW_QUESTION)
        self.assertEqual(r.effects, (e.ScoreResponder(-100), e.MarkResponderAnswered()))

    def test_review_answer_no_responder_rejected(self):
        r = e.decide(e.ANSWERING, e.EV_REVIEW_ANSWER,
                     ctx(roles=[e.CREATOR], has_responder=False,
                         payload={"is_correct": True, "price": "100"}))
        self.assertIsInstance(r, e.Rejected)

    def test_review_answer_requires_creator(self):
        r = e.decide(e.ANSWERING, e.EV_REVIEW_ANSWER,
                     ctx(roles=[e.PLAYER], has_responder=True,
                         payload={"is_correct": True, "price": "100"}))
        self.assertIsInstance(r, e.Rejected)

    # --- show_answer ---
    def test_show_answer_from_show_question(self):
        r = e.decide(e.SHOW_QUESTION, e.EV_SHOW_ANSWER, ctx(roles=[e.PLAYER]))
        self.assertEqual(r.next_state, e.SHOW_ANSWER)
        self.assertEqual(r.effects, (e.ClearResponders(), e.ClearAnswered()))

    def test_show_answer_denied_in_select_question(self):
        r = e.decide(e.SELECT_QUESTION, e.EV_SHOW_ANSWER, ctx(roles=[e.CREATOR]))
        self.assertIsInstance(r, e.Rejected)

    # --- update_round / update_score / join ---
    def test_update_round_ok(self):
        r = e.decide(e.SHOW_ANSWER, e.EV_UPDATE_ROUND, ctx(roles=[e.CREATOR], payload={"round_id": 2}))
        self.assertEqual(r.next_state, e.SELECT_ACTIVE_USER)
        self.assertEqual(r.effects, (e.ResetPlayers(), e.SetActiveRound(2)))

    def test_update_score_keeps_state(self):
        r = e.decide(e.SHOW_QUESTION, e.EV_UPDATE_SCORE,
                     ctx(roles=[e.CREATOR], payload={"player_id": 3, "score": 500}))
        self.assertEqual(r.next_state, e.SHOW_QUESTION)
        self.assertEqual(r.effects, (e.SetScore(3, 500),))

    def test_update_score_requires_creator(self):
        r = e.decide(e.SHOW_QUESTION, e.EV_UPDATE_SCORE,
                     ctx(roles=[e.PLAYER], payload={"player_id": 3, "score": 500}))
        self.assertIsInstance(r, e.Rejected)

    def test_join_player_broadcast_only(self):
        r = e.decide(e.SHOW_QUESTION, e.EV_JOIN_PLAYER, ctx())
        self.assertEqual(r.next_state, e.SHOW_QUESTION)
        self.assertEqual(r.effects, ())

    # --- timeouts ---
    def test_question_timeout_to_show_answer(self):
        r = e.decide(e.SHOW_QUESTION, e.EV_QUESTION_TIMEOUT, ctx())
        self.assertEqual(r.next_state, e.SHOW_ANSWER)
        self.assertEqual(r.effects, (e.ClearResponders(), e.ClearAnswered()))

    def test_question_timeout_denied_when_not_active(self):
        r = e.decide(e.SELECT_QUESTION, e.EV_QUESTION_TIMEOUT, ctx())
        self.assertIsInstance(r, e.Rejected)

    def test_answer_timeout_to_select_question(self):
        r = e.decide(e.SHOW_ANSWER, e.EV_ANSWER_TIMEOUT, ctx())
        self.assertEqual(r.next_state, e.SELECT_QUESTION)
        self.assertEqual(r.effects, ())
