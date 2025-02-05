'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', students: 30, placements: 10, events: 5 },
  { name: 'Feb', students: 45, placements: 15, events: 8 },
  { name: 'Mar', students: 50, placements: 20, events: 12 },
  { name: 'Apr', students: 40, placements: 12, events: 7 },
  { name: 'May', students: 60, placements: 25, events: 15 },
];

const pieData = [
  { name: 'Placed', value: 50 },
  { name: 'Not Placed', value: 50 },
];

const COLORS = ['#00C49F', '#FF4444'];

export default function TeacherDashboard() {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Teacher Dashboard</h1>

      {/* Grid Layout for Graphs */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl mb-4">📈 Student Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#FFF" />
              <YAxis stroke="#FFF" />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl mb-4">🎓 Placement Ratio</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Extra Graph (Not in Grid) */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mt-6">
        <h2 className="text-xl mb-4">📊 Event Participation</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#FFF" />
            <YAxis stroke="#FFF" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="events" stroke="#FFBB28" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}