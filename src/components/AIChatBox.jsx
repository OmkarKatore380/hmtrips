import { useState, useEffect, useRef } from 'react'

export default function AIChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Namaste! 🙏 I am your HM Tours assistant. How can I help you plan your dream trip today?' }
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "That sounds like a great plan! Would you like me to show you our best packages for that destination?" 
      }])
    }, 1000)
  }

  return (
    /* 🔥 POSITION MATCHED TO ACTION BUTTONS ON LEFT */
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start">
      {isOpen && (
        <div className="absolute left-20 bottom-0 w-80 md:w-96 h-[450px] bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in zoom-in slide-in-from-left-10 duration-300 origin-bottom-left">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <p className="text-sm font-bold">HM Smart Assistant</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-[10px] opacity-90">AI Powered</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* MESSAGES */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-neutral-800 border border-neutral-100 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div className="p-4 bg-white border-t border-neutral-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your next trip..."
              className="flex-1 bg-neutral-100 border-none rounded-2xl px-5 py-3 text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 🔥 BIGGER ANIMATED 3D ROBOT BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-20 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce ${
          isOpen ? 'bg-neutral-900 rotate-90' : 'bg-white'
        }`}
      >
        {isOpen ? (
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
             {/* BIGGER 3D ROBOT */}
             <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
                <path d="M16 18L18 20M8 18L6 20" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="5" y="7" width="14" height="11" rx="4" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5"/>
                <circle cx="9" cy="11" r="1.5" fill="#2563eb"/>
                <circle cx="15" cy="11" r="1.5" fill="#2563eb"/>
                <path d="M9 15H15" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 7V4M10 4H14" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="7" y="10" width="10" height="3" rx="1.5" fill="white" fillOpacity="0.5"/>
             </svg>
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
          </div>
        )}
      </button>
    </div>
  )
}