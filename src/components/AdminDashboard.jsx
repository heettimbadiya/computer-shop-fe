import { useState } from 'react'
import PartsManagement from './admin/PartsManagement'
import ConfigRequestsManagement from './admin/ConfigRequestsManagement'
import ContactInfoManagement from './admin/ContactInfoManagement'
import ExchangeRateManagement from './admin/ExchangeRateManagement'
import CategoryManagement from './admin/CategoryManagement'
import { ToastContainer, useToast } from './ToastContainer'
import { useTranslation } from '../hooks/useTranslation'
import LanguageSwitcher from './LanguageSwitcher'
import { Settings, Package, FileText, LayoutDashboard, Phone, DollarSign, Tag } from 'lucide-react'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('parts')
  const { showToast, removeToast, toasts } = useToast()
  const { t } = useTranslation()

  const tabs = [
    { id: 'parts', name: t('admin.dashboard.partsManagement'), icon: Package },
    { id: 'categories', name: t('admin.dashboard.categories'), icon: Tag },
    { id: 'requests', name: t('admin.dashboard.configRequests'), icon: FileText },
    { id: 'contact', name: t('admin.dashboard.contactInfo'), icon: Phone },
    { id: 'exchange', name: t('admin.dashboard.exchangeRate'), icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12 max-w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-10 animate-fade-in-up">
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-xl shadow-primary-500/25 flex-shrink-0">
                <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-0.5 sm:mb-1">{t('admin.dashboard.title')}</h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">{t('admin.dashboard.subtitle')}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card mb-6 sm:mb-8 p-2 sm:p-3 flex flex-col sm:flex-row gap-2 animate-slide-up overflow-x-auto bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-100/50 shadow-md">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-2 md:gap-3 py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-xl font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 min-h-[44px] sm:min-h-[48px] whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 transform scale-[1.02]'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-4 md:w-5 flex-shrink-0 transition-colors duration-300 ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`} strokeWidth={2.5} />
                <span className="truncate">{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'parts' && <PartsManagement showToast={showToast} />}
          {activeTab === 'categories' && <CategoryManagement showToast={showToast} />}
          {activeTab === 'requests' && <ConfigRequestsManagement showToast={showToast} />}
          {activeTab === 'contact' && <ContactInfoManagement showToast={showToast} />}
          {activeTab === 'exchange' && <ExchangeRateManagement showToast={showToast} />}
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default AdminDashboard

