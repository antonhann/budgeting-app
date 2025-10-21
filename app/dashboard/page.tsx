"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Transaction } from "@/types/transaction";
import { TransactionList } from "./Transaction/TransactionList";
import { SummarySection } from "./SummarySection";
import { ExpenseModal } from "@/app/dashboard/Expense/ExpenseModal";
import { IncomeModal } from "@/app/dashboard/Income/IncomeModal";
import { DateFilter } from "./DateFilter";
import { FilterState } from "@/types/filterState";

export default function Dashboard() {
  const [user, setUser] = useState<typeof auth.currentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [totalSpent, setTotalSpent] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>(
    {}
  );

  // Date filter state
  const [filter, setFilter] = useState<FilterState>({
    type: "month",
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    startDate: null,
    endDate: null,
  });

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Compute start/end dates based on filter
  const computeFilterDates = useCallback(() => {
    let start: Date | null = null;
    let end: Date | null = null;

    if (filter.type === "month") {
      start = new Date(filter.year, filter.month, 1);
      end = new Date(filter.year, filter.month + 1, 0, 23, 59, 59);
    } else if (filter.type === "year") {
      start = new Date(filter.year, 0, 1);
      end = new Date(filter.year, 11, 31, 23, 59, 59);
    } else if (filter.type === "custom") {
      start = filter.startDate;
      end = filter.endDate;
    }

    return { start, end };
  }, [filter]);

  // Firestore listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Transaction, "id">),
      }));

      // Filter by selected dates
      const { start, end } = computeFilterDates();
      if (start || end) {
        data = data.filter((t) => {
          const createdAt =
            t.createdAt instanceof Date ? t.createdAt : t.createdAt.toDate();
          if (start && createdAt < start) return false;
          if (end && createdAt > end) return false;
          return true;
        });
      }

      setTransactions(data);

      // recalc totals
      let spent = 0;
      let income = 0;
      const categoryMap: Record<string, number> = {};

      data.forEach((t) => {
        if (t.type === "expense") {
          spent += t.amount;
          categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        } else {
          income += t.amount;
        }
      });

      setTotalSpent(spent);
      setCategoryTotals(categoryMap);
      setTotalIncome(income);
    });

    return () => unsubscribe();
  }, [user, computeFilterDates]);

  // Add / Update transaction
  const handleAddTransaction = async (
    transactionType: "income" | "expense"
  ) => {
    if (!description || !amount) return;

    if (editingTransaction) {
      await updateDoc(doc(db, "transactions", editingTransaction.id), {
        description,
        amount: parseFloat(amount),
        category,
        type: transactionType,
      });
    } else {
      await addDoc(collection(db, "transactions"), {
        description,
        amount: parseFloat(amount),
        category,
        type: transactionType,
        userId: user?.uid,
        createdAt: new Date(),
      });
    }

    setDescription("");
    setAmount("");
    setCategory("");
    setEditingTransaction(null);
    setExpenseModalOpen(false);
    setIncomeModalOpen(false);
  };

  const handleModalOpen = (
    opening: boolean,
    modalType: "income" | "expense"
  ) => {
    setDescription("");
    setAmount("");
    setCategory("");
    if (modalType === "expense") setExpenseModalOpen(opening);
    else setIncomeModalOpen(opening);
  };

  const handleEdit = async (updatedTransaction: Transaction) => {
    try {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === updatedTransaction.id ? updatedTransaction : t
        )
      );

      const docRef = doc(db, "transactions", updatedTransaction.id);
      await updateDoc(docRef, {
        description: updatedTransaction.description,
        amount: updatedTransaction.amount,
        category: updatedTransaction.category,
        type: updatedTransaction.type,
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "transactions", id));
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to access the dashboard.</p>;

  const incomeItems = transactions.filter((t) => t.type === "income");
  const expenseItems = transactions.filter((t) => t.type === "expense");

  return (
    <div className="min-h-screen p-4 bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto mb-6 text-center md:text-left">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p>Welcome, {user.email}!</p>
      </div>

      <DateFilter filter={filter} setFilter={setFilter} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <SummarySection
            totalSpent={totalSpent}
            totalIncome={totalIncome}
            categoryTotals={categoryTotals}
          />
        </div>

        {/* Income Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <TransactionList
            title="Income"
            transactions={incomeItems}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          <button
            className="px-4 py-2 rounded-xl text-white transition bg-green-600 hover:bg-green-700"
            onClick={() => handleModalOpen(true, "income")}
          >
            Add Income
          </button>
        </div>

        {/* Expenses Section */}
        <div className="md:col-span-2 bg-white shadow-lg rounded-lg p-6">
          <TransactionList
            title="Expense"
            transactions={expenseItems}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          <button
            className="px-4 py-2 rounded-xl text-white transition bg-red-600 hover:bg-red-700"
            onClick={() => handleModalOpen(true, "expense")}
          >
            Add Expense
          </button>
        </div>
      </div>

      {/* Modals */}
      <ExpenseModal
        description={description}
        setDescription={setDescription}
        amount={amount}
        setAmount={setAmount}
        category={category}
        setCategory={setCategory}
        isModalOpen={isExpenseModalOpen}
        setIsModalOpen={setExpenseModalOpen}
        handleAddTransaction={() => handleAddTransaction("expense")}
      />

      <IncomeModal
        description={description}
        setDescription={setDescription}
        amount={amount}
        setAmount={setAmount}
        isModalOpen={isIncomeModalOpen}
        setIsModalOpen={setIncomeModalOpen}
        handleAddTransaction={() => handleAddTransaction("income")}
      />

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
