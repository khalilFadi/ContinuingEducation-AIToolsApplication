const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DatabaseSchema = new Schema({
    PersonasIDs: [{ type: Schema.Types.ObjectId, ref: 'Persona' }],
    
    Columns: [{ type: Schema.Types.ObjectId, ref: 'Column' }],
    
    numberOfItems: { type: Number, required: true, default: 0 },
    
    database: { type: String, required: true },
    
    rows: [{
        type: Schema.Types.Mixed,
        required: true
    }]});

module.exports = mongoose.model('Database', DatabaseSchema);
