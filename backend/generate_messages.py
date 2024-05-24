import openai
from openai import OpenAI

client = OpenAI(api_key='sk-proj-JLobBFVaA2SoeO8iIWZRT3BlbkFJ8t47GmMmhRhOSBraqoOX')
import pandas as pd
import sys
import time

# Set your OpenAI API key

def generate_message(name, role, message_type):
    prompt = f"Write a {'friendly and professional' if role == 'recruiter' else 'casual and friendly'} {message_type.replace('_', ' ')} for a LinkedIn user named {name}."
    try:
        response = client.chat.completions.create(model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=100)
        return response.choices[0].message.content.strip()
    except openai.RateLimitError as e:
        print(f"Rate limit exceeded for {name}: {e}")
        time.sleep(60)  # Wait for a minute before retrying
        return "Rate limit exceeded. Please try again later."
    except Exception as e:
        print(f"Error generating message for {name}: {e}")
        return f"Error: {e}"

def generate_messages(input_csv, output_csv):
    df = pd.read_csv(input_csv)
    df['message'] = df.apply(lambda row: generate_message(row['username'], row['role'], row['messageType']), axis=1)
    df.to_csv(output_csv, index=False)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 generate_messages.py <input_csv> <output_csv>")
        sys.exit(1)

    input_csv = sys.argv[1]
    output_csv = sys.argv[2]
    generate_messages(input_csv, output_csv)