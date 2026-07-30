import React, { useState, useEffect } from 'react';
import { formatVNNumber, parseVNNumber } from '../lib/utils';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChange: (rawValue: string) => void;
  className?: string;
  placeholder?: string;
}

export function NumberInput({ value, onChange, className, placeholder, ...props }: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState(() => formatVNNumber(value));

  useEffect(() => {
    const formattedVal = formatVNNumber(value);
    if (parseVNNumber(formattedVal) !== parseVNNumber(displayValue)) {
      setDisplayValue(formattedVal);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    const formatted = formatVNNumber(inputVal);
    setDisplayValue(formatted);
    const raw = parseVNNumber(formatted);
    onChange(raw);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      {...props}
    />
  );
}
