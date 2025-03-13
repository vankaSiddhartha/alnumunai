'use client';
import React, { useState, useEffect } from 'react';
import { faker } from '@faker-js/faker';
import { 
  BarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Users, Briefcase, ChevronDown, Search, Filter 
} from 'lucide-react';

const generateSyntheticData = (count = 50) => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['Student', 'Alumni', 'Job Seeker']),
    application: {
      status: faker.helpers.arrayElement(['pending', 'accepted', 'rejected']),
      company: faker.company.name(),
      appliedAt: faker.date.recent()
    }
  }));
};

const TeacherDashboard = () => {
  const [users, setUsers] = useState(generateSyntheticData());
  const [activeTab, setActiveTab] = useState('overview');

  const placementData = [
    { 
      name: 'Placed', 
      value: users.filter(user => user.application.status === 'accepted').length 
    },
    { 
      name: 'Pending', 
      value: users.filter(user => user.application.status === 'pending').length 
    },
    { 
      name: 'Rejected', 
      value: users.filter(user => user.application.status === 'rejected').length 
    }
  ];

  const monthlyData = [
    { name: 'Jan', applications: users.filter(u => u.application.appliedAt.getMonth() === 0).length },
    { name: 'Feb', applications: users.filter(u => u.application.appliedAt.getMonth() === 1).length },
    { name: 'Mar', applications: users.filter(u => u.application.appliedAt.getMonth() === 2).length },
    { name: 'Apr', applications: users.filter(u => u.application.appliedAt.getMonth() === 3).length },
    { name: 'May', applications: users.filter(u => u.application.appliedAt.getMonth() === 4).length },
  ];

  const COLORS = ['#00C49F', '#FFBB28', '#FF4444'];

  const renderAdminManagement = () => (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search users" 
              className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
            <Filter className="mr-2" size={20} /> Filters
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Application Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <span className={`
                    px-2 py-1 rounded-full text-xs 
                    ${user.role === 'Student' ? 'bg-blue-500/20 text-blue-300' : 
                      user.role === 'Alumni' ? 'bg-green-500/20 text-green-300' : 
                      'bg-purple-500/20 text-purple-300'}
                  `}>
                    {user.role}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`
                    px-2 py-1 rounded-full text-xs 
                    ${user.application.status === 'accepted' ? 'bg-green-500/20 text-green-300' : 
                      user.application.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : 
                      'bg-red-500/20 text-red-300'}
                  `}>
                    {user.application.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                      View
                    </button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded-md text-sm">
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Job Applications</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', color: '#white' }}
              itemStyle={{ color: '#white' }}
            />
            <Bar dataKey="applications" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Placement Ratio</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={placementData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {placementData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', color: 'white' }}
            />
            <Legend 
              iconType="circle" 
              iconSize={10} 
              wrapperStyle={{ color: '#9CA3AF' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <div className="flex space-x-4">
          {[
            { id: 'overview', label: 'Dashboard', icon: <ChevronDown /> },
            { id: 'user-management', label: 'Users', icon: <Users /> },
            { id: 'job-placements', label: 'Placements', icon: <Briefcase /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-4 py-2 rounded-md 
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
              `}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'user-management' && renderAdminManagement()}
    </div>
  );
};

export default TeacherDashboard;