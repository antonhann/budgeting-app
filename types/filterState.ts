export interface FilterState {
  type: "month" | "year" | "custom";
  month: number;
  year: number;
  startDate: Date | null;
  endDate: Date | null;
}
