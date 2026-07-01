import mongoose, { Document, Schema } from 'mongoose';

export interface IReminder extends Document {
  user: string;
  title: string;
  amount: number;
  dueDate: Date;
  category: string;
  isRecurring: boolean;
  recurringPeriod?: 'monthly' | 'yearly' | 'weekly';
  isPaid: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide a due date'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Rent', 'EMI', 'Utilities', 'Insurance', 'Subscription', 'Credit Card', 'Loan', 'Others'],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPeriod: {
      type: String,
      enum: ['monthly', 'yearly', 'weekly'],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
