// Sentiment.js

import React, { useState, useEffect } from 'react';
import '../styles/uploadDataset.css';
import SideBar from '../components/sidebar';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Define colors for the Pie Chart slices
const COLORS = ['#0088FE', '#FF8042', '#00C49F']; // Positive, Negative, Neutral

const Sentiment = () => {
    const [datasets, setDatasets] = useState([]); // State to hold fetched datasets
    const [selectedDataset, setSelectedDataset] = useState(null); // State for selected dataset
    const [columns, setColumns] = useState([]); // State to hold columns of the selected dataset
    const [selectedColumns, setSelectedColumns] = useState([]); // State for selected columns
    const [error, setError] = useState(null); // Error state
    const [isAnalyzing, setIsAnalyzing] = useState(false); // Loading state
    const [sentimentSummary, setSentimentSummary] = useState(null); // State to hold sentiment analysis summary
    const [largestElement, setLargestElement] = useState(null); // State to hold the largest element
    const [sentimentDistribution, setSentimentDistribution] = useState(null); // State to hold sentiment distribution

    useEffect(() => {
        // Fetch datasets from the backend when component mounts
        const fetchDatasets = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/get-datasets');
                setDatasets(response.data); // Set the fetched datasets
            } catch (error) {
                console.error("Error fetching datasets:", error);
                setError("Failed to fetch datasets.");
            }
        };

        fetchDatasets();
    }, []);

    const handleDatasetSelection = async (dataset) => {
        setSelectedDataset(dataset); // Save the selected dataset to state
        setSelectedColumns([]); // Reset selected columns when a new dataset is selected
        setColumns([]); // Reset columns
        setError(null); // Reset any previous errors
        setSentimentSummary(null); // Reset previous sentiment summary
        console.log("Selected Dataset:", dataset);

        // Fetch columns for the selected dataset
        try {
            const response = await axios.get(`http://localhost:5001/api/get-dataset-columns/${dataset._id}`);
            setColumns(response.data); // Set the fetched columns
        } catch (error) {
            console.error("Error fetching columns:", error);
            setError("Failed to fetch columns.");
            setColumns([]); // Reset columns on error
        }
    };

    const handleColumnSelection = (columnId) => {
        setSelectedColumns((prevSelected) => {
            let updatedSelected;
            if (prevSelected.includes(columnId)) {
                // If already selected, remove it
                updatedSelected = prevSelected.filter(id => id !== columnId);
            } else {
                // If not selected, add it
                updatedSelected = [...prevSelected, columnId];
            }
            console.log("Selected Columns:", updatedSelected); // Log the updated selection
            return updatedSelected;
        });
    };

    const isColumnSelected = (columnId) => selectedColumns.includes(columnId);

    const handleRunSentimentAnalysis = async () => {
        if (!selectedDataset || selectedColumns.length === 0) {
            alert("Please select a dataset and a column to find the largest element.");
            return;
        }

        const columnName = columns.find(col => col._id === selectedColumns[0]).columnName;

        try {
            const response = await axios.get('http://localhost:5001/api/sentiment-analysis', {
                params: {
                    databaseId: selectedDataset._id,
                    columnName: columnName
                }
            });
            // Set the sentiment distribution from the response
            setSentimentDistribution([
                { name: 'Positive', value: response.data.positive },
                { name: 'Neutral', value: response.data.neutral },
                { name: 'Negative', value: response.data.negative },
            ]);
        } catch (error) {
            console.error("Error finding largest element:", error);
        }
    };


    return (
        <div className="container">
            <SideBar />
            <div className="main Sentiment">
                {/* Choose Dataset Section */}
                <div className='Choose-dataset'>
                    <div className='title-div'>
                        <h1 className='title'>Choose Dataset</h1>
                    </div>
                    <div className='items'>
                        {error && (
                            <div className='error'>
                                <p>{error}</p>
                            </div>
                        )}
                        {datasets.length > 0 ? (
                            datasets.map((dataset) => (
                                <div
                                    key={dataset._id}
                                    className={`item ${selectedDataset?._id === dataset._id ? 'selected' : ''}`}
                                    onClick={() => handleDatasetSelection(dataset)}
                                >
                                    <h1>{dataset.database || "Unnamed Dataset"}</h1>
                                </div>
                            ))
                        ) : (
                            <div className='item'>
                                <h1>No datasets available</h1>
                            </div>
                        )}
                    </div>
                </div>

                {/* Choose Column Section */}
                <div className='Choose-column'>
                    <div className='title-div'>
                        <h1 className='title'>Choose Column</h1>
                    </div>
                    <div className='items'>
                        {selectedDataset ? (
                            columns.length > 0 ? (
                                columns.map((column) => (
                                    <div
                                        className={`item column-item ${isColumnSelected(column._id) ? 'selected' : ''}`}
                                        key={column._id}
                                        onClick={() => handleColumnSelection(column._id)}
                                    >
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={isColumnSelected(column._id)}
                                                onChange={() => handleColumnSelection(column._id)}
                                                onClick={(e) => e.stopPropagation()} // Prevent double toggle
                                            />
                                            <span className="checkbox-custom"></span>
                                            <h1>{column.columnName}</h1>
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <div className='item'>
                                    <h1>No columns available</h1>
                                </div>
                            )
                        ) : (
                            <div className='item'>
                                <h1>Please select a dataset to view its columns.</h1>
                            </div>
                        )}
                        {error && (
                            <div className='error'>
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sentiment Analysis Section */}
                <div className='Sentiment-Analysis-div'>
                    <div className='title-div'>
                        <h1 className='title'>Sentiment Analysis</h1>
                    </div>
                    <div className='Pie-Graph'>

                    
                    {sentimentDistribution && (
                        <div className='Pie-Graph'>
                            <div className='pie-chart'>
                            <PieChart width={300} height={300} >
                                <Pie
                                    data={sentimentDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {sentimentDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                            </div>
                        </div>
                    )}
                    </div>
                    <div className='button-div'>
                    <button
                        className='button run-sentiment-button'
                        onClick={handleRunSentimentAnalysis}
                        disabled={selectedColumns.length === 0}
                    >
                        Run Sentiment Analysis
                    </button>   
                    </div>

                </div>

                
            </div>
        </div>
    )
}

export default Sentiment;
