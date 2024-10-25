import React from 'react';
import '../styles/uploadDataset.css';
import SideBar from '../components/sidebar';
import addDataBasaButton from '../images/icons/AddDataBaseButton.png'
const Sentiment = () => {
    return(
        <div className="container">
            <SideBar/>
        <div className="main Sentiment">
            <div className='Choose-dataset'>
                <div className='title-div'>
                    <h1 className='title'> Choose Dataset</h1>
                </div>
                <div className='items'>
                        <div className='item'>
                            <h1> DataSet Name</h1>
                        </div>
                        <div className='item'>
                            <h1> DataSet Name</h1>
                        </div>
                        <div className='item'>
                            <h1> DataSet Name</h1>
                        </div>
                </div>
            </div>
            <div className='Choose-column'>
                <div className='title-div'>
                    <h1 className='title'> Choose Column</h1>
                </div>
                <div className='items'>
                <div className='item'>
                            <h1> Column Name</h1>
                        </div>
                        <div className='item'>
                            <h1> Column Name</h1>
                        </div>
                        <div className='item'>
                            <h1> Column Name</h1>
                        </div>
                        
                </div>
            </div>
            <div className='Sentiment-Analysis-div'>
                <div className='title-div'>
                    <h1 className='title'>Sentiment Analysis</h1>
                </div>
                <div className='Pie-Graph'>
                    <div className='shape'>

                    </div>
                </div>
                <div className='more-info'>

                </div>
            </div>
        </div>
    </div>
    )
}
export default Sentiment;