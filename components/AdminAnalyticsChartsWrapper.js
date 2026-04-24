"use client";
import dynamic from "next/dynamic";

const AdminAnalyticsCharts = dynamic(() => import("./AdminAnalyticsCharts.js"), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] animate-pulse bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Memuat Grafik...</div>
});

export default AdminAnalyticsCharts;
