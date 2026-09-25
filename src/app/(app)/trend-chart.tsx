"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Point = { date: string; value: number };

const INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  surface: "#fcfcfb",
};

export function TrendChart({
  data,
  color,
  unit,
}: {
  data: Point[];
  color: string;
  unit: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`fill-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.12} />
            <stop offset="100%" stopColor={color} stopOpacity={0.12} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke={INK.grid}
          strokeWidth={1}
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={{ stroke: INK.grid }}
          tick={{ fill: INK.muted, fontSize: 11 }}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: INK.muted, fontSize: 11 }}
          width={36}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ stroke: INK.grid, strokeWidth: 1 }}
          contentStyle={{
            border: `1px solid ${INK.grid}`,
            borderRadius: 8,
            fontSize: 12,
            color: INK.primary,
          }}
          labelStyle={{ color: INK.secondary, fontSize: 11 }}
          formatter={(value) => [`${Number(value).toLocaleString()} ${unit}`, ""]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#fill-${color})`}
          dot={false}
          activeDot={{ r: 4, stroke: INK.surface, strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
