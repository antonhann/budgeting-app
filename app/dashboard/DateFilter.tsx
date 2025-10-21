"use client";

import { FilterState } from "@/types/filterState";
import React from "react";

interface DateFilterProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const DateFilter: React.FC<DateFilterProps> = ({ filter, setFilter }) => {
  return (
    <div className="max-w-7xl mx-auto mb-6 bg-white shadow-lg rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Filter Type */}
      <div className="flex flex-col">
        <label className="mb-2 font-semibold text-gray-700">Filter Type</label>
        <select
          value={filter.type}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, type: e.target.value as FilterState["type"] }))
          }
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {filter.type === "month" && (
        <>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Month</label>
            <select
              value={filter.month}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, month: parseInt(e.target.value) }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Year</label>
            <input
              type="number"
              value={filter.year}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, year: parseInt(e.target.value) }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      {filter.type === "year" && (
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700">Year</label>
          <input
            type="number"
            value={filter.year}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, year: parseInt(e.target.value) }))
            }
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {filter.type === "custom" && (
        <>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Start Date</label>
            <input
              type="date"
              value={filter.startDate ? filter.startDate.toISOString().split("T")[0] : ""}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  startDate: e.target.value ? new Date(e.target.value) : null,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">End Date</label>
            <input
              type="date"
              value={filter.endDate ? filter.endDate.toISOString().split("T")[0] : ""}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  endDate: e.target.value ? new Date(e.target.value) : null,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}
    </div>
  );
};
