"use client";

interface IncomeModalProps {
  description: string;
  setDescription: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  setType: (value: "income" | "expense") => void;
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  handleAddTransaction: () => void;
}

export const IncomeModal = ({
  description,
  setDescription,
  amount,
  setAmount,
  setType,
  isModalOpen,
  setIsModalOpen,
  handleAddTransaction,
}: IncomeModalProps) => {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Add Income</h2>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => {
              setType("income");
              handleAddTransaction();
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
