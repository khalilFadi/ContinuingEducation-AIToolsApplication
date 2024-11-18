// DatasetItem.js
import React from 'react';
import i from '../images/icons/i.png';

const DatasetItem = ({ name, itemCount }) => (
    <div className="item">
        <div className="basic-info">
            <h1 className="DatasetName">{name}</h1>
            <h2 className="numebrOfItems">{itemCount} items</h2>
        </div>
        <div className="more-info">
            <div className="info-icon">
                <img className="i" src={i} alt="info icon" />
            </div>
        </div>
    </div>
);

export default DatasetItem;
