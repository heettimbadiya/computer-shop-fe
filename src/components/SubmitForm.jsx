import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/currency'
import { User, Mail, Phone, Send, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const SubmitForm = ({ onSubmit, onCancel, submitting, totalPrice }) => {
  const { t, language } = useTranslation()
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = t('customer.configurator.fullName') + ' ' + t('common.required')
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = t('customer.configurator.emailAddress') + ' ' + t('common.required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = t('common.error')
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = t('customer.configurator.phoneNumber') + ' ' + t('common.required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="animate-scale-in">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/25 flex-shrink-0">
          <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{t('customer.configurator.submitConfiguration')}</h3>
          <p className="text-xs sm:text-sm text-gray-600">{t('customer.configurator.completeRequest')}</p>
        </div>
      </div>
      
      <p className="text-sm sm:text-base text-gray-700 mb-6 sm:mb-8 leading-relaxed">
        {t('customer.configurator.submitDescription')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-600" />
            {t('customer.configurator.fullName')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className={`input-field pl-10 sm:pl-11 text-sm sm:text-base min-h-[48px] ${errors.customerName ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
              placeholder="John Doe"
              disabled={submitting}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
          {errors.customerName && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.customerName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary-600" />
            {t('customer.configurator.emailAddress')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className={`input-field pl-10 sm:pl-11 text-sm sm:text-base min-h-[48px] ${errors.customerEmail ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
              placeholder="john@example.com"
              disabled={submitting}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
          {errors.customerEmail && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.customerEmail}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary-600" />
            {t('customer.configurator.phoneNumber')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              className={`input-field pl-10 sm:pl-11 text-sm sm:text-base min-h-[48px] ${errors.customerPhone ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
              placeholder="+1 234 567 8900"
              disabled={submitting}
            />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
          {errors.customerPhone && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.customerPhone}
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-accent-50/50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-primary-200/50">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1">{t('customer.configurator.estimatedTotal')}</span>
              <span className="text-xs text-gray-600">{t('customer.configurator.finalPriceMayVary')}</span>
            </div>
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent whitespace-nowrap">
              {formatPrice(totalPrice, language)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1 min-h-[48px]"
            disabled={submitting}
          >
            <X className="w-4 h-4" />
            <span>{t('common.cancel')}</span>
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 min-h-[48px]"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('customer.configurator.submitting')}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t('customer.configurator.submitRequestButton')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SubmitForm

