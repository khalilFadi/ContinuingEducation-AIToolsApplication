import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LargestElement = ({ databaseId, columnName }) => {
    const [largestElement, setLargestElement] = useState(null);

    useEffect(() => {
        const fetchLargestElement = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/find-largest`, {
                    params: { databaseId, columnName }
                });
                setLargestElement(response.data.largestElement);
            } catch (error) {
                console.error("Error fetching largest element:", error);
            }
        };

        fetchLargestElement();
    }, [databaseId, columnName]);

    return (
        <div>
            {largestElement ? (
                <p>Largest Element in {columnName}: {largestElement}</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default LargestElement;
