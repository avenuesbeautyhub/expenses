import { Request, Response } from 'express';
import { SavingsGoal } from '../models/index';

export const getSavingsGoals = async (req: any, res: Response): Promise<void> => {
  try {
    const { status, sortBy = 'targetDate', sortOrder = 'asc', page = 1, limit = 20 } = req.query;

    const query: any = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [goals, total] = await Promise.all([
      SavingsGoal.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      SavingsGoal.countDocuments(query)
    ]);

    res.json({
      goals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getSavingsGoalById = async (req: any, res: Response): Promise<void> => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (goal && goal.user.toString() === req.user._id.toString()) {
      res.json(goal);
    } else {
      res.status(404).json({ message: 'Savings goal not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createSavingsGoal = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, targetAmount, category, targetDate, description } = req.body;

    const goal = await SavingsGoal.create({
      user: req.user._id,
      title,
      targetAmount,
      currentAmount: 0,
      category,
      targetDate,
      description,
      status: 'active',
    });

    res.status(201).json(goal);
  } catch (error: any) {
    console.error('Error creating savings goal:', error);
    res.status(400).json({ message: error.message || 'Server error', error });
  }
};

export const updateSavingsGoal = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, targetAmount, currentAmount, category, targetDate, status, description } = req.body;

    const goal = await SavingsGoal.findById(req.params.id);

    if (goal && goal.user.toString() === req.user._id.toString()) {
      goal.title = title || goal.title;
      goal.targetAmount = targetAmount !== undefined ? targetAmount : goal.targetAmount;
      goal.currentAmount = currentAmount !== undefined ? currentAmount : goal.currentAmount;
      goal.category = category || goal.category;
      goal.targetDate = targetDate || goal.targetDate;
      goal.status = status || goal.status;
      goal.description = description !== undefined ? description : goal.description;

      const updatedGoal = await goal.save();
      res.json(updatedGoal);
    } else {
      res.status(404).json({ message: 'Savings goal not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const addContribution = async (req: any, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;

    const goal = await SavingsGoal.findById(req.params.id);

    if (goal && goal.user.toString() === req.user._id.toString()) {
      if (amount <= 0) {
        res.status(400).json({ message: 'Contribution amount must be positive' });
        return;
      }

      goal.currentAmount = (goal.currentAmount || 0) + amount;

      const updatedGoal = await goal.save();
      res.json(updatedGoal);
    } else {
      res.status(404).json({ message: 'Savings goal not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteSavingsGoal = async (req: any, res: Response): Promise<void> => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (goal && goal.user.toString() === req.user._id.toString()) {
      await goal.deleteOne();
      res.json({ message: 'Savings goal removed' });
    } else {
      res.status(404).json({ message: 'Savings goal not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
