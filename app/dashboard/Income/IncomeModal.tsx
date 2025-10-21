"use client";

interface IncomeModalProps {
  streamForm: IncomeStreamForm;
  setStreamForm: (form: IncomeStreamForm) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  handleAddIncomeStream: () => void;
}

export interface IncomeStreamForm {
  name: string;
  type: "hourly" | "cash" | "biweekly" | "monthly" | "yearly";
  amount: string;
  hoursPerWeek: string;
  startDate: string;
  endDate?: string; // 👈 added endDate (optional)
}

export const IncomeModal = ({
  streamForm,
  setStreamForm,
  isModalOpen,
  setIsModalOpen,
  handleAddIncomeStream,
}: IncomeModalProps) => {
  if (!isModalOpen) return null;

  const handleChange = (field: keyof IncomeStreamForm, value: string) => {
    setStreamForm({ ...streamForm, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Add Income Stream</h2>

        <input
          type="text"
          placeholder="Stream Name"
          value={streamForm.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <input
          type="number"
          placeholder="Amount"
          value={streamForm.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <select
          value={streamForm.type}
          onChange={(e) =>
            handleChange("type", e.target.value as IncomeStreamForm["type"])
          }
          className="w-full border p-2 rounded mb-2"
        >
          <option value="cash">Cash</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={streamForm.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Date (optional)
        </label>
        <input
          type="date"
          value={streamForm.endDate ?? ""}
          onChange={(e) => handleChange("endDate", e.target.value)}
          className="w-full border p-2 rounded mb-1"
        />
        {!streamForm.endDate && (
          <p className="text-xs text-gray-500 mb-3">No end date → Ongoing</p>
        )}

        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={handleAddIncomeStream}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
