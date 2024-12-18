import React, { useState, useEffect } from 'react';
import '../styles/uploadDataset.css';
import SideBar from '../components/sidebar';
import addDataBasaButton from '../images/icons/AddDataBaseButton.png';
import axios from 'axios';

const FactorAnalysis = () => {
    const [datasets, setDatasets] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [error, setError] = useState(null);
    const [minRows, setMinRows] = useState(20);
    const [maxTitles, setMaxTitles] = useState(2);
    const [factorAnalysisResult, setFactorAnalysisResult] = useState(null);

    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/get-datasets');
                setDatasets(response.data);
            } catch (error) {
                console.error("Error fetching datasets:", error);
                setError("Failed to fetch datasets.");
            }
        };
        fetchDatasets();
    }, []);

    const handleDatasetSelection = async (dataset) => {
        setSelectedDataset(dataset);
        setSelectedColumns([]);
        setColumns([]);
        setError(null);

        try {
            const response = await axios.get(`http://localhost:5001/api/get-dataset-columns/${dataset._id}`);
            setColumns(response.data);
        } catch (error) {
            console.error("Error fetching columns:", error);
            setError("Failed to fetch columns.");
        }
    };

    const handleColumnSelection = (columnName) => {
        setSelectedColumns(prevSelected =>
            prevSelected.includes(columnName)
                ? prevSelected.filter(name => name !== columnName)
                : [...prevSelected, columnName]
        );
    };

    const isColumnSelected = (columnName) => selectedColumns.includes(columnName);

    const incrementMinRows = () => setMinRows(prev => prev + 1);
    const decrementMinRows = () => setMinRows(prev => (prev > 0 ? prev - 1 : 0));
    const incrementMaxTitles = () => setMaxTitles(prev => prev + 1);
    const decrementMaxTitles = () => setMaxTitles(prev => (prev > 0 ? prev - 1 : 0));

    const handleFactorAnalysis = async () => {
        if (!selectedDataset || selectedColumns.length === 0) {
            setError("Please select a dataset and at least one column for factor analysis.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5001/api/perform-factor-analysis', {
                databaseId: selectedDataset._id,
                columnName: selectedColumns[0], // Use the first selected column for analysis
                minRows,
                maxTitles
            });
            setFactorAnalysisResult(response.data.result);
            setError(null);
        } catch (error) {
            console.error("Error performing factor analysis:", error);
            setError("Failed to perform factor analysis.");
        }
    };

    return (
        <div className="container">
            <SideBar/>
            <div className="main FactorAnalysis">
                <div className='Choose-dataset'>
                    <div className='title-div'>
                        <h1 className='title'>Choose Dataset</h1>
                    </div>
                    <div className='items'>
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
                <div className='Choose-column'>
                    <div className='title-div'>
                        <h1 className='title'>Choose Column</h1>
                    </div>
                    <div className='items'>
                        {selectedDataset ? (
                            columns.length > 0 ? (
                                columns.map((column) => (
                                    <div
                                        className={`item column-item ${isColumnSelected(column.columnName) ? 'selected' : ''}`}
                                        key={column._id}
                                        onClick={() => handleColumnSelection(column.columnName)}
                                    >
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={isColumnSelected(column.columnName)}
                                                onChange={() => handleColumnSelection(column.columnName)}
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
                    </div>
                </div>
                <div className='Paramter-Buttons-Div'>
                    <div className='number-of-rows-button'>
                        <h1 className='name'>Min # of Rows</h1>
                        <div className='edit-value'>
                            <h1 className='addition' onClick={incrementMinRows}>+</h1>
                            <h1 className='value'>{minRows}</h1>
                            <h1 className='subtraction' onClick={decrementMinRows}>-</h1>
                        </div>
                    </div>
                    <div className='max-number-of-titles'>
                        <h1 className='name'>Max # of Titles</h1>
                        <div className='edit-value'>
                            <h1 className='addition' onClick={incrementMaxTitles}>+</h1>
                            <h1 className='value'>{maxTitles}</h1>
                            <h1 className='subtraction' onClick={decrementMaxTitles}>-</h1>
                        </div>
                    </div>
                </div>
                <div className='Factor-Analysis-div'>
                    <div className='title-div'>
                        <h1 className='title'>Factor Analysis</h1>
                    </div>
                    
                    {factorAnalysisResult && (
                        <div className='factor-analysis-result'>
                            <h2>Factor Analysis Result:</h2>
                            {factorAnalysisResult.length > 0 ? (
                                factorAnalysisResult.map((topic, index) => (
                                    <div key={index} className="topic">
                                        {Object.entries(topic).map(([key, value]) => (
                                            <p key={key}><strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}</p>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <p>No topics were found in the analysis.</p>
                            )}
                        </div>
                    )}
                    {error && (
                        <div className='error-message'>
                            <h2>{error}</h2>
                        </div>
                    )}

                <button className='factor-analysis-button' onClick={handleFactorAnalysis}>Perform Factor Analysis</button>
                </div>
                
            </div>
        </div>
    )
}

export default FactorAnalysis;
