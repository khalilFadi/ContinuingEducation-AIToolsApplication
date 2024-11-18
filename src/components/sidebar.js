import React from 'react';
import PersonaCreationIcon from '../images/icons/PersonaCreation.png';
import DatasetsIcon from '../images/icons/Datasets.png';
import QuestionMarkIcon from '../images/icons/QuestionMark.png';
import SentimentIcon from '../images/icons/Sentiment.png';
import SettingsIcon from '../images/icons/Settings.png';
import TextIcon from '../images/icons/Text.png';
import UploadDatasetIcon from '../images/icons/UploadDataset.png';


import { navigate } from 'gatsby';
import '../styles/styles.css';


const SideBar = () => {
    const nav = navigate();
    const goto = (link) => {
        navigate(link)
    }
    return(
        <div className="sidebar">
            <ul>
            <li onClick={() => goto("/uploadDataset")}><img className='sidebar-icon' src={UploadDatasetIcon}/>Upload Dataset</li>
            <li onClick={() => goto("/myDatasets")}><img className='sidebar-icon' src={DatasetsIcon}/>My Datasets</li>
            <li onClick={() => goto("/Sentiment")}><img className='sidebar-icon' src={SentimentIcon}/>Sentiment</li>
            <li onClick={() => goto("/FactorAnalysis")}><img className='sidebar-icon' src={TextIcon}/>Factor Analysis</li>
            <li onClick={() => goto("/PersonaCreation")}><img className='sidebar-icon' src={PersonaCreationIcon}/>Persona Creation</li>
            <div className='sidebar-line'/>
            <li ><img className='sidebar-icon' src={SettingsIcon}/>Settings</li>
            <li><img className='sidebar-icon' src={QuestionMarkIcon}/>Help</li>
            
            <div className='UserInfo'>
                <div className='sidebar-line'/>
                <img className='sidebar-image'/>
                <div className='UserInfo-text'>
                    <h3 className='UserInfo-text-username'>Username</h3>
                    <p className='UserInfo-text-function'>function</p>
                </div>
            </div>
            </ul>
      </div>
    )
}
export default SideBar;