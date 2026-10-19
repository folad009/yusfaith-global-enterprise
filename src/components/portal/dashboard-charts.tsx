"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

const axis = { fill: "#5c5852", fontSize: 12 };

export function TrendChart({ data }: { data: Array<{ date: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barSize={22}>
        <CartesianGrid stroke="#e3ded5" vertical={false} />
        <XAxis dataKey="date" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} width={48} />
        <Bar dataKey="value" fill="#e15a12" radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusChart({ data }: { data: Array<{ status: string; count: number }> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barSize={22}>
        <CartesianGrid stroke="#e3ded5" vertical={false} />
        <XAxis dataKey="status" tick={axis} axisLine={false} tickLine={false} interval={0} />
        <YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} width={28} />
        <Bar dataKey="count" fill="#2a2826" radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function QuantityChart({ data }: { data: Array<{ name: string; quantity: number }> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" barSize={16} margin={{ left: 16 }}>
        <CartesianGrid stroke="#e3ded5" horizontal={false} />
        <XAxis type="number" tick={axis} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={axis} axisLine={false} tickLine={false} width={120} />
        <Bar dataKey="quantity" fill="#e15a12" radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
