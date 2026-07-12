import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import expenseRoutes from './routes/expenseRoutes';
import incomeRoutes from './routes/incomeRoutes';
import budgetRoutes from './routes/budgetRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import reminderRoutes from './routes/reminderRoutes';
import insightsRoutes from './routes/insightsRoutes';
import debtRoutes from './routes/debtRoutes';
import savingsGoalRoutes from './routes/savingsGoalRoutes';

const app: Application = express();

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

connectDB();

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/savings-goals', savingsGoalRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
