import React, { useState } from 'react';
import { Input } from './input';
import { Button } from './button';

interface StockInputProps {
  onSubmit: (symbol: string) => void;
}

export function StockInput({ onSubmit }: StockInputProps) {
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with symbol:', symbol);
    onSubmit(symbol);
    // setSymbol(''); // Clear the input after submission
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <Input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="Enter Stock Symbol (e.g., AAPL)"
        className="mr-2"
      />
      <Button type="submit">Fetch Stock Data</Button>
    </form>
  );
}
