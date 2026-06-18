"""
Unit tests for the match predictor engine.
"""

import unittest
import os
import tempfile
import json
import predictor

class TestPredictor(unittest.TestCase):
    
    def setUp(self):
        # Create a mock database file for testing
        self.mock_data = {
            "clubs": {
                "Mock FC Barcelona": {
                    "name": "Mock FC Barcelona",
                    "type": "club",
                    "rating": 86.11,
                    "top_players": [
                        {"short_name": "L. Messi", "overall": 94},
                        {"short_name": "L. Suarez", "overall": 89}
                    ]
                },
                "Mock Real Madrid": {
                    "name": "Mock Real Madrid",
                    "type": "club",
                    "rating": 85.94,
                    "top_players": [
                        {"short_name": "E. Hazard", "overall": 91},
                        {"short_name": "K. Benzema", "overall": 87}
                    ]
                }
            },
            "nations": {
                "Mock Brazil": {
                    "name": "Mock Brazil",
                    "type": "nation",
                    "rating": 86.06,
                    "top_players": [
                        {"short_name": "Neymar Jr", "overall": 92}
                    ]
                }
            }
        }
        
        self.temp_db = tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix='.json')
        json.dump(self.mock_data, self.temp_db)
        self.temp_db.flush()
        self.temp_db.close()

    def tearDown(self):
        # Clean up the mock database file
        if os.path.exists(self.temp_db.name):
            os.remove(self.temp_db.name)

    def test_load_teams_data(self):
        data = predictor.load_teams_data(self.temp_db.name)
        self.assertIn("clubs", data)
        self.assertIn("nations", data)
        self.assertIn("Mock FC Barcelona", data["clubs"])
        self.assertEqual(data["clubs"]["Mock FC Barcelona"]["rating"], 86.11)

    def test_get_team_info(self):
        data = self.mock_data
        team_info = predictor.get_team_info(data, "Mock FC Barcelona")
        self.assertIsNotNone(team_info)
        self.assertEqual(team_info["type"], "club")
        
        team_info_nation = predictor.get_team_info(data, "Mock Brazil")
        self.assertIsNotNone(team_info_nation)
        self.assertEqual(team_info_nation["type"], "nation")
        
        # Test case sensitivity/whitespace stripping
        team_info_strip = predictor.get_team_info(data, "  Mock Real Madrid   ")
        self.assertIsNotNone(team_info_strip)

        # Test invalid team
        team_info_none = predictor.get_team_info(data, "Invalid FC")
        self.assertIsNone(team_info_none)

    def test_predict_match_success(self):
        res = predictor.predict_match(
            "Mock FC Barcelona", 
            "Mock Real Madrid", 
            data_path=self.temp_db.name
        )
        
        self.assertEqual(res["team_a"]["name"], "Mock FC Barcelona")
        self.assertEqual(res["team_b"]["name"], "Mock Real Madrid")
        
        # Verify win + draw probabilities sum up roughly to 100
        prob_sum = res["team_a"]["win_probability"] + res["team_b"]["win_probability"] + res["draw_probability"]
        self.assertAlmostEqual(prob_sum, 100.0, places=1)
        
        # Verify event stream structure
        self.assertGreater(len(res["events"]), 0)
        self.assertEqual(res["events"][0]["type"], "start")
        self.assertEqual(res["events"][-1]["type"], "full_time")
        
        # Verify score logic consistency
        self.assertEqual(res["score_a"], res["events"][-1]["score_a"])
        self.assertEqual(res["score_b"], res["events"][-1]["score_b"])

    def test_predict_match_invalid_teams(self):
        with self.assertRaises(ValueError):
            predictor.predict_match(
                "Mock FC Barcelona", 
                "Missing FC", 
                data_path=self.temp_db.name
            )

if __name__ == '__main__':
    unittest.main()
