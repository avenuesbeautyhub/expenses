import { Request, Response } from 'express';
import { Budget, Expense } from '../models/index';

export const getBudgets = async (req: any, res: Response): Promise<void> => {
  try {
    const { month, year } = req.query;

    const query: any = { user: req.user._id };

    if (month) query.month = parseInt(month as string);
    if (year) query.year = parseInt(year as string);

    const budgets = await Budget.find(query);

    const budgetsWithUsage = await Promise.all(
      budgets.map(async (budget: any) => {
        const startDate = new Date(budget.year, budget.month - 1, 1);
        const endDate = new Date(budget.year, budget.month, 0);

        const expenses = await Expense.find({
          user: req.user._id,
          category: budget.category,
          date: { $gte: startDate, $lte: endDate },
        });

        const totalSpent = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
        const remaining = budget.amount - totalSpent;
        const percentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

        return {
          ...budget.toObject(),
          spent: totalSpent,
          remaining,
          percentage,
          isExceeded: totalSpent > budget.amount,
        };
      })
    );

    res.json(budgetsWithUsage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getBudgetById = async (req: any, res: Response): Promise<void> => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (budget && budget.user.toString() === req.user._id.toString()) {
      const startDate = new Date(budget.year, budget.month - 1, 1);
      const endDate = new Date(budget.year, budget.month, 0);

      const expenses = await Expense.find({
        user: req.user._id,
        category: budget.category,
        date: { $gte: startDate, $lte: endDate },
      });

      const totalSpent = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      const remaining = budget.amount - totalSpent;
      const percentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

      res.json({
        ...budget.toObject(),
        spent: totalSpent,
        remaining,
        percentage,
        isExceeded: totalSpent > budget.amount,
      });
    } else {
      res.status(404).json({ message: 'Budget not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createBudget = async (req: any, res: Response): Promise<void> => {
  try {
    const { category, amount, month, year } = req.body;

    const existingBudget = await Budget.findOne({
      user: req.user._id,
      category,
      month,
      year,
    });

    if (existingBudget) {
      res.status(400).json({ message: 'Budget for this category already exists for this month' });
      return;
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount,
      month,
      year,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateBudget = async (req: any, res: Response): Promise<void> => {
  try {
    const { category, amount, month, year } = req.body;

    const budget = await Budget.findById(req.params.id);

    if (budget && budget.user.toString() === req.user._id.toString()) {
      budget.category = category || budget.category;
      budget.amount = amount !== undefined ? amount : budget.amount;
      budget.month = month !== undefined ? month : budget.month;
      budget.year = year !== undefined ? year : budget.year;

      const updatedBudget = await budget.save();
      res.json(updatedBudget);
    } else {
      res.status(404).json({ message: 'Budget not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteBudget = async (req: any, res: Response): Promise<void> => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (budget && budget.user.toString() === req.user._id.toString()) {
      await budget.deleteOne();
      res.json({ message: 'Budget removed' });
    } else {
      res.status(404).json({ message: 'Budget not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
