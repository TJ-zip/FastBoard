const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Set up Multer for handling file uploads (stored in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

/**
 * MOCK AI GENERATOR
 * This function returns a static but dynamic-looking array of JSON cards 
 * to simulate the AI output, allowing the frontend flow to be tested 
 * without an actual API key.
 */
function generateMockAICards(fileName) {
    const topicName = fileName.replace('.pdf', '').replace(/[-_]/g, ' ');
    
    return [
        {
            type: 'flashcard',
            id: 'mock-fc-' + Date.now(),
            topic: topicName,
            question: `What is the core concept of ${topicName}?`,
            answer: `The core concept involves understanding the fundamental principles outlined in the document, specifically relating to its primary subject matter.`,
            tags: ['Overview', 'Basics'],
            difficulty: 2
        },
        {
            type: 'miniboard',
            id: 'mock-mb-' + Date.now(),
            topic: topicName,
            title: `Key Components of ${topicName}`,
            description: `Match the components to their correct descriptions based on the document.`,
            pairs: [
                { id: 1, term: 'Primary Element', definition: 'The main subject of discussion' },
                { id: 2, term: 'Secondary Factor', definition: 'A supporting characteristic' },
                { id: 3, term: 'Outcome', definition: 'The resulting effect or product' }
            ],
            tags: ['Interactive', 'Matching'],
            difficulty: 3
        },
        {
            type: 'concept_link',
            id: 'mock-cl-' + Date.now(),
            topic: topicName,
            title: `Connecting ${topicName}`,
            conceptA: topicName,
            conceptB: 'Real World Application',
            prompt: `Explain how the concepts in ${topicName} can be applied in a practical scenario.`,
            hint: 'Think about industry use-cases or daily applications.',
            tags: ['Application', 'Synthesis'],
            difficulty: 4
        }
    ];
}

// Upload Endpoint
app.post('/api/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // 1. Extract text from the PDF
        const pdfData = await pdfParse(req.file.buffer);
        const extractedText = pdfData.text;

        console.log(`Successfully parsed PDF: ${req.file.originalname} (${extractedText.length} characters)`);

        // 2. Call OpenRouter AI
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';
        let generatedCards = [];

        if (OPENROUTER_API_KEY) {
            console.log('Sending text to OpenRouter AI...');
            const systemPrompt = `You are an AI learning assistant. Extract key concepts from the user's text and generate an array of interactive learning cards. 
Return ONLY a valid JSON array of objects. Do not include markdown formatting like \`\`\`json.
Schema requirements:
1. Flashcard: {"type": "flashcard", "id": "fc-<unique>", "topic": "Brief topic", "question": "...", "answer": "...", "tags": ["tag1"], "difficulty": 1-5}
2. Miniboard: {"type": "miniboard", "id": "mb-<unique>", "topic": "Brief topic", "title": "...", "description": "...", "pairs": [{"id": 1, "term": "...", "definition": "..."}], "tags": ["tag1"], "difficulty": 1-5}
3. Concept Link: {"type": "concept_link", "id": "cl-<unique>", "topic": "Brief topic", "title": "...", "conceptA": "...", "conceptB": "...", "prompt": "...", "hint": "...", "tags": ["tag1"], "difficulty": 1-5}
Generate 3-5 high-quality cards based on the text.`;

            try {
                const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: OPENROUTER_MODEL,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: extractedText.substring(0, 8000) } // Truncate to ensure it fits free tier context limits
                        ]
                    })
                });

                if (!aiResponse.ok) {
                    const errorData = await aiResponse.text();
                    console.error('OpenRouter Error:', errorData);
                    throw new Error('AI API failed');
                }

                const aiData = await aiResponse.json();
                const aiText = aiData.choices[0].message.content.trim();
                // Clean up possible markdown code blocks just in case
                const jsonString = aiText.replace(/^```(json)?\s*/i, '').replace(/\s*```$/i, '');
                
                generatedCards = JSON.parse(jsonString);
                
                // If the AI returns an empty array or invalid format (usually due to a scanned/unreadable PDF),
                // we forcefully throw an error to fall back to the mock generator so the user always gets cards.
                if (!Array.isArray(generatedCards) || generatedCards.length === 0) {
                    throw new Error("AI returned empty array. Text might be unreadable or too short.");
                }
                
                // Ensure the array contains valid objects, not primitive strings
                const validCards = generatedCards.filter(c => typeof c === 'object' && c !== null);
                if (validCards.length === 0) {
                    throw new Error("AI returned an array of primitive values instead of objects.");
                }
                generatedCards = validCards;
                
                console.log(`Successfully generated ${generatedCards.length} cards from AI.`);
            } catch(e) {
                console.error("AI Generation or Network Error:", e.message || e);
                generatedCards = generateMockAICards(req.file.originalname);
            }
        } else {
            console.log("No API key found. Using mock generator.");
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            generatedCards = generateMockAICards(req.file.originalname);
        }

        // 4. Return the JSON to the frontend
        res.json({
            success: true,
            message: 'Successfully processed document',
            cards: generatedCards
        });

    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ error: 'Failed to process document' });
    }
});

// removed fallback route

// Start Server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
