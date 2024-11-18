import React, { useEffect, useState } from 'react';
import '../styles/uploadDataset.css';
import SideBar from '../components/sidebar';
import i from '../images/icons/i.png';
import DatasetItem from '../components/datasetItem';
import axios from 'axios';


const MyDatasets = () => {
    const [datasets, setDatasets] = useState([]);

    useEffect(() => {
        // Fetch datasets from the backend
        const fetchDatasets = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/get-datasets');
                setDatasets(response.data); // Set the fetched datasets
            } catch (error) {
                console.error("Error fetching datasets:", error);
            }
        };

        fetchDatasets();
    }, []);

    return(
        <div className="container">
            <SideBar/>
        <div className="main myDatasets">
            
            <div className='Datasets-list-div'>
                <div className='title-div'>
                    <h1>Datasets</h1>
                </div>
                <div className="items-list">
                        {datasets.map((dataset, index) => (
                            <DatasetItem
                                key={index}
                                name={dataset.database}
                                itemCount={dataset.numberOfItems}
                            />
                        ))}
                    </div>
            </div>
            
        </div>
    </div>
    )
}
export default MyDatasets;