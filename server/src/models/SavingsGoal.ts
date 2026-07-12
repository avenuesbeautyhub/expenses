import mongoose, { Document, Schema } from 'mongoose';

export interface ISavingsGoal extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  targetDate: Date;
  status: 'active' | 'completed' | 'paused';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavingsGoalSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a goal title'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please provide a target amount'],
      min: [0, 'Target amount cannot be negative'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    targetDate: {
      type: Date,
      required: [true, 'Please provide a target date'],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update status based on progress
SavingsGoalSchema.pre('save', function(this: ISavingsGoal, next) {
  if (this.currentAmount >= this.targetAmount && this.status !== 'completed') {
    this.status = 'completed';
  } else if (this.currentAmount < this.targetAmount && this.status === 'completed') {
    this.status = 'active';
  }
  next();
});

export default mongoose.model<ISavingsGoal>('SavingsGoal', SavingsGoalSchema);
