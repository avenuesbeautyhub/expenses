import { Request, Response } from 'express';
import { Reminder } from '../models/index';

export const getReminders = async (req: any, res: Response): Promise<void> => {
  try {
    const { status, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;

    const query: any = { user: req.user._id };

    if (status === 'paid') {
      query.isPaid = true;
    } else if (status === 'unpaid') {
      query.isPaid = false;
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const reminders = await Reminder.find(query).sort(sortOptions);

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getReminderById = async (req: any, res: Response): Promise<void> => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (reminder && reminder.user.toString() === req.user._id.toString()) {
      res.json(reminder);
    } else {
      res.status(404).json({ message: 'Reminder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createReminder = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, amount, dueDate, category, isRecurring, recurringPeriod, notes } = req.body;

    const reminder = await Reminder.create({
      user: req.user._id,
      title,
      amount,
      dueDate,
      category,
      isRecurring,
      recurringPeriod,
      notes,
    });

    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateReminder = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, amount, dueDate, category, isRecurring, recurringPeriod, notes, isPaid } = req.body;

    const reminder = await Reminder.findById(req.params.id);

    if (reminder && reminder.user.toString() === req.user._id.toString()) {
      reminder.title = title || reminder.title;
      reminder.amount = amount !== undefined ? amount : reminder.amount;
      reminder.dueDate = dueDate || reminder.dueDate;
      reminder.category = category || reminder.category;
      reminder.isRecurring = isRecurring !== undefined ? isRecurring : reminder.isRecurring;
      reminder.recurringPeriod = recurringPeriod || reminder.recurringPeriod;
      reminder.notes = notes !== undefined ? notes : reminder.notes;
      reminder.isPaid = isPaid !== undefined ? isPaid : reminder.isPaid;

      const updatedReminder = await reminder.save();
      res.json(updatedReminder);
    } else {
      res.status(404).json({ message: 'Reminder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteReminder = async (req: any, res: Response): Promise<void> => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (reminder && reminder.user.toString() === req.user._id.toString()) {
      await reminder.deleteOne();
      res.json({ message: 'Reminder removed' });
    } else {
      res.status(404).json({ message: 'Reminder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUpcomingReminders = async (req: any, res: Response): Promise<void> => {
  try {
    const { days = 7 } = req.query;
    const now = new Date();
    const futureDate = new Date(now.getTime() + parseInt(days as string) * 24 * 60 * 60 * 1000);

    const reminders = await Reminder.find({
      user: req.user._id,
      isPaid: false,
      dueDate: { $gte: now, $lte: futureDate },
    }).sort({ dueDate: 1 });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
