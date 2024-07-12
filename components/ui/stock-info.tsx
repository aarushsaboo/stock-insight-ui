import { useState, useEffect } from 'react';

import { Card } from './card';
import { CardHeader } from './card';
import { CardContent } from './card';
import { CardTitle } from './card';
import { CardDescription } from './card';


interface StockInfoProps {
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

interface StockInfo {
  monthlyTrend: string;
  highestDay: string;
  lowestDay: string;
  consecutiveUp: number;
  consecutiveDown: number;
  lastClose: string;
  firstOpen: number;
}
function calculateInfo(data: StockData[]): StockInfo {
  const sortedData = data.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const lastMonth = sortedData.slice(-30);
  const lastDay = lastMonth[lastMonth.length - 1];
  const firstDay = lastMonth[0];

  const monthlyTrend = ((lastDay.close - firstDay.open) / firstDay.open) * 100;
  const highestDay = lastMonth.reduce((max, day) =>
    day.high > max.high ? day : max
  );
  const lowestDay = lastMonth.reduce((min, day) =>
    day.low < min.low ? day : min
  );

  const consecutiveUp = lastMonth.reduce(
    (count: number, day: StockData, index: number, arr: StockData[]) => {
      if (index === 0) return 0;
      return day.close > arr[index - 1].close ? count + 1 : 0;
    },
    0
  );

  const consecutiveDown = lastMonth.reduce(
    (count: number, day: StockData, index: number, arr: StockData[]) => {
      if (index === 0) return 0;
      return day.close < arr[index - 1].close ? count + 1 : 0;
    },
    0
  );

  return {
    monthlyTrend: monthlyTrend.toFixed(2),
    highestDay: highestDay.date,
    lowestDay: lowestDay.date,
    consecutiveUp,
    consecutiveDown,
    lastClose: lastDay.close.toFixed(2),
    firstOpen: firstDay.open
  };
}
export function StockInfo({ csvPath, updateTrigger }: StockInfoProps) {
    const [info, setInfo] = useState<StockInfo | null>(null);

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
          const data: StockData[] = rows.map((row) => {
            const [date, open, high, low, close] = row.split(',');
            return {
              date,
              open: Number(open),
              high: Number(high),
              low: Number(low),
              close: Number(close)
            };
          });
          console.log('Processed data is', data);
          const slicedData = data.slice(0, 89);
          const calculatedInfo = calculateInfo(slicedData);
          console.log('info is', calculatedInfo);
          setInfo(calculatedInfo);
        })
        .catch((error) => {
          console.error('Error fetching csv', error);
        });
    }, [updateTrigger, csvPath]);

    if (!info) return <div>Loading...</div>;
    return (
      <>
        <Card className="col-span-4 md:col-span-3">
          <CardHeader>
            <CardTitle>Stock Insights</CardTitle>
            <CardDescription>Recent trends and notable events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p style={{ fontSize: '0.9rem' }}>
                Over the past month, the stock has shown a{' '}
                <span
                  style={{
                    fontWeight: 'bold',
                    color: Number(info.monthlyTrend) > 0 ? '#4CAF50' : '#F44336'
                  }}
                >
                  {Number(info.monthlyTrend) > 0 ? 'positive' : 'negative'} trend of{' '}
                  {Math.abs(Number(info.monthlyTrend))}%
                </span>
                .
                <span style={{ fontStyle: 'italic' }}>
                  {Number(info.monthlyTrend) > 5
                    ? ' This indicates strong bullish sentiment.'
                    : Number(info.monthlyTrend) < -5
                    ? ' This suggests significant bearish pressure.'
                    : ' The stock appears to be relatively stable.'}
                </span>
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                The highest price was reached on{' '}
                <span style={{ fontWeight: 'bold' }}>{info.highestDay}</span>,
                while the lowest price was on{' '}
                <span style={{ fontWeight: 'bold' }}>{info.lowestDay}</span>.
                <span style={{ fontStyle: 'italic' }}>
                  This volatility might present opportunities for careful
                  investors.
                </span>
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                {info.consecutiveUp > 3 ? (
                  <span>
                    The stock has been on an{' '}
                    <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      upward streak for {info.consecutiveUp} days
                    </span>
                    . This could indicate growing investor confidence.
                  </span>
                ) : info.consecutiveDown > 3 ? (
                  <span>
                    The stock has been{' '}
                    <span style={{ fontWeight: 'bold', color: '#F44336' }}>
                      declining for {info.consecutiveDown} consecutive days
                    </span>
                    . This might be a cause for concern or a potential buying
                    opportunity.
                  </span>
                ) : (
                  <span style={{ fontStyle: 'italic' }}>
                    The stock has been fluctuating without a clear short-term
                    trend, suggesting a period of market indecision.
                  </span>
                )}
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                The most recent closing price was{' '}
                <span style={{ fontWeight: 'bold' }}>${info.lastClose}</span>.
                <span style={{ fontStyle: 'italic' }}>
                  {Number(info.lastClose) > info.firstOpen
                    ? ' This is higher than the opening price at the start of the month, suggesting overall positive performance.'
                    : ' This is lower than the opening price at the start of the month, indicating some loss in value over the period.'}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );    
}
