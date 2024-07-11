'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { useState, useEffect } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import csvData from '../../constants/sp500.csv';

const chartData = csvData.slice(-90).map((row) => ({
  date: row.Date, // if the month column is named 'date'
  // desktop: Number(row.desktopVisitors), // if it's named 'desktopVisitors'
  // mobile: Number(row.mobileVisitors) // if it's named 'mobileVisitors'
  high: Number(row.High),
  low: Number(row.Low)
}));

export const description = 'An interactive bar chart';


const chartConfig = {
  views: {
    label: 'Page Views'
  },
  high: {
    label: 'High',
    color: 'hsl(var(--chart-1))'
  },
  low: {
    label: 'Low',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

interface BarGraphProps {
  csvPath: string;
  updateTrigger: number;
}
export function BarGraph({ csvPath, updateTrigger }: BarGraphProps) {
  const [chartData, setChartData] = useState([]);
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('high');

  useEffect(() => {
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
        const data = rows.slice(-90).map((row) => {
          const [date, open, high, low, close] = row.split(',');
          return {
            date,
            high: Number(high),
            low: Number(low)
          };
        });
        // console.log('Processed data:', data);
        const slicedData = data.slice(0,89)
        setChartData(slicedData);
      })
      .catch((error) => {
        console.error('Error fetching csv', error);
      });
  }, [updateTrigger]);

  const total = React.useMemo(
    () => ({
      high: chartData.reduce((acc, curr) => acc + curr.high, 0).toFixed(2),
      low: chartData.reduce((acc, curr) => acc + curr.low, 0).toFixed(2)
    }),
    [chartData]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>
            {/* Showing total visitors for the last 3 months */
            `Showing high and low values for the last 3 months`}
          </CardDescription>
        </div>
        <div className="flex">
          {['high', 'low'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
