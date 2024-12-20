import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import * as fsSync from 'fs'; 
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

const app = express();
const PORT = process.env.PORT || 5000;

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

// File upload endpoint
app.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return; // Ensure we exit after sending the response
    }

    const filePath = req.file.path;

    try {
        let fileContent = '';

        // Handle different file types
        if (req.file.mimetype === 'application/pdf') { // Check if the file is a PDF
            const fileBuffer = await fs.readFile(filePath);
            const pdfData = await pdfParse(fileBuffer);
            fileContent = pdfData.text;
        } else if ( 
            req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            const fileBuffer = await fs.readFile(filePath);
            const wordData = await mammoth.extractRawText({ buffer: fileBuffer });
            fileContent = wordData.value;
        } else {
            res.status(400).json({ message: 'Unsupported file type' });
            return;
        }
    
        const chunkSize = 500;
        const chunks = fileContent.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];


        res.status(200).json({
            message: 'File uploaded successfully',
            // filename: req.file.filename,
            // path: req.file.path,
            chunks,
        });
    } catch (error) {
        console.error('Error parsing file:', error);
        res.status(500).json({ message: 'Error parsing file' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

