"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const pieColors = ["#ef4444", "#f97316", "#22c55e"];

function ChartCard({ title, children }) {
  return (
    <motion.section
      className="panel glass-card p-6 flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }}
    >
      <h3 className="text-lg font-bold mb-6 w-full text-center">{title}</h3>
      <div className="w-full h-[300px] md:h-[500px]">
        {children}
      </div>
    </motion.section>
  );
}

export default function AdminAnalyticsCharts({
  revenueTrend,
  topMenus,
  orderStatus,
  peakHours
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start justify-center">
      <ChartCard title="Tren Pendapatan 7 Hari Terakhir">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueTrend}>
            <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => `Rp ${Number(value).toLocaleString("id-ID")}`} 
            />
            <Area type="monotone" dataKey="revenue" stroke="#ff3b30" fill="#ff6f6133" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top 5 Menu Terlaris Bulan Ini">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topMenus}>
            <XAxis dataKey="name" hide />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
            />
            <Bar dataKey="qty" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Proporsi Status Pesanan">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={orderStatus} dataKey="value" nameKey="name" outerRadius="80%" label>
              {orderStatus.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distribusi Jam Sibuk Pelanggan">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={peakHours}>
            <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
            />
            <Bar dataKey="orders" fill="#22c55e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
