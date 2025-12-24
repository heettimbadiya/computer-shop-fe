import { useState, useEffect } from 'react'
import { getContactInfo, updateContactInfo } from '../../services/api'
import { Phone, Instagram, Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react'

const ContactInfoManagement = ({ showToast = () => {} }) => {
  const [contactInfo, setContactInfo] = useState({
    workerPhone: '+90 551 894 00 69',
    instagramUrl: 'https://www.instagram.com/xpanbilgisayar',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadContactInfo()
  }, [])

  const loadContactInfo = async () => {
    try {
      setLoading(true)
      const data = await getContactInfo()
      if (data) {
        setContactInfo({
          workerPhone: data.workerPhone || '+90 551 894 00 69',
          instagramUrl: data.instagramUrl || 'https://www.instagram.com/xpanbilgisayar',
        })
      }
    } catch (error) {
      console.error('Error loading contact info:', error)
      // Keep default values on error
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const newErrors = {}

    // Validate phone number
    if (!contactInfo.workerPhone.trim()) {
      newErrors.workerPhone = 'Phone number is required'
    } else {
      const phoneRegex = /^\+?[\d\s\-()]+$/
      if (!phoneRegex.test(contactInfo.workerPhone.trim())) {
        newErrors.workerPhone = 'Invalid phone number format'
      }
    }

    // Validate Instagram URL
    if (!contactInfo.instagramUrl.trim()) {
      newErrors.instagramUrl = 'Instagram URL is required'
    } else {
      const urlRegex = /^https?:\/\/.+/i
      if (!urlRegex.test(contactInfo.instagramUrl.trim())) {
        newErrors.instagramUrl = 'Invalid URL format. Must start with http:// or https://'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setContactInfo((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await updateContactInfo(contactInfo)
      showToast('Contact information updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating contact info:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update contact information'
      showToast(errorMessage, 'error', 5000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading contact information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="card animate-slide-up">
        <div className="flex items-center gap-3 sm:gap-4 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/25 flex-shrink-0">
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Information</h2>
            <p className="text-xs sm:text-sm text-gray-600">Manage contact details displayed to customers</p>
          </div>
        </div>
      </div>

      {/* Contact Info Form */}
      <form onSubmit={handleSubmit} className="card animate-slide-up">
        <div className="space-y-4 sm:space-y-6">
          {/* Worker Phone Number */}
          <div>
            <label htmlFor="workerPhone" className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary-600 flex-shrink-0" />
              Worker Phone Number
            </label>
            <input
              type="text"
              id="workerPhone"
              name="workerPhone"
              value={contactInfo.workerPhone}
              onChange={handleChange}
              placeholder="+90 551 894 00 69"
              className={`input-field text-sm sm:text-base min-h-[48px] ${errors.workerPhone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
            {errors.workerPhone && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.workerPhone}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Format: Include country code (e.g., +90 551 894 00 69)
            </p>
          </div>

          {/* Instagram URL */}
          <div>
            <label htmlFor="instagramUrl" className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Instagram className="w-4 h-4 text-primary-600 flex-shrink-0" />
              Instagram Profile URL
            </label>
            <input
              type="url"
              id="instagramUrl"
              name="instagramUrl"
              value={contactInfo.instagramUrl}
              onChange={handleChange}
              placeholder="https://www.instagram.com/xpanbilgisayar"
              className={`input-field text-sm sm:text-base min-h-[48px] ${errors.instagramUrl ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
            {errors.instagramUrl && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.instagramUrl}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Full Instagram profile URL (e.g., https://www.instagram.com/username)
            </p>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-xl border-2 border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary-600" />
              Preview
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Phone:</span>
                <a
                  href={`tel:${contactInfo.workerPhone.replace(/\s/g, '')}`}
                  className="text-primary-600 font-semibold hover:text-primary-700 hover:underline"
                >
                  {contactInfo.workerPhone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Instagram className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Instagram:</span>
                <a
                  href={contactInfo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 font-semibold hover:text-primary-700 hover:underline truncate max-w-xs"
                >
                  {contactInfo.instagramUrl}
                </a>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto min-h-[48px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Contact Information</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ContactInfoManagement

