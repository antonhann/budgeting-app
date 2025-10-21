import { Income } from "@/types/incomeStream";
import { IncomeItem } from "./IncomeItem";

interface Props {
  streams: Income[];
  onDelete: (id: string) => void;
  onEdit: (updated: Income & { id: string }) => Promise<void>;
  title: string;
}

export const IncomeList = ({ streams, onDelete, onEdit, title }: Props) => {
  return (
    <div>
      <h3 className="font-bold mb-2">{title}</h3>
      <ul>
        {streams.map((s) => (
          <IncomeItem
            key={s.id}
            stream={s}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </div>
  );
};
