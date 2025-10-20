"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
import { TransactionItem } from "@/app/dashboard/Transaction/TransactionItem";
import { ExpenseModal } from "@/app/dashboard/Expense/ExpenseModal";
import { IncomeModal } from "@/app/dashboard/Income/IncomeModal";
import { SummarySection } from "./SummarySection";
import { TransactionList } from "./Transaction/TransactionList";

export default function Dashboard() {
  const [user, setUser] = useState<typeof auth.currentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [totalSpent, setTotalSpent] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>(
    {}
  );

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Transaction, "id">),
      }));
      setTransactions(data);

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
  }, [user]);

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
    setType("expense");
    setEditingTransaction(null);
    setExpenseModalOpen(false);
    setIncomeModalOpen(false);
  };
  const handleModalOpen = (opening: boolean, type: "income" | "expense") => {
    setDescription("");
    setAmount("");
    setCategory("");
    setType("expense");
    if (type === "expense") {
      setExpenseModalOpen(opening);
    } else {
      setIncomeModalOpen(opening);
    }
  };

  const handleEdit = async (updatedTransaction: Transaction, type: "expense" | "income") => {
  try {
    // Update the transaction locally (if stored in state)
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );

    // Optionally update in Firestore (if you're saving data there)
    const docRef = doc(db, "transactions", updatedTransaction.id);
    await updateDoc(docRef, {
      description: updatedTransaction.description,
      amount: updatedTransaction.amount,
      category: updatedTransaction.category,
      type: updatedTransaction.type,
    });

    console.log("✅ Transaction updated:", updatedTransaction);
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
    <div className="flex flex-col items-center min-h-screen bg-gray-50 text-gray-900 p-4">
      <div className="w-11/12 md:w-9/10 bg-white shadow-lg rounded-lg p-6 space-y-6 text-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p>Welcome, {user.email}!</p>

        <SummarySection
          totalSpent={totalSpent}
          totalIncome={totalIncome}
          categoryTotals={categoryTotals}
        />

        {/* Income Section */}
        <TransactionList
          title="Income"
          transactions={incomeItems}
          type="income"
          onDelete={handleDelete}
          onEdit={handleEdit}
          onOpenModal={(type) => handleModalOpen(true, type)}
        />


        {/* Expense Section */}
        <TransactionList
          title="Expense"
          transactions={expenseItems}
          type="expense"
          onDelete={handleDelete}
          onEdit={handleEdit}
          onOpenModal={(type) => handleModalOpen(true, type)}
        />


        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition mt-4 inline-block"
        >
          Back to Home
        </Link>
      </div>

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
        setType={setType}
        isModalOpen={isIncomeModalOpen}
        setIsModalOpen={setIncomeModalOpen}
        handleAddTransaction={() => handleAddTransaction("income")}
      />
    </div>
  );
}
