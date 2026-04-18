import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Trading() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [btcPrice, setBtcPrice] = useState(0)
  const [displayPrice, setDisplayPrice] = useState(0)
  const [amount, setAmount] = useState('')
  const [isTrading, setIsTrading] = useState(false)
  const [timer, setTimer] = useState(30)
  const [tradeResult, setTradeResult] = useState<{ profit: number; rate: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const priceInterval = useRef<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.data.vipUnlocked) {
          navigate('/dashboard')
          return
        }
        setUser(res.data)
        
        const btcRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        const initialPrice = btcRes.data.bitcoin.usd
        setBtcPrice(initialPrice)
        setDisplayPrice(initialPrice)
        setLoading(false)
      } catch (err: any) {
        setError('Failed to load trading data')
        setLoading(false)
      }
    }

    fetchProfile()

    // Price fluctuation animation
    priceInterval.current = setInterval(() => {
      setDisplayPrice(prev => {
        const fluctuation = (Math.random() - 0.5) * 20
        return prev + fluctuation
      })
    }, 500)

    return () => clearInterval(priceInterval.current)
  }, [navigate])

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setIsTrading(true)
    setTimer(30)
    setTradeResult(null)

    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdown)
          executeTrade()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const executeTrade = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('/api/trading/execute', {
        amount: parseFloat(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTradeResult({ profit: res.data.profit, rate: res.data.profitRate })
      setIsTrading(false)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Trade execution failed')
      setIsTrading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-yellow-500">Loading VIP Trading...</div>

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-[#848e9c] hover:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2 px-4 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">VIP Trading Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Price Chart Area */}
          <div className="lg:col-span-2 bg-[#1e2329] border border-[#2b2f36] rounded-3xl p-8 relative overflow-hidden">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-sm font-bold text-[#848e9c] uppercase tracking-widest mb-1">BTC / USD</h1>
                <p className={`text-4xl font-black transition-colors duration-300 ${displayPrice >= btcPrice ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                  ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#848e9c] uppercase mb-1">24h Change</p>
                <p className="text-sm font-bold text-[#0ecb81]">+5.24%</p>
              </div>
            </div>

            {/* Price Animation Visual */}
            <div className="h-48 flex items-end gap-1 mb-8">
              {[...Array(30)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm transition-all duration-500 ${displayPrice >= btcPrice ? 'bg-[#0ecb81]/20' : 'bg-[#f6465d]/20'}`}
                  style={{ height: `${Math.random() * 100}%` }}
                ></div>
              ))}
            </div>

            {isTrading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-[#2b2f36]"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={377}
                      strokeDashoffset={377 - (377 * timer) / 30}
                      className="text-orange-500 transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute text-4xl font-black text-white">{timer}s</span>
                </div>
                <p className="mt-4 text-white font-bold tracking-widest animate-pulse">EXECUTING TRADE...</p>
              </div>
            )}

            {tradeResult && (
              <div className="absolute inset-0 bg-[#0b0e11]/90 backdrop-blur-md flex flex-col items-center justify-center z-30 p-8 text-center">
                <div className="w-20 h-20 bg-[#0ecb81]/20 rounded-full flex items-center justify-center mb-6 border border-[#0ecb81]/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#0ecb81]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-white mb-2">TRADE COMPLETED</h2>
                <p className="text-[#848e9c] mb-8">Your VIP profit has been credited to your account.</p>
                <div className="bg-[#1e2329] border border-[#2b2f36] rounded-2xl p-6 w-full max-w-xs mb-8">
                  <p className="text-xs font-bold text-[#848e9c] uppercase mb-1">Total Profit Made</p>
                  <p className="text-4xl font-black text-[#0ecb81]">${tradeResult.profit.toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-[#848e9c] mt-2">Rate: {tradeResult.rate}%</p>
                </div>
                <button 
                  onClick={() => setTradeResult(null)}
                  className="px-12 py-4 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-black transition-all shadow-lg shadow-orange-500/20"
                >
                  NEW TRADE
                </button>
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="bg-[#1e2329] border border-[#2b2f36] rounded-3xl p-8">
            <h3 className="text-xl font-black text-white mb-8">Trade Controls</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-[#848e9c] uppercase tracking-widest mb-2 block">Investment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#848e9c] font-bold">$</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isTrading}
                    placeholder="0.00"
                    className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-2xl py-4 pl-10 pr-4 text-white font-bold focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleTrade('buy')}
                  disabled={isTrading}
                  className="py-6 bg-[#0ecb81] hover:bg-[#0ba368] disabled:opacity-50 text-white rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-[#0ecb81]/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="font-black tracking-widest">BUY</span>
                </button>
                <button 
                  onClick={() => handleTrade('sell')}
                  disabled={isTrading}
                  className="py-6 bg-[#f6465d] hover:bg-[#d93e52] disabled:opacity-50 text-white rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-[#f6465d]/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="font-black tracking-widest">SELL</span>
                </button>
              </div>

              <div className="pt-6 border-t border-[#2b2f36]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-[#848e9c] uppercase">VIP Status</span>
                  <span className="text-xs font-bold text-[#0ecb81]">UNLOCKED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#848e9c] uppercase">Trading Fee</span>
                  <span className="text-xs font-bold text-white">0.00%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
