'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';
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
// import csvData from '../../constants/sp500.csv'

interface DataPoint {
  date: string;
  high: number;
  low: number;
}

interface ProcessedDataPoint {
  range: string;
  count: number;
  fill: string;
}

function processData(data: DataPoint[]): ProcessedDataPoint[] {
  const validData = data.filter((row) => !isNaN(row.high) && !isNaN(row.low));
  const highValues = validData.map((row) => row.high);
  const minValue = Math.min(...highValues);
  const maxValue = Math.max(...highValues);

  const rangeSize = (maxValue - minValue) / 5;
  const ranges = Array.from({ length: 5 }, (_, i) => {
    const min = minValue + i * rangeSize;
    const max = min + rangeSize;
    return {
      min,
      max,
      label: `${min.toFixed(0)}-${max.toFixed(0)}`,
      count: 0
    };
  });

  validData.forEach((row) => {
    const highValue = row.high;
    const range = ranges.find((r) => highValue >= r.min && highValue < r.max);
    if (range) range.count++;
  });

  return ranges.map(({ label, count }) => ({
    range: label,
    count,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));
}
const chartData = processData(csvData);

const chartConfig = {
  count: {
    label: 'Count'
  },
  ...Object.fromEntries(
    chartData.map(({ range, fill }) => [range, { label: range, color: fill }])
  )
} satisfies ChartConfig;

interface PieGraphProps {
  csvPath: string;
  updateTrigger: number;
}

export function PieGraph({ csvPath, updateTrigger }: PieGraphProps) {
  // const totalVisitors = React.useMemo(() => {
  //   return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  // }, []);

  const [chartData, setChartData] = useState<ProcessedDataPoint[]>([]);

  useEffect(() => {
    fetch(csvPath)
      .then((response) => response.text())
      .then((text) => {
        // console.log('Raw CSV data:', text);
        const rows = text.split('\n').slice(1);
        // console.log('Parsed rows:', rows);
        const data: DataPoint[] = rows.slice(-90).map((row) => {
          const [date, open, high, low, close] = row.split(',');
          return {
            date,
            high: Number(high),
            low: Number(low)
          };
        });
        // console.log('Structured data:', data);
        const processedData = processData(data);
        // console.log('Processed data:', processedData);
        setChartData(processedData);
      })
      .catch((error) => {
        console.error('Error fetching csv', error);
      });
  }, [csvPath, updateTrigger]);
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Stock Price Range Analysis</CardTitle>
        <CardDescription>
          Distribution of High prices across value ranges
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[360px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="range"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="text-l fill-muted-foreground font-bold"
                        >
                          {/* {totalVisitors.toLocaleString()} */}
                          High Price
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="text-l fill-muted-foreground font-bold"
                        >
                          Distribution
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {/* <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div> */}
        <div className="leading-none text-muted-foreground">
          Visualizing high price distribution for the selected stock
        </div>
      </CardFooter>
    </Card>
  );
}
