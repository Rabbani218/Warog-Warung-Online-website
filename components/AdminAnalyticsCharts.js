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
      className="panel glass-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }}
      style={{ padding: "1rem" }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
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
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
      <ChartCard title="Tren Pendapatan 7 Hari Terakhir">
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={revenueTrend}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString("id-ID")}`} />
              <Area type="monotone" dataKey="revenue" stroke="#ff3b30" fill="#ff6f6133" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Top 5 Menu Terlaris Bulan Ini">
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={topMenus}>
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Proporsi Status Pesanan">
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={orderStatus} dataKey="value" nameKey="name" outerRadius={90}>
                {orderStatus.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Distribusi Jam Sibuk Pelanggan">
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={peakHours}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
