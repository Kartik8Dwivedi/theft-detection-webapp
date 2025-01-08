import express from 'express';
import { detectPaper } from '../../Controllers/index.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.get('/', (req, res) => {
    res.send(`<h1>Hello from the microservice!</h1>`);
});

router.post(
  "/detect-papers",
  upload.fields([
    { name: "initialImage", maxCount: 1 },
    { name: "finalImage", maxCount: 1 },
  ]),
    detectPaper
);

export default router;