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