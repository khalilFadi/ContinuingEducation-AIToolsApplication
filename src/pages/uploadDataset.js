import React from 'react';
import '../styles/uploadDataset.css';
import SideBar from '../components/sidebar';
import addDataBasaButton from '../images/icons/AddDataBaseButton.png'
const UploadDataset = () => {
    return(
        <div className="container">
            <SideBar/>
        <div className="main UploadDataset">
            <div className='upload-new-dataset'>
                <div>
                    <h1>Upload New Dataset</h1>
                    <img src={addDataBasaButton}/>
                </div>
            </div>
            <div className='dataset-info'>
                <div className='column-name'>
                    <h1>Column</h1>
                </div>
                <div className='column-info'>
                    <h1>Information</h1>
                    <div className='line'></div>
                </div>
            </div>
            <div className='Dataset-items'>
                <div className='Dataset-items-elemets-div'>
                    <div className='title-div'>
                        <h1>Dataset Items</h1>
                    </div>
                    <div className='items'>

                    </div>
                </div>
                <div className='buttons-div'>
                    <button className='button remove-dataset'> Confirm and Add</button>
                    <button className='button'> Remove Dataset</button>
                </div>
            </div>
        </div>
    </div>
    )
}
export default UploadDataset;