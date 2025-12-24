import { useState } from 'react'
import PartsManagement from './admin/PartsManagement'
import ConfigRequestsManagement from './admin/ConfigRequestsManagement'
import ContactInfoManagement from './admin/ContactInfoManagement'
import { ToastContainer, useToast } from './ToastContainer'
import { Settings, Package, FileText, LayoutDashboard, Phone } from 'lucide-react'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('parts')
  const { showToast, removeToast, toasts } = useToast()

  const tabs = [
    { id: 'parts', name: 'Parts Management', icon: Package },
    { id: 'requests', name: 'Configuration Requests', icon: FileText },
    { id: 'contact', name: 'Contact Information', icon: Phone },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-xl shadow-primary-500/25">
              <LayoutDashboard className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="section-title mb-1">Admin Dashboard</h1>
              <p className="text-gray-600">Manage parts and view configuration requests</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card mb-8 p-2 flex gap-2 animate-slide-up">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/25 transform scale-[1.02]'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`} strokeWidth={2.5} />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'parts' && <PartsManagement showToast={showToast} />}
          {activeTab === 'requests' && <ConfigRequestsManagement showToast={showToast} />}
          {activeTab === 'contact' && <ContactInfoManagement showToast={showToast} />}
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default AdminDashboard

