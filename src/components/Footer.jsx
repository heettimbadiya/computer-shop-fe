import { useState, useEffect } from 'react'
import { getContactInfo } from '../services/api'
import { Phone, Instagram, Cpu } from 'lucide-react'

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({
    workerPhone: '+90 551 894 00 69',
    instagramUrl: 'https://www.instagram.com/xpanbilgisayar',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContactInfo()
  }, [])

  const loadContactInfo = async () => {
    try {
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

  if (loading) {
    return null // Don't show footer while loading
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <Cpu className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold">PC Builder Pro</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Build your dream PC with our comprehensive configurator. Quality parts, expert compatibility checking, and exceptional service.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a
                href="/configurator"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                PC Configurator
              </a>
              <a
                href="/items"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Browse Items
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <a
                href={`tel:${contactInfo.workerPhone.replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                  <Phone className="w-5 h-5 text-primary-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <p className="font-semibold text-sm">{contactInfo.workerPhone}</p>
                </div>
              </a>
              <a
                href={contactInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
                  <Instagram className="w-5 h-5 text-pink-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Instagram</p>
                  <p className="font-semibold text-sm truncate max-w-[200px]">
                    {contactInfo.instagramUrl.replace('https://www.instagram.com/', '@')}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
            © {new Date().getFullYear()} PC Builder Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={`tel:${contactInfo.workerPhone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs sm:text-sm min-h-[44px]"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Call Us</span>
              <span className="sm:hidden">Call</span>
            </a>
            <a
              href={contactInfo.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs sm:text-sm min-h-[44px]"
            >
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">Follow Us</span>
              <span className="sm:hidden">Follow</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

