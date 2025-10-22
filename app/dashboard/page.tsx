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
import {
  IncomeModal,
  IncomeStreamForm,
} from "@/app/dashboard/Income/IncomeModal";
import { DateFilter } from "./DateFilter";
import { FilterState } from "@/types/filterState";
import { Income } from "@/types/incomeStream";
import { IncomeList } from "./Income/IncomeList";

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
  const [incomeStreams, setIncomeStreams] = useState<Income[]>([]);
  // Income stream state

  // Form state
  const [streamForm, setStreamForm] = useState<IncomeStreamForm>({
    name: "",
    type: "monthly",
    amount: "",
    hoursPerWeek: "",
    startDate: "",
  });
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
  useEffect(() => {
    if (!user) return;

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const incomeStreamsQuery = query(
      collection(db, "incomeStreams"),
      where("userId", "==", user.uid)
    );

    const computeTotalIncome = (
      streams: Income[],
      filterType: "month" | "year" | "custom",
      start?: Date | null,
      end?: Date | null
    ) => {
      const monthlyEquivalent = (s: Income) => {
        switch (s.type) {
          case "cash":
            return s.amount; // one-time cash
          case "biweekly":
            return s.amount * 2; // approx monthly
          case "monthly":
            return s.amount;
          case "yearly":
            return s.amount / 12;
          default:
            return 0;
        }
      };

      const yearlyEquivalent = (s: Income) => monthlyEquivalent(s) * 12;

      const dailyEquivalent = (s: Income) => yearlyEquivalent(s) / 365;
      let total; 
      if (filterType === "custom" && start && end) {
        // Custom date range → calculate based on daily equivalent
        return streams.reduce((sum, s) => {
          if (!s.startDate) return sum;

          const streamStart = new Date(s.startDate);
          const streamEnd = s.endDate ? new Date(s.endDate) : end;

          const overlapStart = streamStart > start ? streamStart : start;
          const overlapEnd = streamEnd < end ? streamEnd : end;

          const diffMs = overlapEnd.getTime() - overlapStart.getTime();
          if (diffMs <= 0) return sum;

          const days = diffMs / (1000 * 60 * 60 * 24);
          total = sum + dailyEquivalent(s) * days;
          return Math.round(total * 100) / 100
        }, 0);
      } else if (filterType === "year") {
        // Year view → sum yearly equivalents
        total = streams.reduce((sum, s) => sum + yearlyEquivalent(s), 0);
      } else {
        // Month view or default → sum monthly equivalents
        total = streams.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
      }
      return Math.round(total * 100) / 100

    };

    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
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
        
        // Recalc totals
        const spent = data
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        const categoryMap: Record<string, number> = {};
        data.forEach((t) => {
          if (t.type === "expense") {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
          }
        });

        setTotalSpent(spent);
        setCategoryTotals(categoryMap);
      }
    );

    const unsubscribeIncomeStreams = onSnapshot(
      incomeStreamsQuery,
      (snapshot) => {
        const streams = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Income, "id">),
        }));

        const { start, end } = computeFilterDates();

        const filteredStreams = streams.filter((s) => {
          if (!s.startDate) return false;

          // Convert startDate
          let startDate: Date;
          if (
            "toDate" in s.startDate &&
            typeof s.startDate.toDate === "function"
          ) {
            startDate = s.startDate.toDate();
          } else {
            startDate = new Date(s.startDate);
          }

          // Convert endDate if exists
          let endDate: Date | null = null;
          if (s.endDate) {
            if (
              "toDate" in s.endDate &&
              typeof s.endDate.toDate === "function"
            ) {
              endDate = s.endDate.toDate();
            } else {
              endDate = new Date(s.endDate);
            }
          }

          // Income is active if:
          //  - startDate <= filter end
          //  - AND (no endDate OR endDate >= filter start)
          const activeInRange =
            (!end || startDate <= end) &&
            (!endDate || !start || endDate >= start);

          return activeInRange;
        });
        setIncomeStreams(filteredStreams);
        console.log(filteredStreams)
        setTotalIncome(
          computeTotalIncome(filteredStreams, filter.type, start, end)
        );
      }
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeIncomeStreams();
    };
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
  const handleAddIncomeStream = async () => {
    const { name, type, amount, hoursPerWeek, startDate } = streamForm;
    if (!name || !amount) return;

    // Use current date if startDate is missing or invalid
    const parsedStartDate = startDate ? new Date(startDate) : new Date();

    await addDoc(collection(db, "incomeStreams"), {
      userId: user?.uid,
      name,
      type,
      amount: parseFloat(amount),
      // Only include hoursPerWeek if hourly
      ...(type === "hourly"
        ? { hoursPerWeek: parseFloat(hoursPerWeek || "0") }
        : {}),
      startDate: parsedStartDate,
      endDate: parsedStartDate
    });

    setStreamForm({
      name: "",
      type: "biweekly",
      amount: "",
      hoursPerWeek: "",
      startDate: "",
    });
    setIncomeModalOpen(false);
  };

  const handleDeleteIncomeStream = async (id: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "incomeStreams", id));

      // Update local state
      setIncomeStreams((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete income stream:", error);
    }
  };
  const handleEditIncomeStream = async (updated: Income & { id: string }) => {
    if (!updated.id) return;

    const data: Partial<Income> = {
      name: updated.name,
      type: updated.type,
      amount: updated.amount,
    };

    // Only add startDate if valid
    if (updated.startDate) {
      if (updated.startDate instanceof Date) {
        data.startDate = updated.startDate;
      } else {
        const parsedDate = new Date(updated.startDate);
        if (!isNaN(parsedDate.getTime())) {
          data.startDate = parsedDate;
        }
      }
    }

    await updateDoc(doc(db, "incomeStreams", updated.id), data);

    setIncomeStreams((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...data } : s))
    );
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
          <IncomeList
            title="Income Streams"
            streams={incomeStreams} // your state for income streams
            onDelete={handleDeleteIncomeStream}
            onEdit={handleEditIncomeStream}
          />
          <button
            className="px-4 py-2 rounded-xl text-white transition bg-green-600 hover:bg-green-700 mt-2"
            onClick={() => setIncomeModalOpen(true)}
          >
            Add Income Stream
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

      {/* Income Modal */}
      <IncomeModal
        isModalOpen={isIncomeModalOpen}
        setIsModalOpen={setIncomeModalOpen}
        streamForm={streamForm}
        setStreamForm={setStreamForm}
        handleAddIncomeStream={handleAddIncomeStream}
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
