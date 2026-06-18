"""
Predictor engine module for FIFACraft.
Provides ratings loading, match simulation, and probability calculations.
"""

import json
import random
import math
import os
import logging
from typing import Dict, List, Any, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEAMS_DATA_PATH = os.path.join(BASE_DIR, "data", "teams_data.json")
BASE_ATTACK_CHANCE = 0.04
ATTACK_SENSITIVITY = 200.0
MIN_ATTACK_CHANCE = 0.01
MAX_ATTACK_CHANCE = 0.08
GOAL_SUCCESS_PROB = 0.35
SAVE_SUCCESS_PROB = 0.70

def load_teams_data(path: str = TEAMS_DATA_PATH) -> Dict[str, Any]:
    """
    Loads clubs and nations data from the teams JSON database.
    
    Args:
        path: Path to the JSON data file.
        
    Returns:
        Dict containing clubs and nations datasets.
    """
    if not os.path.exists(path):
        logger.warning(f"Database file not found at {path}. Returning empty dataset.")
        return {"clubs": {}, "nations": {}}
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"Failed to read/parse dataset at {path}: {str(e)}")
        return {"clubs": {}, "nations": {}}

def get_team_info(teams_data: Dict[str, Any], name: str) -> Optional[Dict[str, Any]]:
    """
    Looks up a team's metadata and ratings by name in the dataset.
    
    Args:
        teams_data: Preloaded teams dictionary.
        name: Name of the team to search for.
        
    Returns:
        Team dict if found, else None.
    """
    name_stripped = name.strip()
    # Search in clubs first, then nations
    if name_stripped in teams_data.get("clubs", {}):
        return teams_data["clubs"][name_stripped]
    if name_stripped in teams_data.get("nations", {}):
        return teams_data["nations"][name_stripped]
    return None

def predict_match(team_a_name: str, team_b_name: str, data_path: str = TEAMS_DATA_PATH) -> Dict[str, Any]:
    """
    Simulates a match outcome and computes probabilities based on team ratings.
    
    Args:
        team_a_name: Name of the home team.
        team_b_name: Name of the away team.
        data_path: Path to the teams data JSON file.
        
    Returns:
        Dict containing simulation events, goals, and win/loss/draw probabilities.
        
    Raises:
        ValueError: If one of the teams cannot be found in the database.
    """
    teams_data = load_teams_data(data_path)
    team_a = get_team_info(teams_data, team_a_name)
    team_b = get_team_info(teams_data, team_b_name)

    if not team_a or not team_b:
        missing = []
        if not team_a: missing.append(team_a_name)
        if not team_b: missing.append(team_b_name)
        raise ValueError(f"Team(s) not found in dataset: {', '.join(missing)}")

    r_a: float = team_a["rating"]
    r_b: float = team_b["rating"]

    # Elo-based Win/Draw/Loss probabilities
    diff = r_a - r_b
    
    # Sigmoid function for base win probability of team A
    prob_a_win = 1.0 / (1.0 + math.exp(-diff / 8.0))
    # Gaussian-like curve for draw probability depending on rating closeness
    prob_draw = 0.26 * math.exp(-((diff / 12.0) ** 2))
    
    # Re-normalize to sum to exactly 1.0
    p_a = prob_a_win * (1.0 - prob_draw)
    p_b = (1.0 - prob_a_win) * (1.0 - prob_draw)
    p_d = prob_draw
    
    total = p_a + p_b + p_d
    win_prob_a = round((p_a / total) * 100, 1)
    win_prob_b = round((p_b / total) * 100, 1)
    draw_prob = round((p_d / total) * 100, 1)

    # Simulation setup
    events: List[Dict[str, Any]] = []
    score_a = 0
    score_b = 0
    
    # Fetch key players for event descriptions
    players_a = [p["short_name"] for p in team_a.get("top_players", [])]
    players_b = [p["short_name"] for p in team_b.get("top_players", [])]

    # Pad names if dataset top_players list is short
    for i in range(len(players_a), 3):
        players_a.append(f"Player A{i+1}")
    for i in range(len(players_b), 3):
        players_b.append(f"Player B{i+1}")

    # Dynamic attack rates
    attack_chance_a = max(MIN_ATTACK_CHANCE, min(MAX_ATTACK_CHANCE, BASE_ATTACK_CHANCE + (diff / ATTACK_SENSITIVITY)))
    attack_chance_b = max(MIN_ATTACK_CHANCE, min(MAX_ATTACK_CHANCE, BASE_ATTACK_CHANCE - (diff / ATTACK_SENSITIVITY)))

    events.append({
        "minute": 0, 
        "type": "start", 
        "description": f"⚔️ The match between {team_a_name} and {team_b_name} has started!"
    })
    
    half_time_done = False

    for minute in range(1, 91):
        if minute == 45 and not half_time_done:
            events.append({
                "minute": 45,
                "type": "half_time",
                "score_a": score_a,
                "score_b": score_b,
                "description": f"⏸️ Half Time! {team_a_name} {score_a} - {score_b} {team_b_name}"
            })
            half_time_done = True
            continue

        # Check for attacks
        if random.random() < attack_chance_a:
            roll = random.random()
            scorer = random.choice(players_a)
            if roll < GOAL_SUCCESS_PROB:
                score_a += 1
                events.append({
                    "minute": minute,
                    "type": "goal_a",
                    "score_a": score_a,
                    "score_b": score_b,
                    "player": scorer,
                    "description": f"⚽ GOAL! {scorer} scores for {team_a_name}! ({score_a}-{score_b})"
                })
            elif roll < SAVE_SUCCESS_PROB:
                keeper_action = random.choice(["makes a heroic block", "leaps and saves", "catches the ball cleanly"])
                events.append({
                    "minute": minute,
                    "type": "save_b",
                    "description": f"🛡️ Shot by {scorer}! The {team_b_name} keeper {keeper_action}!"
                })
            else:
                events.append({
                    "minute": minute,
                    "type": "miss_a",
                    "description": f"💨 {scorer} fires it wide of the post!"
                })

        elif random.random() < attack_chance_b:
            roll = random.random()
            scorer = random.choice(players_b)
            if roll < GOAL_SUCCESS_PROB:
                score_b += 1
                events.append({
                    "minute": minute,
                    "type": "goal_b",
                    "score_a": score_a,
                    "score_b": score_b,
                    "player": scorer,
                    "description": f"⚽ GOAL! {scorer} scores for {team_b_name}! ({score_a}-{score_b})"
                })
            elif roll < SAVE_SUCCESS_PROB:
                keeper_action = random.choice(["makes a heroic block", "leaps and saves", "catches the ball cleanly"])
                events.append({
                    "minute": minute,
                    "type": "save_a",
                    "description": f"🛡️ Shot by {scorer}! The {team_a_name} keeper {keeper_action}!"
                })
            else:
                events.append({
                    "minute": minute,
                    "type": "miss_b",
                    "description": f"💨 {scorer} shoots, but it flies over the crossbar!"
                })
                
        # Card and Foul events
        elif random.random() < 0.015:
            fault_team = team_a_name if random.random() < 0.5 else team_b_name
            player = random.choice(players_a if fault_team == team_a_name else players_b)
            event_type = random.choice(["yellow", "foul"])
            if event_type == "yellow":
                events.append({
                    "minute": minute,
                    "type": "yellow",
                    "description": f"🟨 Yellow card shown to {player} ({fault_team}) for a hard tackle!"
                })
            else:
                events.append({
                    "minute": minute,
                    "type": "foul",
                    "description": f"💥 Foul in the midfield! {player} ({fault_team}) goes down."
                })

    events.append({
        "minute": 90,
        "type": "full_time",
        "score_a": score_a,
        "score_b": score_b,
        "description": f"🏁 Full Time! {team_a_name} {score_a} - {score_b} {team_b_name}"
    })

    return {
        "team_a": {
            "name": team_a_name,
            "rating": r_a,
            "win_probability": win_prob_a
        },
        "team_b": {
            "name": team_b_name,
            "rating": r_b,
            "win_probability": win_prob_b
        },
        "draw_probability": draw_prob,
        "score_a": score_a,
        "score_b": score_b,
        "events": events
    }
