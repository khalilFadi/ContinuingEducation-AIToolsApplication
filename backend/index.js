const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt'); // For password hashing
const axios = require('axios');
const { exec } = require('child_process');


const app = express();
const PORT = 5001;

const Column = require('./models/Column'); 
const Database = require('./models/Database.js')
const User = require('./models/User'); 

app.use(cors()); // Enable CORS to allow requests from different origins
app.use(express.json()); // To parse JSON request bodies

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1234';

mongoose.connect('mongodb+srv://khamad:vhguSInFSXur1ntA@websitecluster.zq5ns.mongodb.net/?retryWrites=true&w=majority&appName=WebsiteCluster', {
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.log("MongoDB connection error:", error));
// Signup
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds of hashing

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', userId: newUser._id });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: 'Failed to create user' });
    }
});

//login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            return res.json({ message: 'Admin login successful', userId: 'admin' });
        }
        // Find user by username
        const user = await User.findOne({ username });

        // If user not found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Store the user ID as a global variable

        res.json({ message: 'Login successful', userId: user._id });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});


// Modify the existing POST route
app.post('/api/create-dataset', async (req, res) => {
    const { data, datasetName, columns } = req.body;

    console.log("Received data:", data);
    console.log("Dataset name:", datasetName);
    console.log("Columns:", columns);

    // Validate input
    if (!Array.isArray(data)) {
        return res.status(400).json({ message: "Data should be an array of rows." });
    }
    if (!datasetName || typeof datasetName !== 'string') {
        return res.status(400).json({ message: "Dataset name is required and should be a string." });
    }
    if (!Array.isArray(columns) || columns.length === 0) {
        return res.status(400).json({ message: "Columns should be a non-empty array." });
    }

    try {
        // Extract PersonasIDs if present
        const PersonasIDs = data.map(row => row.PersonasID).filter(Boolean);

        // Create the Database document first
        const databaseEntry = new Database({
            PersonasIDs,
            Columns: [], // Will populate after creating Column documents
            numberOfItems: data.length,
            database: datasetName,
            rows: [] // To be updated later
        });

        await databaseEntry.save();

        // Create Column documents
        const columnDocs = await Promise.all(columns.map(async (col) => {
            const column = new Column({
                DatabaseID: databaseEntry._id,
                columnName: col.columnName || ' ',
                sentiment: col.sentiment || ' ', // Use provided sentiment or default
                factors: col.factors || ' ',     // Use provided factors or default
                type: col.type
            });
            await column.save();
            return column._id;
        }));

        // Update the Database document with Column IDs
        databaseEntry.Columns = columnDocs;

        // Clean and assign rows (remove unnecessary fields)
        const cleanedRows = data.map(row => {
            const cleanedRow = { ...row };
            delete cleanedRow.PersonasID;
            delete cleanedRow.Column; // Remove 'Column' field if it exists
            return cleanedRow;
        });

        databaseEntry.rows = cleanedRows;

        await databaseEntry.save();

        console.log('New database entry saved:', databaseEntry);
        res.status(201).json({ message: 'Database created successfully', databaseId: databaseEntry._id });
    } catch (error) {
        console.error("Error saving database:", error);
        res.status(500).json({ message: 'Failed to save database' });
    }
});
app.post('/api/add-rows', async (req, res) => {
    const { databaseId, newRows } = req.body;

    console.log("Received add-rows request:");
    console.log("Database ID:", databaseId);
    console.log("New Rows:", JSON.stringify(newRows, null, 2));

    if (!Array.isArray(newRows) || !databaseId) {
        return res.status(400).json({ message: "Database ID and an array of rows are required." });
    }

    // Validate that each newRow is an object
    const isValidRows = newRows.every(row => typeof row === 'object' && !Array.isArray(row) && row !== null);
    if (!isValidRows) {
        return res.status(400).json({ message: "Each row must be an object." });
    }

    try {
        // Atomically push new rows and increment numberOfItems
        const updatedDatabase = await Database.findByIdAndUpdate(
            databaseId,
            {
                $push: { rows: { $each: newRows } },
                $inc: { numberOfItems: newRows.length }
            },
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedDatabase) {
            return res.status(404).json({ message: "Database not found." });
        }

        console.log(`Successfully added ${newRows.length} rows to database with ID: ${databaseId}`);
        console.log(`Updated numberOfItems: ${updatedDatabase.numberOfItems}`);

        res.json({ message: "Rows added successfully", databaseId });
    } catch (error) {
        console.error("Error adding rows:", error);
        res.status(500).json({ message: "Failed to add rows to database." });
    }
});


app.get('/api/get-datasets', async (req, res) => {
    try {
        const datasets = await Database.find(); // Fetch all documents in the collection
        res.json(datasets); // Return the datasets as JSON
    } catch (error) {
        console.error("Error fetching datasets:", error);
        res.status(500).json({ message: "Failed to fetch datasets." });
    }
});

app.get('/api/get-dataset-columns/:datasetId', async (req, res) => {
    const { datasetId } = req.params;

    try {
        const database = await Database.findById(datasetId).populate('Columns');
        if (!database) {
            return res.status(404).json({ message: "Dataset not found." });
        }

        res.json(database.Columns); // Return the populated Columns
    } catch (error) {
        console.error("Error fetching dataset columns:", error);
        res.status(500).json({ message: "Failed to fetch dataset columns." });
    }
});

app.post('/api/perform-sentiment-analysis', async (req, res) => {
    const { databaseId, columnName, question, numericalOutput } = req.body;

    if (!databaseId || !columnName) {
        return res.status(400).json({ message: "Database ID and column name are required." });
    }

    try {
        // Fetch the specified database from MongoDB
        const database = await Database.findById(databaseId);
        if (!database) {
            return res.status(404).json({ message: "Database not found." });
        }

        // Extract rows to analyze
        const rowsToAnalyze = database.rows.map(row => ({
            ...row
        }));

        // Perform sentiment analysis via Python API
        const analyzedRows = await analyzeSentiment(
            rowsToAnalyze,
            question || '',
            numericalOutput || false,
            columnName
        );

        // Update the database with sentiment results
        // Assuming you want to store the sentiment in a new field, e.g., 'sentiment'
        database.rows = analyzedRows.map(row => ({
            ...row,
            sentiment: row.sent // 'sent' is the field added by the Python API
        }));

        // Optionally, update numberOfItems if needed
        database.numberOfItems = database.rows.length;

        // Save the updated database back to MongoDB
        await database.save();

        res.json({ message: "Sentiment analysis completed and saved successfully.", databaseId });
    } catch (error) {
        console.error("Error performing sentiment analysis:", error);
        res.status(500).json({ message: "Failed to perform sentiment analysis." });
    }
});

app.get('/api/calculate-sentiment', (req, res) => {
    exec('python3 python/calculate_sentiment.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ message: 'Error executing Python script' });
        }

        try {
            // Parse the JSON output from the Python script
            const result = JSON.parse(stdout);
            res.json(result); // Send result back to frontend
        } catch (parseError) {
            console.error(`Parsing error: ${parseError}`);
            res.status(500).json({ message: 'Error parsing script output' });
        }
    });
});

app.get('/api/sentiment-analysis', (req, res) => {
    const { databaseId, columnName } = req.query;

    if (!databaseId || !columnName) {
        return res.status(400).json({ message: "Database ID and column name are required." });
    }

    // Run the Python script with the database ID and column name as arguments
    exec(`python3 python/sentiment.py ${databaseId} ${columnName}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution error: ${error}`);
            return res.status(500).json({ message: 'Error executing Python script' });
        }

        try {
            // Parse the JSON output from the Python script
            const result = JSON.parse(stdout);
            // Send the parsed result (sentiment distribution) back to the frontend
            res.json(result);
        } catch (parseError) {
            console.error(`Parsing error: ${parseError}`);
            res.status(500).json({ message: 'Error processing script output' });
        }
    });
});


// Perform Factor Analysis
app.post('/api/perform-factor-analysis', async (req, res) => {
    const { databaseId, columnName, minRows, maxTitles } = req.body;

    if (!databaseId || !columnName || minRows == null || maxTitles == null) {
        return res.status(400).json({ message: "Database ID, column name, minRows, and maxTitles are required." });
    }

    try {
        // Fetch the specified database from MongoDB
        const database = await Database.findById(databaseId);
        if (!database) {
            return res.status(404).json({ message: "Database not found." });
        }

        // Extract rows for factor analysis based on given column
        const rowsToAnalyze = database.rows.filter(row => row[columnName] != null);

        // Perform factor analysis via Python script
        const command = `python3 python/perform_factor_analysis.py ${databaseId} ${columnName} ${minRows} ${maxTitles}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error}`);
                return res.status(500).json({ message: 'Error executing Python script', error: stderr || error.message });
            }

            try {
                // Parse the JSON output from the Python script
                const result = JSON.parse(stdout);
                res.json({ message: "Factor analysis completed successfully.", result, stderr });
            } catch (parseError) {
                console.error(`Parsing error: ${parseError}`);
                res.status(500).json({ message: 'Error parsing script output', error: parseError.message, stderr });
            }
        });
    } catch (error) {
        console.error("Error performing factor analysis:", error);
        res.status(500).json({ message: "Failed to perform factor analysis.", error: error.message });
    }
});

app.post('/api/create-personas', async (req, res) => {
    const { datasetId, columnName, numPersonas } = req.body;

    console.log("Request received for persona creation:");
    console.log("Dataset ID:", datasetId);
    console.log("Column Name:", columnName);
    console.log("Number of Personas:", numPersonas);

    if (!datasetId || !columnName || !numPersonas) {
        console.error("Missing required fields:");
        console.error("Dataset ID:", datasetId);
        console.error("Column Name:", columnName);
        console.error("Number of Personas:", numPersonas);
        return res.status(400).json({
            message: "Dataset ID, column name, and number of personas are required.",
        });
    }

    try {
        // Construct the command to run the Python script
        const command = `python python/PersonaCreation.py ${datasetId} ${columnName} ${numPersonas}`;
        console.log("Executing command:", command);

        // Execute the Python script
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Error executing script:");
                console.error("Command:", command);
                console.error("Error Message:", error.message);
                return res.status(500).json({
                    message: "Failed to execute persona creation script.",
                    error: error.message,
                });
            }

            if (stderr) {
                console.error("Python script returned an error:");
                console.error("Stderr:", stderr);
                return res.status(500).json({
                    message: "Error in Python script.",
                    error: stderr,
                });
            }

            console.log("Python script executed successfully. Stdout:");
            console.log(stdout);

            try {
                const output = JSON.parse(stdout);
                console.log("Parsed Output:", output);

                // Validate and extract the personas array
                if (!output.personas || !Array.isArray(output.personas)) {
                    throw new Error("Invalid personas array in script output.");
                }

                // Extract only the personalities section
                const personalities = output.personas;
                console.log("Extracted Personalities:", personalities);

                return res.status(200).json({
                    message: "Personas created successfully.",
                    personalities,
                });
            } catch (parseError) {
                console.error("Error parsing script output:");
                console.error("Stdout:", stdout);
                console.error("Parsing Error:", parseError.message);
                return res.status(500).json({
                    message: "Failed to parse script output.",
                    error: parseError.message,
                });
            }
        });
    } catch (error) {
        console.error("Unexpected error in create-personas endpoint:");
        console.error("Error:", error);
        res.status(500).json({
            message: "Internal server error.",
        });
    }
});


app.post('/api/persona-chat', async (req, res) => {
    const { persona, user_message } = req.body;

    if (!persona || !user_message) {
        return res.status(400).json({
            message: "Persona and user message are required.",
        });
    }

    console.log("Executing Persona Chat with persona:", persona, "and message:", user_message);

    try {
        // Use JSON.stringify to safely escape the inputs
        const escapedPersona = JSON.stringify(persona);
        const escapedMessage = JSON.stringify(user_message);

        // Construct the command to run the Python script
        const command = `python python/PersonaChat.py ${escapedPersona} ${escapedMessage}`;
        console.log("Executing command:", command);

        // Execute the Python script
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Error executing script:", error.message);
                return res.status(500).json({
                    message: "Failed to execute persona chat script.",
                    error: error.message,
                });
            }

            if (stderr) {
                console.error("Python script returned an error:", stderr);
                return res.status(500).json({
                    message: "Error in Python script.",
                    error: stderr,
                });
            }

            try {
                const output = JSON.parse(stdout);

                if (!output.persona_response) {
                    throw new Error("Missing persona_response in script output.");
                }

                return res.status(200).json({
                    message: "Response generated successfully.",
                    response: output.persona_response,
                });
            } catch (parseError) {
                console.error("Error parsing script output:", parseError.message);
                return res.status(500).json({
                    message: "Failed to parse script output.",
                    error: parseError.message,
                });
            }
        });
    } catch (error) {
        console.error("Unexpected error in persona-chat endpoint:", error.message);
        return res.status(500).json({
            message: "Internal server error.",
            error: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
