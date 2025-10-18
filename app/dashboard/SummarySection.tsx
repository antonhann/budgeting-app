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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total income */}
        <SummaryCard title="Total Income" value={`$${totalIncome}`} />

        {/* Total spent */}
        <SummaryCard title="Total Spent" value={`$${totalSpent}`} />

        {/* Category totals */}
        {Object.keys(categoryTotals).map((cat) => (
          <SummaryCard key={cat} title={cat} value={`$${categoryTotals[cat]}`} />
        ))}
      </div>
    </div>
  );
};
