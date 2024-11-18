import React, { useRef, useState, useEffect } from 'react';

import '../styles/uploadDataset.css';
import SideBar from '../components/sidebar';
import addDataBasaButton from '../images/icons/AddDataBaseButton.png';
import Papa from 'papaparse';
import axios from 'axios';

const UploadDataset = () => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [columnTypes, setColumnTypes] = useState([]);
    const [datasetName, setDatasetName] = useState(''); // New state for dataset name
    const [progress, setProgress] = useState(0);
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    const userId = localStorage.getItem('userId');

    
    console.log("UserID", userId);
    const determineColumnType = (values) => {
        if (values.every((value) => !isNaN(Date.parse(value)))) return 'date';
        if (values.every((value) => !isNaN(parseFloat(value)) && parseFloat(value) % 1 === 0)) return 'int';
        if (values.every((value) => !isNaN(parseFloat(value)))) return 'float';
        if (values.every((value) => typeof value === 'string' && value.trim() !== '')) return 'categorical';
        return 'str';
      };

    // Trigger the hidden file input when the button is clicked
    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    // Handle file selection and store it in state
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        console.log("Selected file:", file);
        if (file) {
        Papa.parse(file, {
            header: true, // If you want to use the first row as headers
            skipEmptyLines: true,
            complete: (result) => {
            setCsvData(result.data); // Store parsed data in state
            const types = Object.keys(result.data[0]).map((col) => {
                const sampleValues = result.data.slice(0, 10).map((row) => row[col]);
                return { columnName: col, type: determineColumnType(sampleValues) };
              });
    
            setColumnTypes(types);
            console.log("Parsed CSV data:", result.data);
            },
            error: (error) => {
            console.error("Error parsing CSV:", error);
            },
        });
        }
    };
    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setDatasetName(''); // Clear dataset name when closing the modal
    };
    const addRowsToDatabase = async (databaseId, newRows) => {
        try {
            const response = await axios.post('http://localhost:5001/api/add-rows', {
                databaseId: databaseId,
                newRows: newRows // Ensure this is an array of objects
            });
    
            console.log(response.data.message);
        } catch (error) {
            console.error("Error adding rows:", error);
            alert("Failed to add rows to the database.");
        }
    };
    const handleConfirmAndAdd = async () => {
        if (!datasetName) {
            alert("Please enter a dataset name before proceeding.");
            return;
        }

        let sectionSize = 200;
        const minSectionSize = 10;
        let numRows = csvData.length;
        let start = 0;
        let uploadedRows = 0;
        let databaseID = null;

        try {
            while (databaseID === null) {
                const currentSection = csvData.slice(start, start + sectionSize);

                // Prepare columns with default sentiment and factors
                const preparedColumns = columnTypes.map(col => ({
                    columnName: col.columnName,
                    type: col.type,
                    
                    sentiment: '', // Default value; modify if you collect this data
                    factors: ''    // Default value; modify if you collect this data
                }));

                try {
                    const response = await axios.post('http://localhost:5001/api/create-dataset', {
                        data: currentSection,
                        datasetName: datasetName, // Send dataset name to backend
                        columns: preparedColumns,   // Send column details with sentiment and factors
                    });
                    databaseID = response.data.databaseId;
                    numRows -= sectionSize;
                    start += sectionSize;
                    uploadedRows += currentSection.length;
                    setProgress((uploadedRows / csvData.length) * 100);
                    break;
                } catch (error) {
                    if (error.response && error.response.status === 413) {
                        sectionSize = Math.max(minSectionSize, Math.floor(sectionSize / 2));
                    } else {
                        alert("Failed to save data to database");
                        console.error("Error creating dataset:", error);
                        return; // Exit the function on non-recoverable error
                    }
                }
            }
        } catch (error) {
            alert("Failed to save data to database");
            console.error("Error during dataset creation:", error);
            return;
        }

        while (numRows > 0) {
            const currentSection = csvData.slice(start, start + sectionSize);

            addRowsToDatabase(databaseID, currentSection);
            uploadedRows += currentSection.length;
            setProgress((uploadedRows / csvData.length) * 100);
            numRows -= currentSection.length;
            start += currentSection.length;
        }

        closeModal(); // Close modal after upload completes
    };

    const ButtonColorStyle = {
        backgroundColor: csvData ? '#5a7f6f' : 'gray',
    }

    const removeDataset = () => {
        setCsvData([]);
        setSelectedFile(null);
        setColumnTypes([]);
        fileInputRef.current.value = ""; 
    }
    useEffect(() => {
        // Update the background size dynamically to reflect progress
        const slider = document.querySelector('.slider-Loading');
        if (slider) {
            slider.style.backgroundSize = `${progress}% 100%`;
        }
    }, [progress]);

    return(
        <div className="container">
            <SideBar/>
        <div className="main UploadDataset">
            <div className='upload-new-dataset'>
                <div onClick={handleButtonClick}>
                    <h1>Upload New Dataset</h1>
                    <img src={addDataBasaButton}/>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>
            <div className="dataset-info">
                <div className="column-name">
                    <h1>Column</h1>
                    {columnTypes.map((col) => (
                    <p className='item' key={col.columnName}>{col.columnName}</p>
                    ))}
                </div>
                <div className="column-info">
                    <h1>Information</h1>
                    <div className="line"></div>
                    {columnTypes.map((col) => (
                    <p className='item' key={col.columnName}>{col.type}</p>
                    ))}
          </div>
          </div>
            <div className='Dataset-items'>
                <div className='Dataset-items-elemets-div'>
                    <div className='title-div'>
                        <h1>Dataset Items</h1>
                    </div>
                    <div className='items'>
                    {csvData.length > 0 && (
                        <div>
                        <ul>
                        {csvData.length > 0 && (
                            <div className='items-div'>
                            <table className='table'>
                                <thead>
                                <tr className='titles'>
                                    {Object.keys(csvData[0]).map((header) => (
                                    <th className='element' key={header}>{header}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {csvData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                    {Object.keys(row).map((key) => (
                                        <td className='element' key={key}>{row[key]}</td>
                                    ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>
                        )}
                        </ul>
                        </div>
                    )}
                    </div>
                </div>
                <div className='buttons-div'>
                <div className="progress-bar">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        readOnly
                        className='slider-Loading'
                    />
                    {/* <span>{Math.round(progress)}%</span> */}
                </div>
                    <button onClick={openModal} style={ButtonColorStyle} className='button remove-dataset'> Confirm and Add</button>
                    <button style={ButtonColorStyle} onClick={removeDataset} className='button'> Remove Dataset</button>
                </div>
            </div>
            {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Set Dataset Name</h2>

                            {/* Input for Dataset Name */}
                            <div className="dataset-name-input">
                                <label htmlFor="datasetName">Dataset Name:</label>
                                <input
                                    type="text"
                                    id="datasetName"
                                    value={datasetName}
                                    onChange={(e) => setDatasetName(e.target.value)}
                                    placeholder="Enter dataset name"
                                    required
                                />
                            </div>

                            <button onClick={handleConfirmAndAdd} className="modal-confirm-button">Confirm and Add</button>
                            <button onClick={closeModal} className="modal-close-button">Cancel</button>
                        </div>
                    </div>
                )}
        </div>
    </div>
    )
}
export default UploadDataset;