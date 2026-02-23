import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uplodsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uplodsDir)) { 
    fs.mkdirSync(uplodsDir);
}

const storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, uplodsDir);
    },
    filename: (req, file, cb) => { 
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
        cb(null, `${base}-${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
 }

 export const uploads = multer({ storage, 
    limits: {
        fileSize : 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter });
