import mongoose, { Document, Schema } from 'mongoose';

export interface IDebt extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  type: 'borrow' | 'lend';
  personName: string;
  date: Date;
  dueDate?: Date;
  status: 'pending' | 'partially_returned' | 'returned';
  returnedAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DebtSchema: Schema = new Schema(
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
      min: [0, 'Amount cannot be negative'],
    },
    type: {
      type: String,
      required: [true, 'Please provide a debt type'],
      enum: ['borrow', 'lend'],
    },
    personName: {
      type: String,
      required: [true, 'Please provide the person name'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'partially_returned', 'returned'],
      default: 'pending',
    },
    returnedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Returned amount cannot be negative'],
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

export default mongoose.model<IDebt>('Debt', DebtSchema);
