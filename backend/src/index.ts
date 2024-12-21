import express, { Request, Response } from 'express';
import cors from 'cors'; // library for enabling CORS
import multer from 'multer'; // library for handling file uploads
import path from 'path'; 
import { promises as fs } from 'fs'; // library for handling file system operations
import * as fsSync from 'fs';  // asynchronous file system operations
import mammoth from 'mammoth'; // library for parsing Word documents
import pdfParse from 'pdf-parse'; // library for parsing PDF documents
import computeCosineSimilarity from 'compute-cosine-similarity'; // library for computing cosine similarity
import dotenv from 'dotenv';
import OpenAI from 'openai'; // library for interacting with the OpenAI API

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

const app = express(); // Initialize Express app, Node.js web application framework
const PORT = process.env.PORT || 5000; // Port number for the server

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(express.json()); // Enable JSON body parsing for all requests

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads'); // Path to the uploads directory
if (!fsSync.existsSync(uploadDir)) {
    fsSync.mkdirSync(uploadDir); // Use synchronous method
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files to the uploads directory
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // Generate a unique name for the file
    },
});

const upload = multer({ storage }); // Initialize multer with the storage configuration

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.send('IntelliChat Backend is running!');
});

// Test endpoint
app.get('/test', (req: Request, res: Response) => {
    res.json({ message: 'Backend is working!' });
});

// Global memory for embeddings and chunks
const embeddingsStore: { embeddings: number[][]; chunks: string[] } = {
    embeddings: [],
    chunks: [],
};

// Function to split text into semantic chunks
/*
    This function splits text into semantic chunks based on the number of words.
    It ensures that sentences are not split across chunks and that each chunk is within the word limit.
 */

function splitIntoSemanticChunks(text: string, maxWords: number): string[] {
    const paragraphs = text.split(/\n+/); // Split text by paragraphs
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let wordCount = 0;

    paragraphs.forEach((paragraph) => {
        const sentences = paragraph.split(/(?<=[.!?])\s+/); // split a string based on punctuation marks followed by whitespac
        sentences.forEach((sentence) => {
            const sentenceWords = sentence.split(/\s+/).length; // Count words in the sentence
            if (wordCount + sentenceWords <= maxWords) { // Check if adding the sentence exceeds the word limit
                currentChunk.push(sentence);
                wordCount += sentenceWords;
            } else {
                if (currentChunk.length > 0) { 
                    chunks.push(currentChunk.join(' ')); // Combine sentences into a chunk
                }
                currentChunk = [sentence];
                wordCount = sentenceWords;
            }
        });
    });

    // Add the last chunk if it has content
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }

    return chunks;
}


// File upload endpoint
/* 
    This endpoint accepts a file upload and processes the file to extract its content.
    The content is split into semantic chunks and embeddings are generated for each chunk.
    The embeddings and chunks are stored in memory for later use.
*/
app.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return; // Ensure we exit after sending the response
    }

    const filePath = req.file.path;

    try {
        console.log(`Received file: ${req.file.originalname} (${req.file.mimetype})`);
        let fileContent = '';
        
        /* Handle different file types */
        if (req.file.mimetype === 'application/pdf') { // Check if the file is a PDF
            console.log('Parsing PDF file...');
            const fileBuffer = await fs.readFile(filePath);
            const pdfData = await pdfParse(fileBuffer);
            fileContent = pdfData.text;
            console.log('PDF parsing completed. Extracted content:');
            console.log(fileContent.slice(0, 500)); // Log the first 500 characters
        } 
        // Check if the file is a Word document
        else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { 
            console.log('Parsing Word document...');
            const fileBuffer = await fs.readFile(filePath);
            const wordData = await mammoth.extractRawText({ buffer: fileBuffer });
            fileContent = wordData.value;
            console.log('Word document parsing completed. Extracted content:');
            console.log(fileContent.slice(0, 500)); // Log the first 500 characters
        } else {
            console.log('Unsupported file type.');
            res.status(400).json({ message: 'Unsupported file type' });
            return;
        }
    
        // Split the file content into semantic chunks
        const maxWordsPerChunk = 300; // Maximum number of words per chunk
        const chunks = splitIntoSemanticChunks(fileContent, maxWordsPerChunk);
        console.log(`File content split into ${chunks.length} semantic chunks.`);

        // Generate embeddings for each chunk
        console.log('Generating embeddings...');
        const embeddings = await Promise.all(
            chunks.map(async (chunk, index) => {
                try {
                    console.log(`Embedding chunk ${index + 1}/${chunks.length}`);
                    console.log(`Chunk content: ${chunk}`); // Log the first 100 characters of the chunk
                    const response = await openai.embeddings.create({
                        model: 'text-embedding-ada-002',
                        input: chunk,
                    });
                    console.log(`Embedding generated for chunk ${index + 1}`);
                    console.log(`Embedding: ${response.data[0].embedding.slice(0, 10)}...`); // Log the first 10 dimensions of the embedding
                    return response.data[0].embedding;
                } catch (error) {
                    console.error(`Error embedding chunk ${index + 1}:`, error);
                    throw error; // Re-throw the error to ensure it’s handled properly
                }
            })
        );

        // Store embeddings and chunks in memory
        embeddingsStore.embeddings = embeddings;
        embeddingsStore.chunks = chunks;

        res.status(200).json({ message: `File uploaded and processed successfully. You can now ask questions about ${req.file.originalname}.` });
    } catch (error) {
        console.error('Error parsing file:', error);
        res.status(500).json({ message: 'Error parsing file' });
    }
});

// Chat endpoint
/*
    This endpoint accepts a question and generates a response based on the context provided by the most relevant chunks.
    The response is generated using the OpenAI GPT model.
*/
app.post('/chat', async (req: Request, res: Response): Promise<void> => {
    const { question } = req.body;

    if (!question) {
        res.status(400).json({ message: 'Question is required' });
        return;
    }

    try {
        // Generate embedding for the question
        const questionEmbeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: question,
        });
        // Extract the embedding vector from the response
        const questionEmbedding = questionEmbeddingResponse.data[0].embedding; 

        // Compute similarity between question embedding and stored embeddings
        const similarities = embeddingsStore.embeddings.map((embedding, index) => ({
            chunk: embeddingsStore.chunks[index],
            similarity: computeCosineSimilarity(questionEmbedding, embedding),
        }));

        // Sort chunks by similarity in descending order
        const sortedChunks = similarities
        .filter((item) => item.similarity !== null && item.similarity !== undefined) // Filter out null or undefined
        .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0)) // Use null-coalescing
        .slice(0, 3); // Take top 3 most relevant chunks


        // Generate response using OpenAI GPT model
        const context = sortedChunks.map((item) => item.chunk).join('\n');
        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant that strictly answers questions based only on the provided context. 
                              `
                },
                {
                    role: 'user',
                    content: `Answer the question based on the following context:\n\n${context}\n\nQuestion: ${question}`
                },
            ]
        });
        
        // Safely extract the content of the first choice
        const answer = gptResponse.choices?.[0]?.message?.content || 'No response generated';

        res.status(200).json({ answer, relevantChunks: sortedChunks });
    } catch (error) {
        console.error('Error processing chat request:', error);
        res.status(500).json({ message: 'Error processing chat request' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

