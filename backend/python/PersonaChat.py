# Suppress OpenMP warnings
import os
import sys
os.environ['OPENBLAS_VERBOSE'] = '0'
os.environ['KMP_WARNINGS'] = '0'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['OMP_DISPLAY_ENV'] = 'FALSE'

# Redirect stderr to suppress OpenMP warnings
def suppress_warnings():
    sys.stderr = open(os.devnull, 'w')

def restore_stderr():
    sys.stderr = sys.__stderr__

suppress_warnings()

import json
from hugchat import hugchat
from hugchat.login import Login

# Hugging Face credentials
email = "khamad@byu.edu"
password = "Khamad@2005"

# Function to set up Hugging Face Chat
def setup_huggingface_chat(email, password, cookie_path_dir="./cookies/"):
    try:
        # Log in to Hugging Face and save cookies
        login = Login(email, password)
        cookies = login.login(cookie_dir_path=cookie_path_dir, save_cookies=True)
        # Create the chatbot instance
        chatbot = hugchat.ChatBot(cookies=cookies.get_dict())
        return chatbot
    except Exception as e:
        return {"status": "Failed to set up Hugging Face chat", "error": str(e)}

# Function to send a chat message using Hugging Face chat
def send_huggingface_chat_message(chatbot, persona, user_message):
    try:
        # Create a new conversation for each message
        chatbot.new_conversation(switch_to=True)
        # Construct the full message with persona context
        message_text = (
            f"You are the following persona:\n\n{persona}\n\n"
            f"Now respond to this user message:\nUser: {user_message}\nYour response:"
        )
        # Send the message
        message_result = chatbot.chat(message_text)
        response = message_result.wait_until_done()  # Wait for the full response
        return response
    except Exception as e:
        return {"status": "Failed to generate message", "error": str(e)}

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Insufficient arguments provided. Usage: <persona> <user_message>"}))
        sys.exit(1)
    
    # Extract persona and user message from the input
    persona = sys.argv[1]
    user_message = sys.argv[2]

    # Set up Hugging Face Chat
    chatbot = setup_huggingface_chat(email, password)
    if isinstance(chatbot, dict) and "error" in chatbot:
        print("Error setting up Hugging Face chat:", chatbot["error"])
        return

    # Get response from persona-based chat
    response = send_huggingface_chat_message(chatbot, persona, user_message)
    print(json.dumps({"persona_response": response}, indent=2))

if __name__ == "__main__":
    main()
