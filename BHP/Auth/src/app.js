import express from 'express';
import morgan from 'morgan';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';

import cors from 'cors';

const app = express();

//middleware
app.use(cors({
    origin: ["http://127.0.0.1:5000", "http://localhost:5000"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

//routes
app.use('/api/auth', authRouter);


export default app;


