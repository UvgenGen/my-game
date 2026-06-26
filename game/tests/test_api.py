from django.contrib.auth.models import User
from django.test import TestCase

from game.models import Game, Player
from game.tests.helpers import make_siq_upload


class GameApiSmokeTests(TestCase):
    def setUp(self):
        self.creator = User.objects.create_user("creator", password="pw")
        self.other = User.objects.create_user("other", password="pw")

    def test_create_game_parses_siq(self):
        self.client.force_login(self.creator)
        resp = self.client.post(
            "/game/api/",
            {
                "title": "My Game",
                "password": "secret",
                "max_player_count": 5,
                "file": make_siq_upload(),
            },
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        game = Game.objects.get()
        self.assertEqual(game.creator, self.creator)
        # data was populated by parse_content_xml_from_zip
        self.assertEqual(game.data[0]["name"], "Round 1")
        self.assertEqual(
            game.data[0]["themes"][0]["questions"][0]["answer"], "Answer text"
        )

    def test_create_game_requires_auth(self):
        resp = self.client.post(
            "/game/api/",
            {"title": "X", "password": "p", "max_player_count": 5, "file": make_siq_upload()},
        )
        self.assertIn(resp.status_code, (401, 403))

    def test_list_games(self):
        Game.objects.create(
            title="G", password="p", max_player_count=5,
            creator=self.creator, state="SELECT_ACTIVE_USER",
        )
        resp = self.client.get("/game/api/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 1)

    def test_detail_excludes_password(self):
        game = Game.objects.create(
            title="G", password="p", max_player_count=5,
            creator=self.creator, state="SELECT_ACTIVE_USER",
        )
        resp = self.client.get(f"/game/api/{game.id}")
        self.assertEqual(resp.status_code, 200)
        self.assertNotIn("password", resp.json())

    def test_join_game_wrong_password(self):
        game = Game.objects.create(
            title="G", password="right", max_player_count=5,
            creator=self.creator, state="SELECT_ACTIVE_USER",
        )
        self.client.force_login(self.other)
        resp = self.client.put(
            f"/game/api/join/{game.id}",
            data={"password": "wrong"},
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_join_game_correct_password(self):
        game = Game.objects.create(
            title="G", password="right", max_player_count=5,
            creator=self.creator, state="SELECT_ACTIVE_USER",
        )
        self.client.force_login(self.other)
        resp = self.client.put(
            f"/game/api/join/{game.id}",
            data={"password": "right"},
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(game.players.filter(user=self.other).exists())

    def test_user_id_endpoint(self):
        self.client.force_login(self.creator)
        resp = self.client.get("/profiles/api/user_id")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["user_id"], self.creator.id)
