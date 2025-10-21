import { useState, useEffect } from "react";

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const AmountInput = ({ value, onChange, className }: AmountInputProps) => {
  const [inputValue, setInputValue] = useState(value.toLocaleString());

  // Keep local state in sync if value prop changes externally
  useEffect(() => {
    setInputValue(value.toLocaleString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    const cleaned = raw.replace(/,/g, "").trim();
    const numericValue = Number(cleaned);

    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    setInputValue(value.toLocaleString());
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      inputMode="decimal"
      className={className}
    />
  );
};
