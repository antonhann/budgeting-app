import { Income } from "@/types/incomeStream";

interface Props {
  stream: Income;
  onDelete: (id: string) => void;
  onEdit: (updated: Income & { id: string }) => Promise<void>;
}

export const IncomeItem = ({ stream, onDelete, onEdit }: Props) => {
  const handleChange = (field: keyof Income, value: string | number) => {
    onEdit({ ...stream, id: stream.id!, [field]: value });
  };

  return (
    <li className="flex justify-between px-3 py-2 rounded-lg bg-green-50 mb-2">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <input
          type="text"
          value={stream.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 w-full focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />

        <input
          type="number"
          value={stream.amount}
          onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 w-24 text-right focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />

        <select
          value={stream.type}
          onChange={(e) =>
            handleChange("type", e.target.value as Income["type"])
          }
          className="border border-gray-300 rounded px-2 py-1 w-28"
        >
          <option value="cash">Cash</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button
          onClick={() => onDelete(stream.id!)}
          className="text-red-600 hover:text-red-800"
        >
          🗑
        </button>
      </div>
    </li>
  );
};
