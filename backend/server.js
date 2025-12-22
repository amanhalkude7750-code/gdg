require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

// Database Imports
const sequelize = require('./database/db');
const History = require('./models/History');

// Sync Database
sequelize.sync().then(() => {
    console.log("Database & Tables Synced");
}).catch(err => {
    console.error("Failed to Sync Database:", err);
});

// Routes
app.get('/', (req, res) => {
    res.send('ACCESS-AI Backend is Running');
});

// TASK 8.4: History Endpoint
app.get('/api/history', async (req, res) => {
    try {
        const history = await History.findAll({
            order: [['timestamp', 'DESC']],
            limit: 50
        });
        res.json({ history });
    } catch (error) {
        console.error("Fetch History Error:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// TASK 7.2: Translate Endpoint
app.post('/api/translate', async (req, res) => {
    try {
        const { tokens } = req.body;

        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({ error: "Invalid tokens provided" });
        }

        const rawTokens = tokens.map(t => t.token || t).join(" ");
        console.log("Translation Request for:", rawTokens);

        let responseText = "";

        // For MVP, if no API key is set, return mock response
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
            console.warn("WARN: No API Key found, using fallback logic.");
            responseText = `(SIMULATED AI): Translated "${rawTokens}" into a fluent sentence. [Please set API Key]`;
        } else {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `
            You are a Sign Language Translator. Convert this sequence of sign tokens into a natural, fluent, and polite English sentence. 
            Account for grammar, context, and potential emotional tone.
            
            Tokens: [${rawTokens}]
            
            Output just the sentence.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            responseText = response.text();
        }

        // TASK 8.3: Save to Database
        await History.create({
            input: rawTokens,
            output: responseText,
            mode: 'DEAF'
        });

        res.json({ response: responseText });

    } catch (error) {
        console.error("Translation Error:", error);
        res.status(500).json({ error: "Failed to process translation", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
