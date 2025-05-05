import pandas as pd
import sys
import json
import os

# Resolve CSV path
csv_path = os.path.join(os.path.dirname(__file__), "cleaned_calories.csv")
df = pd.read_csv(csv_path)

def convert_to_builtin_types(obj):
    """Convert pandas or numpy objects to native Python types."""
    if isinstance(obj, pd.Series):
        obj = obj.to_dict()
    elif isinstance(obj, pd.DataFrame):
        obj = obj.to_dict(orient='records')
    return obj

def get_calories(food_name):
    row = df[df['fooditem'].str.lower() == food_name.lower()]
    if not row.empty:
        calories = row['cals_per100grams'].values[0]
        return {'food': food_name, 'calories': int(calories)}
    else:
        return {'error': 'Food item not found'}

def get_suggestions(query):
    query = query.lower()
    suggestions = df[df['fooditem'].str.lower().str.contains(query, na=False)]
    if not suggestions.empty:
        results = suggestions[['fooditem', 'cals_per100grams']].head(10).to_dict(orient='records')
        return [convert_to_builtin_types(item) for item in results]
    else:
        return {'error': 'No matching food items found'}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Invalid parameters'}))
        sys.exit(1)

    action = sys.argv[1].lower()
    argument = sys.argv[2]

    if action == 'calories':
        result = get_calories(argument)
    elif action == 'suggestions':
        result = get_suggestions(argument)
    else:
        result = {'error': 'Invalid action'}

    print(json.dumps(result))
