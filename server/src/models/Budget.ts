import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  user: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Food', 'Grocery', 'Fuel', 'Rent', 'Shopping', 'Entertainment', 'Medical', 'Education', 'EMI', 'Bills', 'Travel', 'Insurance', 'Gifts', 'Investment', 'Others'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0, 'Amount cannot be negative'],
    },
    month: {
      type: Number,
      required: [true, 'Please provide a month'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Please provide a year'],
    },
  },
  {
    timestamps: true,
  }
);

BudgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model<IBudget>('Budget', BudgetSchema);
