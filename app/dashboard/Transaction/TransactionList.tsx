import { Transaction } from "@/types/transaction";
import { TransactionItem } from "./TransactionItem";

interface TransactionListProps {
  title: string;
  transactions: Transaction[];
  type: "income" | "expense";
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction, type: "income" | "expense") => void;
  onOpenModal: (type: "income" | "expense") => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  title,
  transactions,
  type,
  onDelete,
  onEdit,
  onOpenModal,
}) => {
  return (
    <div className="flex flex-col mt-4 text-left">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <ul className="space-y-2">
        {transactions.map((t) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </ul>
      <button
        className={`px-4 py-2 rounded-xl text-white transition ${
          type === "income"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        }`}
        onClick={() => onOpenModal(type)}
      >
        Add {type === "income" ? "Income" : "Expense"}
      </button>
    </div>
  );
};
