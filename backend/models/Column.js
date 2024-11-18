const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ColumnSchema = new Schema({
    columnName: { type: String, required: true }, 

    DatabaseID: { type: Schema.Types.ObjectId, ref: 'Database', required: true },
    
    sentiment: { type: String, required: true, default: '' },
    
    factors: { type: String, required: true, default: '' },  
    
    type: { type: String, required: true }
});

module.exports = mongoose.model('Column', ColumnSchema);
