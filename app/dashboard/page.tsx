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
import { TransactionItem } from "@/app/dashboard/TransactionItem";
import { TransactionModal } from "@/app/dashboard/TransactionModal";
import { SummarySection } from "./SummarySection";

export default function Dashboard() {
  const [user, setUser] = useState<typeof auth.currentUser | null>(null);
  const [loading, setLoading] = useState(true); // track auth loading
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [totalSpent, setTotalSpent] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>(
    {}
  );

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  // 🔹 Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Fetch transactions only after user is loaded
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
      // --- Calculate summary ---
      let total = 0;
      const categoryMap: Record<string, number> = {};

      data.forEach((t) => {
        total += t.amount;
        if (categoryMap[t.category]) {
          categoryMap[t.category] += t.amount;
        } else {
          categoryMap[t.category] = t.amount;
        }
      });
      setTotalSpent(total);
      setCategoryTotals(categoryMap);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddTransaction = async () => {
    if (!description || !amount || !category) return;

    if (editingTransaction) {
      // Update existing transaction
      await updateDoc(doc(db, "transactions", editingTransaction.id), {
        description,
        amount: parseFloat(amount),
        category,
      });
    } else {
      // Add new transaction
      await addDoc(collection(db, "transactions"), {
        description,
        amount: parseFloat(amount),
        category,
        userId: user?.uid,
        createdAt: new Date(),
      });
    }

    // Reset modal state
    setDescription("");
    setAmount("");
    setCategory("");
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "transactions", id));
  };

  if (loading) return <p>Loading...</p>; // wait for auth

  if (!user) return <p>Please log in to access the dashboard.</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 text-gray-900 p-4">
      <div className="w-11/12 md:w-9/10 bg-white shadow-lg rounded-lg p-6 space-y-6 text-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p>Welcome, {user.email}!</p>
        <div className="mt-4 text-left">
          <SummarySection
            totalSpent={totalSpent}
            categoryTotals={categoryTotals}
          />
        </div>

        <div className="mt-4 text-left">
          <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            onClick={() => setIsModalOpen(true)}
          >
            Add Transaction
          </button>
          <ul className="space-y-2">
            {transactions.map((t) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </ul>
        </div>

        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition mt-4 inline-block"
        >
          Back to Home
        </Link>
      </div>
      <TransactionModal
        description={description}
        setDescription={setDescription}
        amount={amount}
        setAmount={setAmount}
        category={category}
        setCategory={setCategory}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleAddTransaction={handleAddTransaction}
      />
    </div>
  );
}
