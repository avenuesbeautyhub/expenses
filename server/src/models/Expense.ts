import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  date: Date;
  paymentMethod: string;
  notes?: string;
  receipt?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
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
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Food', 'Grocery', 'Fuel', 'Rent', 'Shopping', 'Entertainment', 'Medical', 'Education', 'EMI', 'Bills', 'Travel', 'Insurance', 'Gifts', 'Investment', 'Others'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Please provide a payment method'],
      enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Wallet', 'Others'],
    },
    notes: {
      type: String,
      trim: true,
    },
    receipt: {
      type: String,
    },
    tags: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
