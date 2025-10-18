import { Dispatch, SetStateAction } from "react";
import { Transaction } from "@/types/transaction";

interface Props {
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  amount: string;
  setAmount: Dispatch<SetStateAction<string>>;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  handleAddTransaction: () => void;
}

export const TransactionModal = ({
  description,
  setDescription,
  amount,
  setAmount,
  category,
  setCategory,
  isModalOpen,
  setIsModalOpen,
  handleAddTransaction,
}: Props) => {
  if (!isModalOpen) return null; // hide modal when closed

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-200/50 backdrop-blur-sm"
        onClick={() => setIsModalOpen(false)}
      ></div>

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-50">
        <h2 className="text-2xl font-bold mb-4">Add Transaction</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select category</option>
            <option value="Food">🍔 Food</option>
            <option value="Bills">💡 Bills</option>
            <option value="Entertainment">🎮 Entertainment</option>
            <option value="Other">📝 Other</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAddTransaction}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
