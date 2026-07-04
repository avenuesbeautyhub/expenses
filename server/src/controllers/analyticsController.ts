import { Request, Response } from 'express';
import { Expense, Income } from '../models/index';

export const getDashboardData = async (req: any, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = new Date();

    const totalExpenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const totalIncome = await Income.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const totalExpenseAmount = totalExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const totalIncomeAmount = totalIncome.reduce((sum: number, inc: any) => sum + inc.amount, 0);
    const savings = totalIncomeAmount - totalExpenseAmount;

    const categoryBreakdown = totalExpenses.reduce((acc: any, expense: any) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const recentTransactions = [
      ...totalExpenses.map((e: any) => ({ ...e.toObject(), type: 'expense' })),
      ...totalIncome.map((i: any) => ({ ...i.toObject(), type: 'income' })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    res.json({
      totalBalance: savings,
      totalIncome: totalIncomeAmount,
      totalExpense: totalExpenseAmount,
      savings,
      monthlySpending: totalExpenseAmount,
      categoryBreakdown,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getReports = async (req: any, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, type = 'daily' } = req.query;

    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      const now = new Date();
      if (type === 'all-time') {
        start = new Date(0); // Beginning of time
        end = new Date(); // Now
      } else if (type === 'daily') {
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
      } else if (type === 'weekly') {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(now.setDate(diff));
        end = new Date(now.setDate(diff + 6));
      } else if (type === 'yearly') {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
    }

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    });

    const income = await Income.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    });

    const totalExpense = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const totalIncome = income.reduce((sum: number, inc: any) => sum + inc.amount, 0);
    const savings = totalIncome - totalExpense;

    const categoryBreakdown = expenses.reduce((acc: any, expense: any) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const highestExpense = expenses.length > 0 
      ? expenses.reduce((max: any, exp: any) => exp.amount > max.amount ? exp : max, expenses[0])
      : null;

    const lowestExpense = expenses.length > 0
      ? expenses.reduce((min: any, exp: any) => exp.amount < min.amount ? exp : min, expenses[0])
      : null;

    res.json({
      period: { startDate: start, endDate: end },
      totalIncome,
      totalExpense,
      savings,
      categoryBreakdown,
      highestExpense,
      lowestExpense,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMonthlyTrend = async (req: any, res: Response): Promise<void> => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      const expenses = await Expense.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      });

      const income = await Income.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      });

      const totalExpense = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      const totalIncome = income.reduce((sum: number, inc: any) => sum + inc.amount, 0);

      monthlyData.push({
        month: month + 1,
        monthName: new Date(currentYear, month).toLocaleString('default', { month: 'short' }),
        income: totalIncome,
        expense: totalExpense,
        savings: totalIncome - totalExpense,
      });
    }

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
