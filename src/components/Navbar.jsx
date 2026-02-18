import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar({ onLoginClick }) {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const mobileProfileRef = useRef(null)

  const { user, signOut } = useAuth()

  useEffect(() => {
    function handleClickOutside(e) {
      const clickedDesktop = profileRef.current && profileRef.current.contains(e.target)
      const clickedMobile = mobileProfileRef.current && mobileProfileRef.current.contains(e.target)
      if (!clickedDesktop && !clickedMobile) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="border-b border-neutral-200/80 shadow-sm bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 via-blue-500 to-sky-500 text-white font-bold text-sm">
              HM
            </span>
            <span className="font-display text-xl font-semibold text-neutral-950 tracking-tight hidden sm:inline">
              HM TOURS
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-10">
            <Link to="/tours" className="text-neutral-900 hover:text-brand-blue text-[17px] font-bold transition-colors">
              All Tours
            </Link>
            <button className="text-neutral-900 hover:text-brand-blue text-[17px] font-bold transition-colors flex items-center gap-1">
              Destinations
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <Link to="/tours" className="text-neutral-900 hover:text-brand-blue text-[17px] font-bold transition-colors">Custom Package</Link>
            <a href="#offers" className="text-neutral-900 hover:text-brand-blue text-[17px] font-bold transition-colors">Offers</a>
          </div>

          {/* Desktop Right Side Buttons - Fixed Visibility */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/tours" className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 px-5 rounded-lg font-bold transition-colors">
              Find A Trip
            </Link>
            <Link to="/tours" className="border border-purple-600 text-purple-600 hover:bg-purple-50 text-sm py-2.5 px-5 rounded-lg font-bold transition-colors">
              Custom Package
            </Link>
            
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 text-neutral-700 hover:text-brand-blue font-medium transition-colors rounded-lg py-2 px-2 -mr-2 hover:bg-neutral-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <span className="max-w-[160px] truncate text-sm">{user.email}</span>
                  <svg className={`w-4 h-4 shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                    <div className="px-3 py-2 border-b border-neutral-100">
                      <p className="text-xs text-neutral-500">Signed in as</p>
                      <p className="text-sm font-medium text-neutral-800 truncate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { signOut(); setProfileOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-red-600 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => onLoginClick?.()} className="flex items-center gap-2 text-neutral-700 hover:text-brand-blue font-medium transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Login / Register
              </button>
            )}
          </div>

          {/* Mobile Right Side */}
          <div className="flex items-center gap-2 lg:hidden">
            {user && (
              <div className="relative" ref={mobileProfileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 text-neutral-700 hover:text-brand-blue font-medium transition-colors rounded-lg py-1 px-1 hover:bg-neutral-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <span className="max-w-[100px] truncate text-xs sm:text-sm">{user.email}</span>
                  <svg className={`w-3 h-3 shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                    <div className="px-3 py-2 border-b border-neutral-100">
                      <p className="text-xs text-neutral-500">Signed in as</p>
                      <p className="text-sm font-medium text-neutral-800 truncate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { signOut(); setProfileOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-red-600 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="p-3 -mr-2 text-neutral-700 hover:bg-neutral-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setOpen(!open)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden py-4 border-t border-neutral-200 space-y-0">
            {!user && (
              <div className="px-4 pb-4 border-b border-neutral-200 mb-2">
                <button type="button" className="flex items-center gap-2 py-3 px-3 text-neutral-700 font-medium w-full rounded-lg bg-neutral-50 border border-neutral-100" onClick={() => { setOpen(false); onLoginClick?.(); }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Login / Register
                </button>
              </div>
            )}

            <Link to="/tours" className="block py-3 px-4 text-neutral-900 hover:bg-neutral-50 border-b border-neutral-100 text-[17px] font-bold" onClick={() => setOpen(false)}>All Tours</Link>
            <Link to="/tours" className="block py-3 px-4 text-neutral-900 hover:bg-neutral-50 border-b border-neutral-100 text-[17px] font-bold" onClick={() => setOpen(false)}>Custom Package</Link>
            <a href="#destinations" className="block py-3 px-4 text-neutral-900 hover:bg-neutral-50 border-b border-neutral-100 text-[17px] font-bold" onClick={() => setOpen(false)}>Destinations</a>
            <a href="#offers" className="block py-3 px-4 text-neutral-900 hover:bg-neutral-50 border-b border-neutral-100 text-[17px] font-bold" onClick={() => setOpen(false)}>Offers</a>
            
            {/* Mobile Action Buttons - Fixed Visibility */}
            <div className="p-4 space-y-2">
              <Link to="/tours" className="flex items-center justify-center min-h-[44px] w-full bg-blue-600 text-white rounded-lg text-[17px] font-bold" onClick={() => setOpen(false)}>
                Find A Trip
              </Link>
              <Link to="/tours" className="flex items-center justify-center min-h-[44px] w-full border border-purple-600 text-purple-600 rounded-lg text-[17px] font-bold" onClick={() => setOpen(false)}>
                Custom Package
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}