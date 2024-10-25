import React from 'react';
import '../styles/uploadDataset.css';
import SideBar from '../components/sidebar';
import addDataBasaButton from '../images/icons/AddDataBaseButton.png'
const Sentiment = () => {
    return(
        <div className="container">
            <SideBar/>
        <div className="main FactorAnalysis">
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
            <div className='Paramter-Buttons-Div'>
                 <div className='number-of-rows-button'>
                    <h1 className='name'> Min # of Rows</h1>
                    <div className='edit-value'>
                        <h1 className='addition'>+</h1>
                        <h1 className='value'>10</h1>

                        <h1 className='subtraction'>-</h1>
                    </div>
                 </div>
                 <div className='max-number-of-titles'>
                    <h1 className='name'>Max # of Titles</h1>
                    <div className='edit-value'>
                        <h1 className='addition'>+</h1>
                        <h1 className='subtraction'>-</h1>
                        <h1 className='value'>10</h1>
                    </div>
                 </div>
            </div>
            <div className='Factor-Analysis-div'>
                <div className='title-div'>
                    <h1 className='title'>Factor Analysis</h1>
                </div>
                <div className='items-presentation'>
                    <div className='title'>
                        <h1 className='Title'>Title</h1>
                        <h1 className='number-of-rows'># rows</h1>
                        <h1 className='Exampels'>Exampels</h1>
                    </div>

                    <div className='items'>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}
export default Sentiment;