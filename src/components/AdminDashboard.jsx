import { useState } from 'react'
import PartsManagement from './admin/PartsManagement'
import ConfigRequestsManagement from './admin/ConfigRequestsManagement'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('parts')

  const tabs = [
    { id: 'parts', name: 'Parts Management', icon: '🔧' },
    { id: 'requests', name: 'Configuration Requests', icon: '📋' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage parts and view configuration requests</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-2 flex space-x-2 animate-slide-up">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'parts' && <PartsManagement />}
          {activeTab === 'requests' && <ConfigRequestsManagement />}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

