import express from 'express';
import multer from 'multer';
import path from 'path';
import { createCar, deleteCar, getCarById, getCars, updateCar } from '../controllers/carControllers.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const carRouter = express.Router();

carRouter.get('/', getCars);
carRouter.get('/:id', getCarById);
carRouter.post('/', upload.single('image'), createCar);
carRouter.put('/:id', upload.single('image'), updateCar);
carRouter.delete('/:id', deleteCar);

export default carRouter;