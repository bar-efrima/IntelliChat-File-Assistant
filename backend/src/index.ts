import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
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

const upload = multer({ storage });

// app.use(cors());
// app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('IntelliChat Backend is running!');
});

app.get('/test', (req: Request, res: Response) => {
    res.json({ message: 'Backend is working!' });
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req: Request, res: Response): void => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return; // Ensure we exit after sending the response
    }

    res.status(200).json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        path: req.file.path,
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

