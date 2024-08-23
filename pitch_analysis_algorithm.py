import random

# Define pitch types and their characteristics
PITCH_TYPES = {
    'green': {'moisture': 'high', 'grass_cover': 'high', 'bounce': 'variable', 'turn': 'low'},
    'flat_track': {'moisture': 'low', 'grass_cover': 'low', 'bounce': 'consistent', 'turn': 'low'},
    'dry': {'moisture': 'low', 'grass_cover': 'low', 'bounce': 'low', 'turn': 'high'},
    'wet': {'moisture': 'high', 'grass_cover': 'medium', 'bounce': 'unpredictable', 'turn': 'low'},
    'dusty': {'moisture': 'low', 'grass_cover': 'low', 'bounce': 'low', 'turn': 'high'},
    'dead': {'moisture': 'low', 'grass_cover': 'low', 'bounce': 'low', 'turn': 'low'},
    'hybrid': {'moisture': 'medium', 'grass_cover': 'medium', 'bounce': 'consistent', 'turn': 'medium'}
}

# Define player roles and their strengths
PLAYER_ROLES = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper']

class Player:
    def __init__(self, name, role, batting_skill, bowling_skill, fielding_skill, experience):
        self.name = name
        self.role = role
        self.batting_skill = batting_skill
        self.bowling_skill = bowling_skill
        self.fielding_skill = fielding_skill
        self.experience = experience

def analyze_pitch(pitch_report):
    # Extract key information from the pitch report
    batting_first_advantage = pitch_report.get('batting_first_advantage', False)
    dew_factor = pitch_report.get('dew_factor', False)
    supports_spin = pitch_report.get('supports_spin', False)
    supports_pace = pitch_report.get('supports_pace', False)

    # Analyze the pitch based on its characteristics
    pitch_analysis = {
        'favors_batting': batting_first_advantage,
        'favors_bowling': not batting_first_advantage,
        'favors_spin': supports_spin,
        'favors_pace': supports_pace,
        'dew_factor': dew_factor,
        'unpredictable': supports_spin and supports_pace
    }

    return pitch_analysis

def select_best_eleven(team1, team2, pitch_analysis):
    # Combine both teams
    all_players = team1 + team2

    # Randomly select 11 players
    best_eleven = random.sample(all_players, 11)

    # Ensure we have at least one wicket-keeper
    if not any(p.role == 'Wicket-keeper' for p in best_eleven):
        # Remove a random player (not a wicket-keeper) and add a wicket-keeper
        non_keepers = [p for p in best_eleven if p.role != 'Wicket-keeper']
        wicket_keepers = [p for p in all_players if p.role == 'Wicket-keeper']

        if wicket_keepers:
            best_eleven.remove(random.choice(non_keepers))
            best_eleven.append(random.choice(wicket_keepers))

    return best_eleven

def suggest_captain_and_vice_captain(best_eleven):
    # Sort the best eleven by experience and overall skill
    sorted_by_leadership = sorted(best_eleven, key=lambda p: (p.experience, p.batting_skill + p.bowling_skill + p.fielding_skill), reverse=True)

    captain = sorted_by_leadership[0]
    vice_captain = sorted_by_leadership[1]

    return captain, vice_captain

def main(pitch_report, team1_players, team2_players):
    pitch_analysis = analyze_pitch(pitch_report)
    best_eleven = select_best_eleven(team1_players, team2_players, pitch_analysis)
    captain, vice_captain = suggest_captain_and_vice_captain(best_eleven)

    return {
        'pitch_analysis': pitch_analysis,
        'best_eleven': best_eleven,
        'captain': captain,
        'vice_captain': vice_captain,
        'team1_players_selected': sum(1 for player in best_eleven if player in team1_players),
        'team2_players_selected': sum(1 for player in best_eleven if player in team2_players)
    }

# Example usage
if __name__ == "__main__":
    # Sample pitch report based on Aditya's data
    pitch_report = {
        'batting_first_advantage': True,
        'dew_factor': True,
        'supports_spin': True,
        'supports_pace': True,
        'conditions': 'varying'
    }

    # Sample players based on Aditya's lineups
    team1_players = [
        Player("Pathum Nissanka", "Batsman", 85, 30, 75, 80),
        Player("Avishka Fernando", "Batsman", 80, 25, 70, 75),
        Player("Kusal Mendis", "Wicket-keeper", 85, 20, 90, 85),
        Player("Sadeera Samarawickrama", "Batsman", 75, 20, 70, 70),
        Player("Charith Asalanka", "All-rounder", 80, 60, 75, 80),
        Player("Kamindu Mendis", "All-rounder", 75, 65, 75, 75),
        Player("Janith Liyanage", "All-rounder", 70, 70, 75, 70),
        Player("Dunith Wellalage", "All-rounder", 65, 75, 70, 70),
        Player("Akila Dananjaya", "Bowler", 40, 85, 65, 80),
        Player("Asitha Fernando", "Bowler", 30, 85, 70, 75),
        Player("Jeffrey Vandersay", "Bowler", 35, 80, 65, 75)
    ]

    team2_players = [
        Player("Rohit Sharma", "Batsman", 90, 40, 80, 95),
        Player("Shubman Gill", "Batsman", 85, 30, 75, 80),
        Player("Virat Kohli", "Batsman", 95, 35, 85, 98),
        Player("Shreyas Iyer", "Batsman", 80, 30, 75, 80),
        Player("KL Rahul", "Wicket-keeper", 85, 20, 90, 85),
        Player("Shivam Dube", "All-rounder", 75, 70, 75, 75),
        Player("Washington Sundar", "All-rounder", 70, 75, 80, 80),
        Player("Axar Patel", "All-rounder", 65, 80, 75, 85),
        Player("Kuldeep Yadav", "Bowler", 40, 90, 70, 85),
        Player("Mohammed Siraj", "Bowler", 30, 90, 75, 85),
        Player("Arshdeep Singh", "Bowler", 30, 85, 70, 75)
    ]

    result = main(pitch_report, team1_players, team2_players)

    print("Pitch Analysis:", result['pitch_analysis'])
    print("\nBest Eleven:")
    for player in result['best_eleven']:
        print(f"- {player.name} ({player.role})")
    print(f"\nCaptain: {result['captain'].name}")
    print(f"Vice Captain: {result['vice_captain'].name}")
