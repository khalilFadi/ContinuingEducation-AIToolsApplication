import sys
import json
import pandas as pd
from bertopic import BERTopic
from pymongo import MongoClient
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
from bson import ObjectId
from umap.umap_ import UMAP

nltk.download('punkt')
nltk.download('stopwords')

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

def run_factor_analysis(docs, topic_size, number_of_topics):
    # Set UMAP with a lower dimensionality if you have a small number of documents
    # umap_model = UMAP(n_components=min(5, len(docs) - 1))  # Adjust n_components based on document count

    filtered_docs = [remove_stop_words(doc) for doc in docs]
    # print(f"filtered docs: {filtered_docs}")
    topic_model = BERTopic(min_topic_size=topic_size, nr_topics=number_of_topics)
    
    topics, probabilities = topic_model.fit_transform(filtered_docs)
    topic_info = topic_model.get_topic_info()

    output = []
    for index, topic in topic_info.iterrows():
        if topic['Topic'] == -1:
            continue
        new_row = {
            "Topic": topic['Topic'],
            "Count": topic['Count'],
            "Name": topic.get('Name', ''),
            "Representation": topic['Representation'],
            "Representative_Docs": docs[index]
        }
        output.append(new_row)

    return output


def main():
    if len(sys.argv) < 5:
        print(json.dumps({"error": "Insufficient arguments provided."}))
        sys.exit(1)

    database_id = sys.argv[1]
    column_name = sys.argv[2]
    min_rows = int(sys.argv[3])
    max_titles = int(sys.argv[4])

    # Connect to MongoDB and fetch data
    database = check_connection(database_id)
    
    # Extract column values for analysis
    column_values = [str(row[column_name]) for row in database.get("rows", []) if column_name in row and row[column_name].strip()]
    # print(f"Column Values (First 5): {column_values[:5]}")  # Diagnostic print

    # Limit the document count to min_rows if necessary
    column_values = column_values[:min_rows]

    # Run factor analysis
    output = run_factor_analysis(column_values, topic_size=3, number_of_topics=5)
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
