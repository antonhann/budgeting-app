import { useState } from "react";
import { Transaction } from "@/types/transaction";

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction, type: "expense" | "income") => void;
}

export const TransactionItem = ({ transaction, onDelete, onEdit }: Props) => {
  const [editedTransaction, setEditedTransaction] = useState(transaction);
  const [amountInput, setAmountInput] = useState(
    transaction.amount.toLocaleString()
  );

  const handleChange = (field: keyof Transaction, value: string | number) => {
    const updated = { ...editedTransaction, [field]: value };
    setEditedTransaction(updated);
    onEdit(updated, updated.type);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setAmountInput(raw); // always show what user types

    // Remove commas and spaces
    const cleaned = raw.replace(/,/g, "").trim();

    // Allow empty string (so backspace doesn’t break)
    if (cleaned === "") {
      setEditedTransaction((prev) => ({ ...prev, amount: 0 }));
      return;
    }

    const numericValue = Number(cleaned);
    if (!isNaN(numericValue)) {
      const updated = { ...editedTransaction, amount: numericValue };
      setEditedTransaction(updated);
      onEdit(updated, updated.type);
    }
  };

  const handleAmountBlur = () => {
    // Format the value nicely with commas when leaving input
    setAmountInput(editedTransaction.amount.toLocaleString());
  };

  return (
    <li
      className={`flex justify-between px-3 py-2 rounded-lg ${
        transaction.type === "expense" ? "bg-red-50" : "bg-green-50"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <input
          type="text"
          value={editedTransaction.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 w-full focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
        <input
          type="text"
          value={editedTransaction.category || ""}
          onChange={(e) => handleChange("category", e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 w-32 focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
        <input
          type="text"
          value={amountInput}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          inputMode="decimal"
          className="border border-gray-300 rounded px-2 py-1 w-24 text-right focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(transaction.id)}
            className="text-red-600 hover:text-red-800"
          >
            🗑
          </button>
        </div>
      </div>
    </li>
  );
};
