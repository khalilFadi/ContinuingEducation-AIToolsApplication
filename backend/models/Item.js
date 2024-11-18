const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: { type: String, required: true },
    
    description: { type: String, required: true },
    
    status: { type: String, default: 'active' }  // Default value for 'status'
});

const Item = mongoose.model('Item', ItemSchema);
module.exports = Item;
