import { Request, Response } from 'express';
import { Expense } from '../models';

export const getExpenses = async (req: any, res: Response): Promise<void> => {
  try {
    const { search, category, startDate, endDate, paymentMethod, sortBy = 'date', sortOrder = 'desc' } = req.query;

    const query: any = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const expenses = await Expense.find(query).sort(sortOptions);

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getExpenseById = async (req: any, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (expense && expense.user.toString() === req.user._id.toString()) {
      res.json(expense);
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createExpense = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, amount, category, date, paymentMethod, notes, receipt, tags } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      date,
      paymentMethod,
      notes,
      receipt,
      tags,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateExpense = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, amount, category, date, paymentMethod, notes, receipt, tags } = req.body;

    const expense = await Expense.findById(req.params.id);

    if (expense && expense.user.toString() === req.user._id.toString()) {
      expense.title = title || expense.title;
      expense.amount = amount !== undefined ? amount : expense.amount;
      expense.category = category || expense.category;
      expense.date = date || expense.date;
      expense.paymentMethod = paymentMethod || expense.paymentMethod;
      expense.notes = notes !== undefined ? notes : expense.notes;
      expense.receipt = receipt !== undefined ? receipt : expense.receipt;
      expense.tags = tags !== undefined ? tags : expense.tags;

      const updatedExpense = await expense.save();
      res.json(updatedExpense);
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteExpense = async (req: any, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (expense && expense.user.toString() === req.user._id.toString()) {
      await expense.deleteOne();
      res.json({ message: 'Expense removed' });
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
