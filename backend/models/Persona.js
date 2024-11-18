const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PersonaSchema = new Schema({
    description: { type: String, required: true },
    
    name: { type: String, required: true },
    
    age: { type: Number, required: true },
    
    origin: { type: String, required: true },
    
    title: { type: String, required: true },
    
    ColumnIDs: [{ type: Schema.Types.ObjectId, ref: 'Column' }]
});

module.exports = mongoose.model('Persona', PersonaSchema);
