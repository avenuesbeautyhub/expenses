import mongoose, { Document, Schema } from 'mongoose';

export interface IIncome extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  source: string;
  date: Date;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema: Schema = new Schema(
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
    source: {
      type: String,
      required: [true, 'Please provide a source'],
      enum: ['Salary', 'Business', 'Freelance', 'Bonus', 'Investment', 'Others'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IIncome>('Income', IncomeSchema);
