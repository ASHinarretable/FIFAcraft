import pandas as pd
import json
import os

def main():
    csv_path = r"c:\Users\Atharva Pawar\OneDrive\Desktop\2025 Tech\FIFA Predictor\archive (14)\players_20.csv"
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} does not exist.")
        return

    print("Loading dataset...")
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=['overall'])

    # Standardize empty clubs/nationalities
    df['club'] = df['club'].fillna('').astype(str).str.strip()
    df['nationality'] = df['nationality'].fillna('').astype(str).str.strip()

    # Pre-calculate clubs
    clubs_data = {}
    print("Processing clubs...")
    for club, group in df.groupby('club'):
        if not club:
            continue
        # We only consider clubs with at least 11 players
        if len(group) < 11:
            continue
        top18 = group.nlargest(18, 'overall')
        avg_rating = round(top18['overall'].mean(), 2)
        
        # Get top 5 players (names and ratings) for scoring events
        top_players = group.nlargest(5, 'overall')[['short_name', 'overall', 'player_positions']].to_dict(orient='records')
        
        clubs_data[club] = {
            "name": club,
            "type": "club",
            "rating": avg_rating,
            "top_players": top_players
        }

    # Pre-calculate nations
    nations_data = {}
    print("Processing national teams...")
    for nation, group in df.groupby('nationality'):
        if not nation:
            continue
        # We only consider nations with at least 11 players
        if len(group) < 11:
            continue
        top18 = group.nlargest(18, 'overall')
        avg_rating = round(top18['overall'].mean(), 2)
        
        # Get top 5 players
        top_players = group.nlargest(5, 'overall')[['short_name', 'overall', 'player_positions']].to_dict(orient='records')
        
        nations_data[nation] = {
            "name": nation,
            "type": "nation",
            "rating": avg_rating,
            "top_players": top_players
        }

    # Merge data
    output_data = {
        "clubs": clubs_data,
        "nations": nations_data
    }

    output_path = r"c:\Users\Atharva Pawar\OneDrive\Desktop\2025 Tech\FIFA Predictor\teams_data.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"Dataset generated successfully! Saved to {output_path}")

if __name__ == "__main__":
    main()
