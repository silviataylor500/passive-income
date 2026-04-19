import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Trading() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [btcPrice, setBtcPrice] = useState(0)
  const [displayPrice, setDisplayPrice] = useState(0)
  const [strikePrice, setStrikePrice] = useState(0)
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

    const fetchData = async () => {
      try {
        const profileRes = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        if (!profileRes.data.vipUnlocked) {
          navigate('/dashboard')
          return
        }
        
        setUser(profileRes.data)
        
        // Fetch settings to get admin-configured profit rate
        const settingsRes = await axios.get('/api/settings/all', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSettings(settingsRes.data)
        
        // Fetch BTC price
        const btcRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        const initialPrice = btcRes.data.bitcoin.usd
        setBtcPrice(initialPrice)
        setDisplayPrice(initialPrice)
        setStrikePrice(initialPrice)
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError('Failed to load trading data')
        setLoading(false)
      }
    }

    fetchData()

    // Price fluctuation animation
    priceInterval.current = setInterval(() => {
      setDisplayPrice(prev => {
        const fluctuation = (Math.random() - 0.5) * 20
        return Math.max(prev + fluctuation, 1000)
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
    setStrikePrice(displayPrice) // Lock the strike price when trade starts

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
      setAmount('')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Trade execution failed')
      setIsTrading(false)
    }
  }

  const getProfitPercentage = () => {
    return user?.vipProfitRate || 20
  }

  const calculatePotentialProfit = () => {
    if (!amount || parseFloat(amount) <= 0) return 0
    const profitRate = getProfitPercentage()
    return (parseFloat(amount) * profitRate) / 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0e11] to-[#1a1d23] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#848e9c] font-semibold">Loading VIP Trading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e11] via-[#0f1219] to-[#1a1d23] text-[#eaecef] font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0b0e11]/80 backdrop-blur-xl border-b border-[#2b2f36]/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 px-4 py-2 text-[#848e9c] hover:text-white hover:bg-[#1e2329] rounded-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Dashboard</span>
          </button>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">VIP Trading Active</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Price Chart & Market Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Price Card */}
            <div className="bg-gradient-to-br from-[#1e2329] to-[#1a1f26] border border-[#2b2f36]/50 rounded-3xl p-8 relative overflow-hidden group">
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-xs font-bold text-[#848e9c] uppercase tracking-widest mb-2">Current Price</p>
                    <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#848e9c]">
                      ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#848e9c] uppercase mb-2">24h Change</p>
                    <p className="text-2xl font-black text-[#0ecb81]">+5.24%</p>
                  </div>
                </div>

                {/* Price Chart Visualization */}
                <div className="h-56 flex items-end gap-1 mb-8 bg-[#0b0e11]/30 rounded-2xl p-4">
                  {[...Array(40)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-t-lg transition-all duration-500 ${displayPrice >= btcPrice ? 'bg-gradient-to-t from-[#0ecb81] to-[#0ecb81]/30' : 'bg-gradient-to-t from-[#f6465d] to-[#f6465d]/30'}`}
                      style={{ height: `${Math.random() * 100}%` }}
                    ></div>
                  ))}
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0b0e11]/50 rounded-xl p-4 border border-[#2b2f36]/30">
                    <p className="text-xs font-bold text-[#848e9c] uppercase mb-1">High</p>
                    <p className="text-lg font-black text-[#0ecb81]">${(displayPrice * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-[#0b0e11]/50 rounded-xl p-4 border border-[#2b2f36]/30">
                    <p className="text-xs font-bold text-[#848e9c] uppercase mb-1">Low</p>
                    <p className="text-lg font-black text-[#f6465d]">${(displayPrice * 0.95).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-[#0b0e11]/50 rounded-xl p-4 border border-[#2b2f36]/30">
                    <p className="text-xs font-bold text-[#848e9c] uppercase mb-1">Volume</p>
                    <p className="text-lg font-black text-orange-500">$28.5B</p>
                  </div>
                </div>
              </div>

              {/* Trading Overlay */}
              {isTrading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-3xl">
                  <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-[#2b2f36]"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * timer) / 30}
                        className="text-orange-500 transition-all duration-1000"
                      />
                    </svg>
                    <span className="absolute text-5xl font-black text-white">{timer}s</span>
                  </div>
                  <p className="text-white font-bold tracking-widest text-lg animate-pulse">EXECUTING TRADE...</p>
                </div>
              )}

              {/* Trade Result Overlay */}
              {tradeResult && (
                <div className="absolute inset-0 bg-[#0b0e11]/95 backdrop-blur-lg flex flex-col items-center justify-center z-50 rounded-3xl p-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#0ecb81]/30 to-[#0ecb81]/10 rounded-full flex items-center justify-center mb-6 border-2 border-[#0ecb81]/50 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#0ecb81]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-black text-white mb-3">Trade Completed!</h2>
                  <p className="text-[#848e9c] mb-8 text-center">Your VIP profit has been credited to your account.</p>
                  
                  <div className="bg-gradient-to-br from-[#1e2329] to-[#1a1f26] border border-[#2b2f36]/50 rounded-2xl p-8 w-full max-w-sm mb-8">
                    <p className="text-xs font-bold text-[#848e9c] uppercase mb-2">Total Profit Earned</p>
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0ecb81] to-[#00d99f] mb-4">
                      ${tradeResult.profit.toFixed(2)}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-[#2b2f36]/50">
                      <span className="text-xs font-bold text-[#848e9c]">Profit Rate</span>
                      <span className="text-lg font-black text-[#0ecb81]">{tradeResult.rate}%</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setTradeResult(null)}
                    className="px-16 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black rounded-xl transition-all shadow-lg shadow-orange-500/30 uppercase tracking-widest"
                  >
                    New Trade
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Trade Control Panel */}
          <div className="space-y-6">
            {/* Trade Control Card */}
            <div className="bg-gradient-to-br from-[#1e2329] to-[#1a1f26] border border-[#2b2f36]/50 rounded-3xl p-8">
              <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Trade Control
              </h2>

              <div className="space-y-6">
                {/* Investment Amount */}
                <div>
                  <label className="text-xs font-bold text-[#848e9c] uppercase tracking-widest mb-3 block">Investment Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#848e9c] font-bold text-lg">$</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isTrading}
                      placeholder="0.00"
                      className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-xl py-4 pl-10 pr-4 text-white font-bold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Strike Price Display */}
                <div className="bg-[#0b0e11]/50 rounded-xl p-4 border border-[#2b2f36]/50">
                  <p className="text-xs font-bold text-[#848e9c] uppercase tracking-widest mb-2">BTC/USD Strike Price</p>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                    ${strikePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Potential Profit Preview */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-[#0ecb81]/10 rounded-xl p-4 border border-[#0ecb81]/30">
                    <p className="text-xs font-bold text-[#848e9c] uppercase tracking-widest mb-2">Potential Profit</p>
                    <p className="text-2xl font-black text-[#0ecb81]">
                      ${calculatePotentialProfit().toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Buy/Sell Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    onClick={() => handleTrade('buy')}
                    disabled={isTrading || !amount || parseFloat(amount) <= 0}
                    className="py-4 px-4 bg-gradient-to-br from-[#0ecb81] to-[#0ba368] hover:from-[#0ba368] hover:to-[#0a9157] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-[#0ecb81]/20 font-black uppercase tracking-widest"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span className="text-sm">Buy</span>
                  </button>
                  <button 
                    onClick={() => handleTrade('sell')}
                    disabled={isTrading || !amount || parseFloat(amount) <= 0}
                    className="py-4 px-4 bg-gradient-to-br from-[#f6465d] to-[#d93e52] hover:from-[#d93e52] hover:to-[#c23547] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-[#f6465d]/20 font-black uppercase tracking-widest"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span className="text-sm">Sell</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-gradient-to-br from-[#1e2329] to-[#1a1f26] border border-[#2b2f36]/50 rounded-3xl p-8">
              <h3 className="text-lg font-black text-white mb-6">Account Status</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-[#0b0e11]/50 rounded-xl border border-[#2b2f36]/50">
                  <span className="text-xs font-bold text-[#848e9c] uppercase">VIP Status</span>
                  <span className="px-3 py-1 bg-[#0ecb81]/20 text-[#0ecb81] rounded-full text-xs font-black">UNLOCKED</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#0b0e11]/50 rounded-xl border border-[#2b2f36]/50">
                  <span className="text-xs font-bold text-[#848e9c] uppercase">Profit Rate</span>
                  <span className="text-lg font-black text-orange-500">{getProfitPercentage()}%</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#0b0e11]/50 rounded-xl border border-[#2b2f36]/50">
                  <span className="text-xs font-bold text-[#848e9c] uppercase">Trading Fee</span>
                  <span className="text-lg font-black text-[#0ecb81]">0.00%</span>
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-3xl p-6">
              <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">💡 Trading Tips</p>
              <ul className="space-y-2 text-xs text-[#848e9c]">
                <li className="flex gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Start with smaller amounts to understand market movement</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Your profit rate is set by your admin</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Trades execute after 30-second countdown</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
