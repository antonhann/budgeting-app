export interface Income {
  id?: string;
  userId: string;
  name: string;
  type: "cash" | "biweekly" | "monthly" | "yearly";
  amount: number;
  startDate: Date;
  endDate?: Date; // optional
}