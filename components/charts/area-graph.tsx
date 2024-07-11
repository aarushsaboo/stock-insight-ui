'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
// const chartData = [
//   { month: 'January', desktop: 186, mobile: 80 },
//   { month: 'February', desktop: 305, mobile: 200 },
//   { month: 'March', desktop: 237, mobile: 120 },
//   { month: 'April', desktop: 73, mobile: 190 },
//   { month: 'May', desktop: 209, mobile: 130 },
//   { month: 'June', desktop: 214, mobile: 140 }
// ];
// import csvData from '../../constants/sp500.csv';

const chartConfig = {
  high: {
    label: 'High',
    color: 'hsl(var(--chart-1))'
  },
  low: {
    label: 'Low',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;


// const chartData = csvData.map((row) => ({
//   month: row.date, // if the month column is named 'date'
//   // desktop: Number(row.desktopVisitors), // if it's named 'desktopVisitors'
//   // mobile: Number(row.mobileVisitors) // if it's named 'mobileVisitors'
//   high: Number(row.High),
//   low: Number(row.Low)
  
// }));

interface AreaGraphProps {
  csvPath: string;
  updateTrigger: number;
}

export function AreaGraph({ csvPath, updateTrigger}: AreaGraphProps) {
  const [chartData, setChartData] = useState([])
  useEffect(() => {
    // Fetch and parse CSV data
    fetch(csvPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text()
      })
      .then((text) => {
        console.log('CSV data fetched successfully');
        const rows = text.split('\n').slice(1); // Skip header
        const data = rows.map((row) => {
          const [date, open, high, low, close] = row.split(',');
          return {
            month: date,
            high: Number(high),
            low: Number(low)
          };
        });
        const slicedData = data.slice(0, 90);
        setChartData(slicedData);
      })
      .catch(error => {
        console.error('Error fetching csv', error)
      });
  }, [updateTrigger]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart - Stacked</CardTitle>
        <CardDescription>
          Displaying high and low prices for the last 90 trading days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[310px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
              }}
              interval="preserveEnd"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="high"
              type="natural"
              fill="var(--color-low)"
              fillOpacity={0.4}
              stroke="var(--color-low)"
              stackId="a"
            />
            <Area
              dataKey="low"
              type="natural"
              fill="var(--color-high)"
              fillOpacity={0.4}
              stroke="var(--color-high)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Price Trend: Last 3 Months
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              (as of yesterday)
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
