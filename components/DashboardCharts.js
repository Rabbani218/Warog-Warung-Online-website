"use client";

import { motion } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis 
} from "recharts";

const COLORS = ['#ff2d20', '#ff9a1a', '#facc15', '#0f766e', '#3b82f6'];
const PIE_COLORS = {
  PENDING: '#facc15',
  PROCESSING: '#ff9a1a',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444'
};

export default function DashboardCharts({ 
  revenueData, 
  topMenuData, 
  orderStatusData, 
  peakHoursData 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Line Chart: Revenue 7 Days */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6"
      >
        <h3 className="retro-title text-determination-yellow mb-4 text-sm">Revenue (7 Days)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#ffffff80" fontSize={12} />
              <YAxis stroke="#ffffff80" fontSize={12} tickFormatter={(val) => `Rp${val / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', borderColor: '#ff2d20', borderRadius: '8px' }}
                itemStyle={{ color: '#ff2d20' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#ff2d20" strokeWidth={3} dot={{ r: 4, fill: '#ff2d20' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bar Chart: Top 5 Menus */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6"
      >
        <h3 className="retro-title text-determination-orange mb-4 text-sm">Top 5 Menus</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topMenuData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#ffffff80" fontSize={10} />
              <YAxis stroke="#ffffff80" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', borderColor: '#ff9a1a', borderRadius: '8px' }}
                cursor={{ fill: '#ffffff10' }}
              />
              <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                {topMenuData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Pie Chart: Order Status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-6"
      >
        <h3 className="retro-title text-gray-300 mb-4 text-sm">Order Status Proportion</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2 flex-wrap">
          {orderStatusData.map(entry => (
            <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[entry.name] || '#ccc' }}></span>
              {entry.name} ({entry.value})
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scatter Chart: Peak Hours */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-6"
      >
        <h3 className="retro-title text-determination-red mb-4 text-sm">Peak Hours</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="hour" type="number" name="Hour" unit="h" stroke="#ffffff80" fontSize={12} tickCount={12} domain={[0, 23]} />
              <YAxis dataKey="count" type="number" name="Orders" stroke="#ffffff80" fontSize={12} />
              <ZAxis dataKey="count" range={[50, 400]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#111', borderColor: '#ff2d20', borderRadius: '8px' }}
              />
              <Scatter name="Orders" data={peakHoursData} fill="#ff2d20" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
