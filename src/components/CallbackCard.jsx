import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createInquiry } from '../lib/firestore'

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent min-h-[44px] md:min-h-0'

export default function CallbackCard() {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.displayName || prev.name,
        phone: user.phoneNumber || prev.phone,
      }))
    }
  }, [user])

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalOpen])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const next = {}
    if (!form.name?.trim()) next.name = 'Name is required'
    if (!form.phone?.trim()) next.phone = 'Phone number is required'
    else if (!/^[\d\s+\-()]{10,}$/.test(form.phone.replace(/\s/g, ''))) next.phone = 'Enter a valid phone number'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleRequestCallback = async (e) => {
    e?.preventDefault()
    if (!validate()) return
    setSending(true)
    try {
      await createInquiry({
        userId: user?.uid || null,
        userEmail: user?.email || null,
        userPhone: form.phone.trim(),
        userName: form.name.trim(),
        tourId: null,
        tourName: null,
        message: 'Requested callback',
        numberOfGuests: 1,
        preferredDate: null,
        tripInterest: null,
        notes: null,
      })
      setSent(true)
      setModalOpen(false)
    } catch (_) {
      setSent(true)
      setModalOpen(false)
    } finally {
      setSending(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setErrors({})
  }

  return (
    <>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow max-w-sm mx-auto md:max-w-none">
        <div className="flex items-center gap-4 mb-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </span>
          <div>
            <h3 className="font-display text-xl font-bold text-neutral-900 leading-tight">
              One call away
            </h3>
            <p className="text-neutral-600 text-sm font-medium">
              Instant help from our travel team
            </p>
          </div>
        </div>
        
        {sent ? (
          <p className="text-center text-emerald-600 text-base py-3 rounded-lg bg-emerald-50">Request sent. We&apos;ll call you soon.</p>
        ) : (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center w-full gap-3 py-3 text-lg rounded-lg font-bold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors bg-white"
          >
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Request a Callback
          </button>
        )}

        <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap gap-2">
          <a href="tel:+918805795706" className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            8805795706
          </a>
          <a href="tel:+918278717103" className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            8278717103
          </a>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto safe-area-inset-top safe-area-inset-bottom">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm min-h-full"
            onClick={closeModal}
            aria-hidden
          />
          <div
            className="relative w-full max-w-md rounded-2xl bg-white border border-neutral-200 shadow-2xl p-6 md:p-8 my-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="callback-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex justify-center mb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
            </div>
            <h2 id="callback-modal-title" className="font-display text-xl font-semibold text-neutral-950 text-center mb-2">
              Request a Callback
            </h2>
            <p className="text-neutral-600 text-sm text-center mb-6">
              We&apos;ll call you back shortly.
            </p>

            <form onSubmit={handleRequestCallback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                  required
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. 9876543210 or +91 9876543210"
                  className={inputClass}
                  required
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
              <button
                type="submit"
                disabled={sending}
                className="btn-gradient w-full justify-center gap-2 min-h-[44px] md:min-h-0 disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Request Callback'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}