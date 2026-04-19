import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Logo from '../components/Logo'

interface PriceData {
  bitcoin: {
    usd: number
    usd_24h_change: number
  }
  ethereum?: {
    usd: number
    usd_24h_change: number
  }
  litecoin?: {
    usd: number
    usd_24h_change: number
  }
}

export default function Home() {
  const [btcPrice, setBtcPrice] = useState<number>(0)
  const [ethPrice, setEthPrice] = useState<number>(0)
  const [ltcPrice, setLtcPrice] = useState<number>(0)
  const [btcChange, setBtcChange] = useState<number>(0)
  const [ethChange, setEthChange] = useState<number>(0)
  const [ltcChange, setLtcChange] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get<PriceData>(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd&include_24hr_change=true'
        )
        setBtcPrice(response.data.bitcoin.usd)
        setBtcChange(response.data.bitcoin.usd_24h_change)
        setEthPrice(response.data.ethereum?.usd || 0)
        setEthChange(response.data.ethereum?.usd_24h_change || 0)
        setLtcPrice(response.data.litecoin?.usd || 0)
        setLtcChange(response.data.litecoin?.usd_24h_change || 0)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch price:', error)
        setBtcPrice(75000)
        setEthPrice(2500)
        setLtcPrice(150)
        setLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#eaecef] font-sans selection:bg-yellow-500/30 overflow-hidden">
      {/* Navbar */}
      <nav className="bg-[#0a0a0a] border-b border-[#2b2f36] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
              <Logo size="lg" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-white hover:text-orange-500 transition-colors">Home</Link>
              <Link to="/" className="text-sm font-medium text-[#848e9c] hover:text-white transition-colors">About</Link>
              <Link to="/" className="text-sm font-medium text-[#848e9c] hover:text-white transition-colors">Plans</Link>
              <Link to="/markets" className="text-sm font-medium text-[#848e9c] hover:text-white transition-colors">Market</Link>
              <Link to="/" className="text-sm font-medium text-[#848e9c] hover:text-white transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-[#eaecef] hover:text-yellow-500 transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="px-6 py-2.5 bg-orange-500 text-white rounded font-bold text-sm hover:bg-orange-400 transition-all">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-yellow-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div>
              {/* Main Heading */}
              <h1 className="text-6xl lg:text-7xl font-black text-yellow-400 mb-4 tracking-tight leading-tight">
                DIGGING<br/>POOL
              </h1>
              <p className="text-lg text-[#848e9c] mb-2 font-medium">Mine. Invest. Profit.</p>
              <p className="text-xl text-white mb-8 font-semibold">Start Earning Crypto Today</p>

              {/* CTA Button */}
              <Link to="/signup" className="inline-block px-8 py-3 bg-orange-500 text-white rounded font-bold text-base hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/30">
                Start Mining
              </Link>
            </div>

            {/* Right Column - 3D Mining Visualization */}
            <div className="relative h-96 flex items-center justify-center">
              {/* 3D Bitcoin Coin with Glow */}
              <div className="relative w-64 h-64">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
                
                {/* Bitcoin Coin */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl shadow-yellow-500/50 flex items-center justify-center relative">
                    {/* Inner shine */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 to-transparent rounded-full"></div>
                    {/* Bitcoin Symbol */}
                    <span className="text-7xl font-black text-yellow-900 relative z-10">₿</span>
                  </div>
                </div>

                {/* Floating 3D Boxes */}
                <div className="absolute top-0 left-0 w-16 h-16 bg-yellow-600/40 rounded-lg transform -rotate-12 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-8 right-0 w-12 h-12 bg-yellow-500/30 rounded-lg transform rotate-45 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-12 left-4 w-14 h-14 bg-yellow-600/30 rounded-lg transform rotate-12 animate-bounce" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-0 right-8 w-10 h-10 bg-yellow-500/40 rounded-lg transform -rotate-45 animate-bounce" style={{ animationDelay: '0.3s' }}></div>

                {/* Light Rays */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-300/60 rounded-full blur-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Market Stats Section */}
      <div className="bg-[#0a0a0a] py-20 border-t border-[#2b2f36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-16 relative">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-500"></div>
              <h2 className="text-3xl font-black text-yellow-400">Live Market Stats</h2>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-500"></div>
            </div>
          </div>

          {/* Crypto Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Bitcoin Card */}
            <div className="bg-[#1e2329] border border-[#2b2f36] rounded-2xl p-6 hover:border-orange-500/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-lg font-black">₿</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">Bitcoin [BTC]</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${btcChange >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                  {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}%
                </span>
              </div>
              {/* Mini Chart */}
              <div className="h-12 flex items-end gap-0.5 mb-4">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-orange-500/60 rounded-t-sm"
                    style={{ height: `${Math.random() * 100}%` }}
                  ></div>
                ))}
              </div>
              <p className="text-xs text-[#848e9c]">📊 Chart</p>
            </div>

            {/* Ethereum Card */}
            <div className="bg-[#1e2329] border border-[#2b2f36] rounded-2xl p-6 hover:border-purple-500/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-lg font-black">Ξ</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">Ethereum [ETH]</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${ethChange >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                  {ethChange >= 0 ? '+' : ''}{ethChange.toFixed(2)}%
                </span>
              </div>
              {/* Mini Chart */}
              <div className="h-12 flex items-end gap-0.5 mb-4">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gray-500/60 rounded-t-sm"
                    style={{ height: `${Math.random() * 100}%` }}
                  ></div>
                ))}
              </div>
              <p className="text-xs text-[#848e9c]">📊 Chart</p>
            </div>

            {/* Litecoin Card */}
            <div className="bg-[#1e2329] border border-[#2b2f36] rounded-2xl p-6 hover:border-blue-500/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-lg font-black">Ł</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">Litecoin [LTC]</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${ltcChange >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                  {ltcChange >= 0 ? '+' : ''}{ltcChange.toFixed(2)}%
                </span>
              </div>
              {/* Mini Chart */}
              <div className="h-12 flex items-end gap-0.5 mb-4">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-blue-500/60 rounded-t-sm"
                    style={{ height: `${Math.random() * 100}%` }}
                  ></div>
                ))}
              </div>
              <p className="text-xs text-[#848e9c]">📊 Chart</p>
            </div>
          </div>

          {/* Market Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1e2329] border border-[#2b2f36] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📉</span>
                <p className="text-xs text-[#848e9c] font-bold">21.15 Trillion</p>
              </div>
              <div className="h-6 flex items-end gap-0.5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex-1 bg-gray-500/40 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }}></div>
                ))}
              </div>
            </div>

            <div className="bg-[#1e2329] border border-[#2b2f36] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📊</span>
                <p className="text-xs text-[#848e9c] font-bold">$45.3 Billion</p>
              </div>
              <div className="h-6 flex items-end gap-0.5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex-1 bg-yellow-600/40 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }}></div>
                ))}
              </div>
            </div>

            <div className="bg-[#1e2329] border border-[#2b2f36] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🪙</span>
                <p className="text-xs text-[#848e9c] font-bold">BTC Dominance</p>
              </div>
              <p className="text-2xl font-black text-yellow-400">42.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Levels Section */}
      <div className="bg-[#0a0a0a] py-20 border-t border-[#2b2f36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-500"></div>
              <h2 className="text-3xl font-black text-yellow-400">Investment Levels</h2>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-500"></div>
            </div>
            <p className="text-[#848e9c] text-sm mt-2">Choose Your Plan</p>
          </div>

          {/* Investment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Silver Plan */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-400/20 to-slate-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-gradient-to-b from-slate-400/10 to-slate-600/10 border border-slate-400/30 rounded-2xl p-8 backdrop-blur-sm">
                {/* Header with 3D effect */}
                <div className="bg-gradient-to-r from-slate-300 to-slate-400 rounded-t-2xl -mx-8 -mt-8 mb-6 py-4 px-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                  <h3 className="text-2xl font-black text-slate-900 relative z-10">Silver Plan</h3>
                </div>

                <p className="text-5xl font-black text-white mb-2">5%</p>
                <p className="text-[#848e9c] text-sm mb-6 font-medium">Daily Return</p>

                <div className="space-y-3 mb-8 pb-8 border-b border-slate-400/20">
                  <div className="flex items-center gap-3">
                    <span className="text-[#0ecb81]">✓</span>
                    <span className="text-[#848e9c] text-sm">Minimum Deposit $500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#0ecb81]">✓</span>
                    <span className="text-[#848e9c] text-sm">24/7 Support</span>
                  </div>
                </div>

                <Link to="/signup" className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white rounded font-bold transition-all text-center block">
                  Get Started
                </Link>
              </div>
            </div>

            {/* Gold Plan (Featured) */}
            <div className="relative group md:scale-110 md:z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/30 to-orange-600/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-gradient-to-b from-yellow-400/10 to-orange-600/10 border border-yellow-400/50 rounded-2xl p-8 backdrop-blur-sm">
                {/* Header with 3D effect */}
                <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-t-2xl -mx-8 -mt-8 mb-6 py-4 px-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                  <h3 className="text-2xl font-black text-yellow-900 relative z-10">Gold Plan</h3>
                </div>

                <p className="text-5xl font-black text-yellow-400 mb-2">7%</p>
                <p className="text-[#848e9c] text-sm mb-6 font-medium">Daily Return</p>

                <div className="space-y-3 mb-8 pb-8 border-b border-yellow-400/20">
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400">✓</span>
                    <span className="text-[#848e9c] text-sm">Minimum Deposit $2,500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400">✓</span>
                    <span className="text-[#848e9c] text-sm">Priority Support</span>
                  </div>
                </div>

                <Link to="/signup" className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white rounded font-bold transition-all text-center block">
                  Get Started
                </Link>
              </div>
            </div>

            {/* Diamond Plan */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-300/20 to-slate-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-gradient-to-b from-slate-300/10 to-slate-500/10 border border-slate-400/30 rounded-2xl p-8 backdrop-blur-sm">
                {/* Header with 3D effect */}
                <div className="bg-gradient-to-r from-slate-200 to-slate-300 rounded-t-2xl -mx-8 -mt-8 mb-6 py-4 px-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                  <h3 className="text-2xl font-black text-slate-900 relative z-10">Diamond Plan</h3>
                </div>

                <p className="text-5xl font-black text-white mb-2">10%</p>
                <p className="text-[#848e9c] text-sm mb-6 font-medium">Daily Return</p>

                <div className="space-y-3 mb-8 pb-8 border-b border-slate-400/20">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300">✓</span>
                    <span className="text-[#848e9c] text-sm">Minimum Deposit $10,000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300">✓</span>
                    <span className="text-[#848e9c] text-sm">VIP Support</span>
                  </div>
                </div>

                <Link to="/signup" className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white rounded font-bold transition-all text-center block">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-[#2b2f36] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Logo size="md" />
            <div className="flex gap-8 text-sm text-[#848e9c]">
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Cookie Policy</span>
            </div>
            <p className="text-sm text-[#474d57]">© 2026 DiggingPool.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
