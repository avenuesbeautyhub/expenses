import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/database';
import { Debt } from '../models/index';

async function fixDebtUserIds() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Get all debts with string user IDs
    const debts = await Debt.find({});
    console.log(`Found ${debts.length} debt records`);

    let updatedCount = 0;
    for (const debt of debts) {
      // Check if user is stored as string instead of ObjectId
      if (typeof debt.user === 'string') {
        console.log(`Converting user ID for debt: ${debt.title}`);
        debt.user = new mongoose.Types.ObjectId(debt.user as string);
        await debt.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} debt records`);
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixDebtUserIds();
