import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.send(`<h1>Hello from the microservice!</h1>`);
});

export default router;