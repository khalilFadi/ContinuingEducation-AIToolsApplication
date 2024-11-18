import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LargestElement from './Largest';

const SentimentResult = () => {
    const [sentimentData, setSentimentData] = useState(null);

    useEffect(() => {
        const fetchSentimentData = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/calculate-sentiment');
                setSentimentData(response.data);
            } catch (error) {
                console.error("Error fetching sentiment data:", error);
            }
        };

        fetchSentimentData();
    }, []);

    return (
        <div>
            {sentimentData ? (
                <div>
                    <h1>Sentiment Analysis Result</h1>
                    <p>Positive: {sentimentData.Positive}</p>
                    <p>Negative: {sentimentData.Negative}</p>
                    <p>Neutral: {sentimentData.Neutral}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
            <LargestElement databaseId={'672bd1cd2c75b70a5238f5b7'} columnName={"ResponseId"}/>
        </div>
    );
};

export default SentimentResult;
