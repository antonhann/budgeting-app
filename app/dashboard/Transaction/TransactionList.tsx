import { Transaction } from "@/types/transaction";
import { TransactionItem } from "./TransactionItem";

interface TransactionListProps {
  title: string;
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction, type: "income" | "expense") => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  title,
  transactions,
  onDelete,
  onEdit,
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
    </div>
  );
};
