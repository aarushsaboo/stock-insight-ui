import { useState, useEffect } from "react";
import { Card } from "./card";
import { CardHeader } from "./card";
import { CardTitle } from "./card";
import { CardContent } from "./card";

interface StockInsightProps {
    csvPath: string;
    updateTrigger: number;
}
interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

function calculateInsights(data: StockData[]) {
  const sortedData = data.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const lastThreeMonths = sortedData.slice(-90); // Assuming 90 days in three months

  const highestPrice = Math.max(...lastThreeMonths.map((d) => d.high));
  const lowestPrice = Math.min(...lastThreeMonths.map((d) => d.low));

  const volatility =
    lastThreeMonths.reduce((sum, d) => sum + (d.high - d.low), 0) /
    lastThreeMonths.length;

  const firstOpen = lastThreeMonths[0].open;
  const lastClose = lastThreeMonths[lastThreeMonths.length - 1].close;
  const overallTrend = ((lastClose - firstOpen) / firstOpen) * 100;

  // New metric: Average daily price change
  const avgDailyChange =
    lastThreeMonths.reduce((sum, d, i, arr) => {
      if (i === 0) return sum;
      return sum + Math.abs(d.close - arr[i - 1].close);
    }, 0) / (lastThreeMonths.length - 1);

  return {
    priceRange: { high: highestPrice, low: lowestPrice },
    volatility: volatility.toFixed(2),
    overallTrend: overallTrend.toFixed(2),
    avgDailyChange: avgDailyChange.toFixed(2)
  };
}

export function StockInsights({ csvPath, updateTrigger }: StockInsightProps) {
    
    const [insights, setInsights] = useState({
      priceRange: {
        high: 227.85,
        low: 164.075
      },
      volatility: '3.46',
      overallTrend: '25.68',
      avgDailyChange: '2.28'
    });

    useEffect(() => {
      // Fetch and parse CSV data
      fetch(csvPath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then((text) => {
          console.log('CSV data fetched successfully');
            const rows = text.split('\n').slice(1); // Skip header
            // console.log("This is the text",text)
           const data = rows.map((row) => {
             const [date, open, high, low, close] = row.split(',');
             return {
               date,
               open: Number(open),
               high: Number(high),
               low: Number(low),
               close: Number(close)
             };
           });
            console.log('Processed data is', data)
            const slicedData = data.slice(0, 89);
            const calculatedInsights = calculateInsights(slicedData);
            console.log('insights are', calculatedInsights);
          setInsights(calculatedInsights);
        })
        .catch((error) => {
          console.error('Error fetching csv', error);
        });
    }, [updateTrigger]);

    if (!insights) return <div>Loading...</div>;

    return (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${insights.priceRange.high} - ${insights.priceRange.low}
            </div>
            <p className="text-xs text-muted-foreground">
              3-month high and low
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volatility</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${insights.volatility}</div>
            <p className="text-xs text-muted-foreground">
              Typical price swing within a day
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Trend</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.overallTrend}%</div>
            <p className="text-xs text-muted-foreground">
              Price change over 3 months
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Price Momentum
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${insights.avgDailyChange}</div>
            <p className="text-xs text-muted-foreground">
              Average day-to-day price shift
            </p>
          </CardContent>
        </Card>
      </>
    );
}