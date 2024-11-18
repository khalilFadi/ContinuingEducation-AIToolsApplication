import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: "", description: "" });

    // Fetch items from backend
    useEffect(() => {
        axios.get('http://localhost:5001/api/items')
            .then(response => setItems(response.data))
            .catch(error => console.error("Error fetching items:", error));
    }, []);

    // Add new item to backend
    const addItem = () => {
        axios.post('http://localhost:5001/api/items', newItem)
            .then(response => setItems([...items, response.data]))
            .catch(error => console.error("Error adding item:", error));
    };

    return (
        <div>
            <h1>Items</h1>
            <ul>
                {items.map((item) => (
                    <li key={item._id}>{item.name}: {item.description}</li>
                ))}
            </ul>
            <div>
                <input
                    type="text"
                    placeholder="Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
                <button onClick={addItem}>Add Item</button>
            </div>
        </div>
    );
}

export default App;
