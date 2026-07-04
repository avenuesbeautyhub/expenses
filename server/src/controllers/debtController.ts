import { Request, Response } from 'express';
import { Debt } from '../models/index.js';

export const getDebts = async (req: any, res: Response): Promise<void> => {
  try {
    const { search, type, status, sortBy = 'date', sortOrder = 'desc', page = 1, limit = 20 } = req.query;

    const query: any = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { personName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [debts, total] = await Promise.all([
      Debt.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Debt.countDocuments(query)
    ]);

    res.json({
      debts,
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

export const getDebtById = async (req: any, res: Response): Promise<void> => {
  try {
    const debt = await Debt.findById(req.params.id);

    if (debt && debt.user.toString() === req.user._id.toString()) {
      res.json(debt);
    } else {
      res.status(404).json({ message: 'Debt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createDebt = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, amount, type, personName, date, dueDate, notes } = req.body;

    console.log('Creating debt with data:', { title, amount, type, personName, date, dueDate, notes });

    const debt = await Debt.create({
      user: req.user._id,
      title,
      amount,
      type,
      personName,
      date,
      dueDate,
      notes,
      returnedAmount: 0,
    });

    res.status(201).json(debt);
  } catch (error: any) {
    console.error('Error creating debt:', error);
    res.status(400).json({ message: error.message || 'Server error', error });
  }
};

export const updateDebt = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, amount, type, personName, date, dueDate, status, notes } = req.body;

    const debt = await Debt.findById(req.params.id);

    if (debt && debt.user.toString() === req.user._id.toString()) {
      debt.title = title || debt.title;
      debt.amount = amount !== undefined ? amount : debt.amount;
      debt.type = type || debt.type;
      debt.personName = personName || debt.personName;
      debt.date = date || debt.date;
      debt.dueDate = dueDate !== undefined ? dueDate : debt.dueDate;
      debt.status = status || debt.status;
      debt.notes = notes !== undefined ? notes : debt.notes;

      const updatedDebt = await debt.save();
      res.json(updatedDebt);
    } else {
      res.status(404).json({ message: 'Debt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const returnDebt = async (req: any, res: Response): Promise<void> => {
  try {
    const { returnedAmount } = req.body;

    const debt = await Debt.findById(req.params.id);

    if (debt && debt.user.toString() === req.user._id.toString()) {
      if (returnedAmount <= 0) {
        res.status(400).json({ message: 'Returned amount must be positive' });
        return;
      }

      debt.returnedAmount = (debt.returnedAmount || 0) + returnedAmount;

      if (debt.returnedAmount >= debt.amount) {
        debt.status = 'returned';
        debt.returnedAmount = debt.amount;
      } else {
        debt.status = 'partially_returned';
      }

      const updatedDebt = await debt.save();
      res.json(updatedDebt);
    } else {
      res.status(404).json({ message: 'Debt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteDebt = async (req: any, res: Response): Promise<void> => {
  try {
    const debt = await Debt.findById(req.params.id);

    if (debt && debt.user.toString() === req.user._id.toString()) {
      await debt.deleteOne();
      res.json({ message: 'Debt removed' });
    } else {
      res.status(404).json({ message: 'Debt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
