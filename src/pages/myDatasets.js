import React from 'react';
import '../styles/uploadDataset.css';
import SideBar from '../components/sidebar';
import i from '../images/icons/i.png'
const myDatasets = () => {
    return(
        <div className="container">
            <SideBar/>
        <div className="main myDatasets">
            
            <div className='Datasets-list-div'>
                <div className='title-div'>
                    <h1>Datasets</h1>
                </div>
                <div className='items-list'>



                <div className='item'>
                        <div className='basic-info'>
                            <h1 className='DatasetName'> Dataset Name</h1>
                            <h2 className='numebrOfItems'> 15 items</h2>
                        </div>
                        <div className='more-info'>
                            <div className='info-icon'>
                                <img className='i' src={i}/>
                            </div>
                        </div>
                    </div>
                    <div className='item'>
                        <div className='basic-info'>
                            <h1 className='DatasetName'> Dataset Name</h1>
                            <h2 className='numebrOfItems'> 15 items</h2>
                        </div>
                        <div className='more-info'>
                            <div className='info-icon'>
                                <img className='i' src={i}/>
                            </div>
                        </div>
                    </div>
                    <div className='item'>
                        <div className='basic-info'>
                            <h1 className='DatasetName'> Dataset Name</h1>
                            <h2 className='numebrOfItems'> 15 items</h2>
                        </div>
                        <div className='more-info'>
                            <div className='info-icon'>
                                <img className='i' src={i}/>
                            </div>
                        </div>
                    </div>
                    <div className='item'>
                        <div className='basic-info'>
                            <h1 className='DatasetName'> Dataset Name</h1>
                            <h2 className='numebrOfItems'> 15 items</h2>
                        </div>
                        <div className='more-info'>
                            <div className='info-icon'>
                                <img className='i' src={i}/>
                            </div>
                        </div>
                    </div>




                </div>
            </div>
            
        </div>
    </div>
    )
}
export default myDatasets;