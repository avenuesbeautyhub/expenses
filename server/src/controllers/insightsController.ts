import { Request, Response } from 'express';
import { Expense, Budget, Income } from '../models/index';

export const getFinancialInsights = async (req: any, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const { period = 'month' } = req.query;
    let startDate: Date;
    const endDate = new Date();

    if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1); // Start of current year
    } else if (period === 'all') {
      startDate = new Date(0); // Beginning of time
    } else {
      // Default to month (last 30 days)
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const [expenses, budgets, income] = await Promise.all([
      Expense.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      }),
      Budget.find({
        user: req.user._id,
        month: currentMonth + 1,
        year: currentYear,
      }),
      Income.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      }),
    ]);

    const totalExpense = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const totalIncome = income.reduce((sum: number, inc: any) => sum + inc.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    const categorySpending: Record<string, number> = expenses.reduce((acc: Record<string, number>, exp: any) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const insights = [];
    const warnings = [];
    const recommendations = [];

    // Analyze spending vs budgets
    budgets.forEach((budget: any) => {
      const spent = categorySpending[budget.category] || 0;
      const percentage = (spent / budget.amount) * 100;
      
      if (percentage > 100) {
        warnings.push({
          type: 'budget_exceeded',
          category: budget.category,
          message: `You've exceeded your ${budget.category} budget by ${percentage.toFixed(0)}%`,
          severity: 'high',
        });
      } else if (percentage > 80) {
        warnings.push({
          type: 'budget_warning',
          category: budget.category,
          message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget`,
          severity: 'medium',
        });
      }
    });

    // Analyze savings rate
    if (savingsRate < 10) {
      warnings.push({
        type: 'low_savings',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20%.`,
        severity: 'high',
      });
    } else if (savingsRate < 20) {
      recommendations.push({
        type: 'improve_savings',
        message: `Try to increase your savings rate from ${savingsRate.toFixed(1)}% to 20%.`,
      });
    } else {
      insights.push({
        type: 'good_savings',
        message: `Great job! Your savings rate is ${savingsRate.toFixed(1)}%.`,
      });
    }

    // Analyze top spending categories
    const sortedCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3);

    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0];
      const topCategoryPercentage = (topCategory[1] / totalExpense) * 100;
      
      insights.push({
        type: 'top_spending',
        category: topCategory[0],
        amount: topCategory[1],
        percentage: topCategoryPercentage,
        message: `Your highest spending category is ${topCategory[0]} at ${topCategoryPercentage.toFixed(1)}% of total expenses.`,
      });

      if (topCategoryPercentage > 50) {
        recommendations.push({
          type: 'diversify_spending',
          message: `Consider reducing ${topCategory[0]} expenses which make up ${topCategoryPercentage.toFixed(1)}% of your spending.`,
        });
      }
    }

    // Analyze income vs expenses
    if (totalExpense > totalIncome) {
      warnings.push({
        type: 'overspending',
        message: `You're spending more than you earn this month by ${(totalExpense - totalIncome).toLocaleString()}.`,
        severity: 'high',
      });
    }

    // Monthly comparison (compare with previous month)
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthEnd = new Date(currentYear, currentMonth, 0);
    
    const [prevExpenses, prevIncome] = await Promise.all([
      Expense.find({
        user: req.user._id,
        date: { $gte: prevMonthStart, $lte: prevMonthEnd },
      }),
      Income.find({
        user: req.user._id,
        date: { $gte: prevMonthStart, $lte: prevMonthEnd },
      }),
    ]);

    const prevTotalExpense = prevExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const expenseChange = totalExpense - prevTotalExpense;
    const expenseChangePercent = prevTotalExpense > 0 ? (expenseChange / prevTotalExpense) * 100 : 0;

    if (expenseChangePercent > 10) {
      warnings.push({
        type: 'spending_increase',
        message: `Your spending increased by ${expenseChangePercent.toFixed(1)}% compared to last month.`,
        severity: 'medium',
      });
    } else if (expenseChangePercent < -10) {
      insights.push({
        type: 'spending_decrease',
        message: `Great! Your spending decreased by ${Math.abs(expenseChangePercent).toFixed(1)}% compared to last month.`,
      });
    }

    res.json({
      summary: {
        totalExpense,
        totalIncome,
        savingsRate,
        budgetCount: budgets.length,
        expenseCount: expenses.length,
      },
      insights,
      warnings,
      recommendations,
      categoryBreakdown: categorySpending,
      topCategories: sortedCategories,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
