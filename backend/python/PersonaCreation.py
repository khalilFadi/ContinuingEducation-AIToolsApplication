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
import pandas as pd
from pymongo import MongoClient
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
from bson import ObjectId
from faker import Faker
import numpy as np
from bertopic import BERTopic
from hugchat import hugchat
from hugchat.login import Login


nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
#hugging face 
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

# Function to send a message using Hugging Face chat
def send_huggingface_chat_message(chatbot, message_text):
    # print(f"sending message to hugging face: {message_text} \n")
    try:
        # Create a new conversation for each message
        chatbot.new_conversation(switch_to=True)
        # Send the message
        message_result = chatbot.chat(message_text)
        response = message_result.wait_until_done()  # Wait for the full response
        return response
    except Exception as e:
        # print("failed to generate mesasage")
        return {"status": "Failed to generate message", "error": str(e)}

def check_connection(databaseID):
    try:
        client = MongoClient("mongodb+srv://khamad:vhguSInFSXur1ntA@websitecluster.zq5ns.mongodb.net/?retryWrites=true&w=majority&appName=WebsiteCluster")
        db = client.get_database('test')
        collection = db['databases']
        database = collection.find_one({"_id": ObjectId(databaseID)})
        return database
    except Exception as e:
        return {"status": "Connection failed", "error": str(e)}

def remove_stop_words(text):
    stop_words = set(stopwords.words('english'))
    word_tokens = word_tokenize(text)
    filtered_text = [word for word in word_tokens if word.lower() not in stop_words]
    return ' '.join(filtered_text)

def run_factor_analysis(docs, topic_size=2, number_of_topics=5):
    # Ensure docs are valid
    # print("starting Factor Analysis")
    filtered_docs = [remove_stop_words(doc) for doc in docs if isinstance(doc, str) and doc.strip()]
    if not filtered_docs:
        raise ValueError("No valid documents found for analysis after filtering.")

    #TODO: claculate min topic size based on number of topics and database size 
    # Initialize BERTopic with custom parameters
    topic_model = BERTopic(min_topic_size=2, nr_topics=number_of_topics)
    
    # Fit the model
    topics, probabilities = topic_model.fit_transform(filtered_docs)
    topic_info = topic_model.get_topic_info()
    
    # Print topic info for debugging
    # print("Topic info:", topic_info)
    # print("finsihing Factor Analysis")
    return topic_info, topics


def create_personas(data, topics, num_personas):
    Personas = []
    fake = Faker()
    for i, topic in enumerate(topics.head(num_personas)['Topic']):
        Persona = {}
        Persona['Topic'] = topic
        Persona['age'] = round(fake.pyfloat(left_digits=2, right_digits=0, positive=True, min_value=18, max_value=65))
        Persona['gender'] = np.random.choice(['Male', 'Female'])
        Persona['state'] = fake.state()
        Persona['name'] = f"{fake.first_name()} {fake.last_name()}"
        Persona['responses'] = [remove_stop_words(fake.paragraph()) for _ in range(5)]
        Personas.append(Persona)
    return Personas

def main():
    
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Insufficient arguments provided."}))
        sys.exit(1)
    
    database_id = sys.argv[1]
    column_name = sys.argv[2]
    num_personas = int(sys.argv[3])

    # Set up Hugging Face Chat
    chatbot = setup_huggingface_chat(email, password)
    if isinstance(chatbot, dict) and "error" in chatbot:
        print("Error setting up Hugging Face chat:", chatbot["error"])
        return
    # print("point")
    # Connect to the database
    database = check_connection(database_id)
    if "error" in database:
        print("Error retrieving the database:", database["error"])
        return
    # print("point 2")
    docs = [str(row[column_name]) for row in database.get("rows", []) if column_name in row and row[column_name].strip()]

    try:
        topic_info, topics = run_factor_analysis(docs, topic_size=3, number_of_topics=num_personas)
    
    except ValueError as e:
        print("Factor analysis error:", e)
        return
    # print("point 3")
    personas = create_personas(docs, topic_info, num_personas)
    
    # with open("Personas.json", "w") as file:
    #     json.dump(personas, file, indent=2)
        
    # print(f"Personas created: {personas}")
    for i in personas:
        # print(f"info of persona: type ({type(i)}): {i}" )
        # {topic_info['Name'][i['Topic']]}
        # print(f"starting on first persona ------")
        message_text = f"create a persona based on the features I will be giving you, be very creative: \n topic: Topic here, age: {i['age']}, gender: {i['gender']}, state of origin: {i['state']}, name: {i['name']}. responses given: {i['responses']}"
        result = send_huggingface_chat_message(chatbot, message_text)
        i['Persona'] = result
        # print(f"\n Persiona : {i['Persona']}")
    # print("DONE!")
    print(json.dumps({"status": "success", "personas": personas}, indent=2))

if __name__ == "__main__":
    main()
