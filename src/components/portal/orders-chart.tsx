"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
export function OrdersChart({
  data,
}: {
  data: Array<{ day: string; orders: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barSize={28}>
        <CartesianGrid stroke="#e3ded5" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: "#5c5852", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#5c5852", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Bar dataKey="orders" fill="#e15a12" radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
