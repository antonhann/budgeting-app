export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense"; // add type
  userId: string;
  createdAt: Date;
}