import sys
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd 
import json

from transformers import pipeline

sentiment_analyzer_distilbert = pipeline("sentiment-analysis")

#input: full file find columns with text and apply sentiment analysis then output the full file plus the sentiment 
def SentimentAnalysis(col, question = '', numerical_output=False):
    outputCol = []
    for i in col:
        if isinstance(i, str) and len(i) < 510:
            i = question + i
            outputCol.append(sentiment_analyzer_distilbert(i)[0]['label'])
        else:
            outputCol.append('NEUTRAL')
    #change to numbers 
    if numerical_output:
        outputCol = list(map(lambda x: 1 if x == 'POSITIVE' else (-1 if x == 'NEGATIVE' else 0), outputCol))
    sent = outputCol
    return sent

#change the database to a dataframe to give it to the code 
def get_column_as_list(database_id, column_name):
    # Connect to MongoDB
    try:
        client = MongoClient("mongodb+srv://khamad:vhguSInFSXur1ntA@websitecluster.zq5ns.mongodb.net/?retryWrites=true&w=majority&appName=WebsiteCluster")
        db = client.get_database("test")
        collection = db["databases"]
        database = collection.find_one({"_id": ObjectId(database_id)})

    except Exception as e:
        return None

    column_values = [str(row[column_name]) for row in database["rows"] if column_name in row]
    
    return column_values

def get_sentiment_distribution(database_id, column_name):
    # get the column as df 
    column_values = get_column_as_list(database_id, column_name)
    sent = SentimentAnalysis(column_values)
    return {
        "positive": sent.count("POSITIVE"),
        "neutral": sent.count("NEUTRAL"),
        "negative": sent.count("NEGATIVE")
    }


if __name__ == "__main__":
    # Get database_id and column_name from command line arguments
    if len(sys.argv) < 3:
        print("Usage: python find_largest.py <database_id> <column_name>")
        sys.exit(1)

    database_id = sys.argv[1]
    column_name = sys.argv[2]
    #return 30% positive, 20% neutral and 50% negative
    # Call the function to get the sentiment distribution
    sentiment_distribution = get_sentiment_distribution(database_id, column_name)

    # Output the sentiment distribution as JSON
    print(json.dumps(sentiment_distribution))
    
    # # Call the function and print the largest element
    # largest_element = get_column_as_df(database_id, column_name)
    # if largest_element:
    #     print(f"Largest element in column '{column_name}': {largest_element}")
    # else:
    #     print(f"No data found for database ID: {database_id} and column: {column_name}")
