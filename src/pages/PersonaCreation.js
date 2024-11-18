import React, { useState, useEffect } from 'react';
import '../styles/uploadDataset.css';
import SideBar from '../components/sidebar';
import axios from 'axios';

const PersonaCreation = () => {
    const [datasets, setDatasets] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [error, setError] = useState(null);
    const [showCreatePersonaButton, setShowCreatePersonaButton] = useState(true);
    const [personas, setPersonas] = useState([]); // State to store personas
    const [selectedPersona, setSelectedPersona] = useState(null); // Selected persona
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]); // Store chat messages

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

    const handleCreatePersonaClick = async () => {
        if (!selectedDataset || selectedColumns.length === 0) {
            setError("Please select a dataset and at least one column.");
            return;
        }
        try {
            const response = await axios.post('http://localhost:5001/api/create-personas', {
                datasetId: selectedDataset._id,
                columnName: selectedColumns[0], // Assume first selected column for simplicity
                numPersonas: 2,
            });

            // Set personas with detailed data
            setPersonas(response.data.personalities);
            setShowCreatePersonaButton(false); // Hide the button
            setError(null);
        } catch (error) {
            console.error("Error creating personas:", error);
            setError("Failed to create personas. Please try again.");
        }
    };

    const handlePersonaClick = (persona) => {
        setSelectedPersona(persona);
    };

    const handleSendMessage = async () => {
        if (!selectedPersona || !message) {
            setError("Please select a persona and type a message.");
            return;
        }
    
        // Add the user's message to the chat history immediately
        const userMessage = { role: 'user', content: message };
        setChatHistory((prevChatHistory) => [...prevChatHistory, userMessage]);
    
        try {
            // Send the request to the backend
            const response = await axios.post('http://localhost:5001/api/persona-chat', {
                persona: selectedPersona.Persona, // Long persona description
                user_message: message, // User's message
            });
    
            // Add the persona's response to the chat history
            const personaMessage = {
                role: 'persona',
                content: response.data.response, // Persona's response
            };
    
            setChatHistory((prevChatHistory) => [...prevChatHistory, personaMessage]);
        } catch (error) {
            console.error("Error sending message to persona-chat API:", error);
            setError("An unexpected error occurred. Please try again later.");
        }
    
        // Clear the input box
        setMessage('');
    };
    
    
    
    return (
        <div className="container">
            <SideBar />
            <div className="main PersonaCreation">
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
                                        key={column._id}
                                        className={`item column-item ${isColumnSelected(column.columnName) ? 'selected' : ''}`}
                                        onClick={() => handleColumnSelection(column.columnName)}
                                    >
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={isColumnSelected(column.columnName)}
                                                onChange={() => handleColumnSelection(column.columnName)}
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
                <div className='Persona-selection-div'>
                    <div className='title-div'>
                        <h1 className='title'>Persona Selection</h1>
                    </div>
                    <div className='items-presentation'>
                        {showCreatePersonaButton ? (
                            <button className="create-personas-button" onClick={handleCreatePersonaClick}>
                                Create<br />Personas
                            </button>
                        ) : (
                            <div className="personas-grid">
                                {personas.map((persona, index) => (
                                    <div
                                        key={index}
                                        className={`persona-box item ${selectedPersona === persona ? 'selected' : ''}`}
                                        onClick={() => handlePersonaClick(persona)}
                                    >
                                        <h2>{persona.name}</h2>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {selectedPersona && (
                    <div className="selected-persona-details">
                        <h2>Selected Persona: {selectedPersona.name}</h2>
                        <p>Personality: {selectedPersona.personality}</p>
                    </div>
                )}
                <div className='Chat-div'>
                    <div className='title-div'>
                        <h1 className='title'>Chat With the Persona</h1>
                    </div>
                    <div className='Chat-box'>
                        <div className='Chat-items'>
                            {chatHistory.map((chat, index) => (
                                <div key={index} className={`chat-message ${chat.role}`}>
                                    <strong>{chat.role === 'user' ? 'You' : selectedPersona.name}: </strong>
                                    {chat.content}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='send-message'>
                            <input
                                className='message-input'
                                type="text"
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button className='send-message-button' onClick={handleSendMessage}>Send</button>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default PersonaCreation;
