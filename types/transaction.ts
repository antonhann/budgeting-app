import { Timestamp } from "firebase/firestore";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  userId: string;
  createdAt: Date | Timestamp;
}
