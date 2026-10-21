"use client";

import { useState } from "react";
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, 
  Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from "recharts";
import { BarChart2, TrendingUp, PieChart as PieIcon, Lightbulb } from "lucide-react";

const COLORS = ["#4f46e5", "#7c3aed", "#ec4899", "#818cf8", "#c084fc", "#f472b6"];

export default function GraphEngine({ data = {}, topic = "Topic" }) {
  const [activeChartType, setActiveChartType] = useState((data?.chartType || "bar").toLowerCase());

  const chartTitle = data?.title || `Quantitative Metrics for ${topic}`;
  const description = data?.description || `Topic-specific data distribution and metric performance.`;
  const xLabel = data?.xLabel || "Category";
  const yLabel = data?.yLabel || "Value";

  const chartData = Array.isArray(data?.data) && data.data.length > 0
    ? data.data
    : [
        { name: "Metric A", value: 65 },
        { name: "Metric B", value: 85 },
        { name: "Metric C", value: 45 },
        { name: "Metric D", value: 90 },
        { name: "Metric E", value: 70 }
      ];

  // Calculate total for percentage tooltips & insights
  const totalValue = chartData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const highestItem = [...chartData].sort((a, b) => b.value - a.value)[0];
  const lowestItem = [...chartData].sort((a, b) => a.value - b.value)[0];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const pct = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-md text-xs font-semibold space-y-1">
          <p className="text-gray-900 font-bold">{payload[0].name || label}</p>
          <p className="text-indigo-600 font-bold">{yLabel}: {val}</p>
          <p className="text-gray-500 font-medium">Share: {pct}% of total</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (activeChartType === "line") {
      return (
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: "#4f46e5" }} activeDot={{ r: 8 }} />
        </LineChart>
      );
    }

    if (activeChartType === "pie") {
      return (
        <PieChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={45}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      );
    }

    // Default: Bar Chart
    return (
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    );
  };

  return (
    <div className="w-full space-y-8">
      
      {/* Header Info & View Switcher */}
      <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 md:p-8 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Interactive Data Model
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">{chartTitle}</h3>
          </div>

          {/* Chart Type Tabs */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-1.5 rounded-2xl shadow-2xs">
            <button
              onClick={() => setActiveChartType("bar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeChartType === "bar" ? "bg-indigo-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Bar</span>
            </button>

            <button
              onClick={() => setActiveChartType("line")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeChartType === "line" ? "bg-indigo-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>

            <button
              onClick={() => setActiveChartType("pie")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeChartType === "pie" ? "bg-indigo-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Pie</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed font-normal">{description}</p>
        
        <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-gray-500 border-t border-gray-200/60">
          <span>X-Axis: <strong className="text-gray-800">{xLabel}</strong></span>
          <span>Y-Axis: <strong className="text-gray-800">{yLabel}</strong></span>
        </div>
      </div>

      {/* Recharts Container (Height h-96 md:h-[500px]) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs h-96 md:h-[500px] w-full flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Data Insights Section */}
      <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-indigo-950 uppercase tracking-wider">Data Insights & Key Pattern</h4>
            <p className="text-xs text-indigo-900 font-medium">
              Highest metric: <strong>{highestItem?.name}</strong> ({highestItem?.value}). 
              Lowest metric: <strong>{lowestItem?.name}</strong> ({lowestItem?.value}).
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
