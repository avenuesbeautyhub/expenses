import { Request, Response } from 'express';
import { Income } from '../models';

export const getIncome = async (req: any, res: Response): Promise<void> => {
  try {
    const { search, source, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;

    const query: any = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (source) {
      query.source = source;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const income = await Income.find(query).sort(sortOptions);

    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getIncomeById = async (req: any, res: Response): Promise<void> => {
  try {
    const income = await Income.findById(req.params.id);

    if (income && income.user.toString() === req.user._id.toString()) {
      res.json(income);
    } else {
      res.status(404).json({ message: 'Income not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createIncome = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, amount, source, date, notes, tags } = req.body;

    const income = await Income.create({
      user: req.user._id,
      title,
      amount,
      source,
      date,
      notes,
      tags,
    });

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateIncome = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, amount, source, date, notes, tags } = req.body;

    const income = await Income.findById(req.params.id);

    if (income && income.user.toString() === req.user._id.toString()) {
      income.title = title || income.title;
      income.amount = amount !== undefined ? amount : income.amount;
      income.source = source || income.source;
      income.date = date || income.date;
      income.notes = notes !== undefined ? notes : income.notes;
      income.tags = tags !== undefined ? tags : income.tags;

      const updatedIncome = await income.save();
      res.json(updatedIncome);
    } else {
      res.status(404).json({ message: 'Income not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteIncome = async (req: any, res: Response): Promise<void> => {
  try {
    const income = await Income.findById(req.params.id);

    if (income && income.user.toString() === req.user._id.toString()) {
      await income.deleteOne();
      res.json({ message: 'Income removed' });
    } else {
      res.status(404).json({ message: 'Income not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
