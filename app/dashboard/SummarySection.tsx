// /app/dashboard/SummarySection.tsx

interface SummarySectionProps {
  totalSpent: number;
  categoryTotals: Record<string, number>;
  totalIncome: number;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
}

export const SummaryCard = ({ title, value }: SummaryCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

export const SummarySection = ({
  totalSpent,
  categoryTotals,
  totalIncome,
}: SummarySectionProps) => {
  return (
    <div className="w-full mb-6">
      <h2 className="text-2xl font-bold mb-4 text-left">Summary</h2>

      {/* Main summary: Income & Spent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard title="Total Income" value={`$${totalIncome}`} />
        <SummaryCard title="Total Spent" value={`$${totalSpent}`} />
      </div>

      {/* Category totals as sub-cards */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-left ml-1">Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 ml-1">
            {Object.keys(categoryTotals).map((cat) => (
              <div
                key={cat}
                className="bg-gray-50 rounded-lg shadow p-2 text-center text-sm"
              >
                <p className="text-gray-600">{cat}</p>
                <p className="font-medium">${categoryTotals[cat]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
