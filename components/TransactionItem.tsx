import { Transaction } from "@/types/transaction";

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

export const TransactionItem = ({ transaction, onDelete, onEdit }: Props) => {
  return (
    <li className="flex justify-between px-3 py-2 bg-gray-100 rounded-lg">
      <span>{transaction.description} ({transaction.category})</span>
      <div className="flex items-center gap-2">
        <span>${transaction.amount}</span>
        <button
          onClick={() => onEdit(transaction)}
          className="text-blue-600 hover:text-blue-800"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
          className="text-red-600 hover:text-red-800"
        >
          🗑
        </button>
      </div>
    </li>
  );
};
