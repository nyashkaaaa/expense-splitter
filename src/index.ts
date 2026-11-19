import { Expense, SplitType } from './types';
import { loadExpenses, saveExpenses, DEFAULT_FILE } from './storage';
import { calculateSplit, validateExpense, calculateBalances, settleDebts } from './expenses';

function getFlag(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

function printHelp(): void {
  console.log(`Expense Splitter

Usage:
  add <description> <amount> --paid-by <name> --with <a,b,c> [--split equal|percent|exact] [--values 50,30,20]
  list
  balance
  settle
  help

Options:
  --file <path>   use another data file (default: ${DEFAULT_FILE})`);
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];
  const file = getFlag(args, '--file') || DEFAULT_FILE;

  if (command === 'add') {
    const description = args[1];
    const amount = parseFloat(args[2]);
    const paidBy = getFlag(args, '--paid-by') || '';
    const participants = (getFlag(args, '--with') || '').split(',').filter((p) => p);
    const splitType = (getFlag(args, '--split') || 'equal') as SplitType;
    const valuesRaw = getFlag(args, '--values');
    const values = valuesRaw ? valuesRaw.split(',').map((v) => parseFloat(v)) : undefined;

    const expenses = loadExpenses(file);
    const expense: Expense = {
      id: expenses.length + 1,
      description,
      amount,
      paidBy,
      participants,
      splitType,
      values,
      date: new Date().toISOString(),
    };

    const error = validateExpense(expense);
    if (error) {
      console.log('Error: ' + error);
      return;
    }

    expenses.push(expense);
    saveExpenses(expenses, file);

    console.log(`Added #${expense.id}: ${description} (${amount}) paid by ${paidBy}`);
    for (const s of calculateSplit(expense)) {
      console.log(`  ${s.person} owes ${s.amount}`);
    }
  } else if (command === 'list') {
    const expenses = loadExpenses(file);
    if (expenses.length === 0) {
      console.log('No expenses yet.');
    }
    for (const e of expenses) {
      console.log(`#${e.id} ${e.description} - ${e.amount} paid by ${e.paidBy} [${e.splitType}] with ${e.participants.join(', ')}`);
    }
  } else if (command === 'balance') {
    const balances = calculateBalances(loadExpenses(file));
    for (const [person, value] of Object.entries(balances)) {
      console.log(`${person}: ${value}`);
    }
  } else if (command === 'settle') {
    const debts = settleDebts(calculateBalances(loadExpenses(file)));
    if (debts.length === 0) {
      console.log('Everyone is settled up.');
    }
    for (const d of debts) {
      console.log(`${d.from} -> ${d.to}: ${d.amount}`);
    }
  } else {
    printHelp();
  }
}

main();
