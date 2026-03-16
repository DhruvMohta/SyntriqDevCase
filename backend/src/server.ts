import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mockCrmRoutes from './routes/mockCrmRoutes';
import coreApiRoutes from './routes/coreApiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes Mount (Uncomment when routes are created)
app.use('/mock-crm', mockCrmRoutes);
app.use('/api', coreApiRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
