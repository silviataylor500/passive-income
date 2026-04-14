import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  mobile: string
  investmentAmount: number
  dailyReturnRate: number
  btcAllocated: number
  dailyEarnings: number
  totalEarnings: number
  role: string
  createdAt: string
}

interface Deposit {
  id: string
  userId: string
  name: string
  email: string
  transactionId: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface PriceData {
  bitcoin: {
    usd: number
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [btcPrice, setBtcPrice] = useState<number>(0)
  const [trc20Address, setTrc20Address] = useState<string>('')
  const [newTrc20Address, setNewTrc20Address] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'users' | 'deposits' | 'settings'>('users')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    fetchUsers()
    fetchBtcPrice()
    fetchTrc20Address()
    fetchDeposits()
  }, [navigate])

  const fetchBtcPrice = async () => {
    try {
      const response = await axios.get<PriceData>(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      )
      setBtcPrice(response.data.bitcoin.usd)
    } catch (error) {
      console.error('Failed to fetch BTC price:', error)
    }
  }

  const fetchTrc20Address = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/settings/trc20', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTrc20Address(response.data.trc20_address || '')
      setNewTrc20Address(response.data.trc20_address || '')
    } catch (error) {
      console.error('Failed to fetch TRC20 address:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(response.data)
      setLoading(false)
    } catch (err: any) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || 'Failed to fetch users')
      setLoading(false)
      if (err.response?.status === 403) {
        navigate('/dashboard')
      }
    }
  }

  const fetchDeposits = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/deposits', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDeposits(response.data)
    } catch (err: any) {
      console.error('Fetch deposits error:', err)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/admin/users/${editingUser.id}`, {
        investmentAmount: editingUser.investmentAmount,
        dailyReturnRate: editingUser.dailyReturnRate,
        btcAllocated: editingUser.btcAllocated,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEditingUser(null)
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed')
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleSaveTrc20Address = async () => {
    if (!newTrc20Address.trim()) {
      alert('Please enter a TRC20 address')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/admin/settings/trc20', {
        trc20_address: newTrc20Address,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTrc20Address(newTrc20Address)
      alert('TRC20 address saved successfully!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save TRC20 address')
    }
  }

  const handleApproveDeposit = async (depositId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/admin/deposits/${depositId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchDeposits()
      alert('Deposit approved!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve deposit')
    }
  }

  const handleRejectDeposit = async (depositId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/admin/deposits/${depositId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchDeposits()
      alert('Deposit rejected!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject deposit')
    }
  }

  const handleInvestmentChange = (amount: number) => {
    if (!editingUser) return
    
    let newBtcAllocated = editingUser.btcAllocated
    if (btcPrice > 0 && amount > 0) {
      newBtcAllocated = amount / btcPrice
    }
    
    setEditingUser({
      ...editingUser,
      investmentAmount: amount,
      btcAllocated: newBtcAllocated
    })
  }

  // Helper to safely format numbers
  const formatUSD = (val: any) => {
    const num = parseFloat(val)
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  const formatBTC = (val: any) => {
    const num = parseFloat(val)
    return isNaN(num) ? '0.00000000' : num.toFixed(8)
  }

  const formatPercent = (val: any) => {
    const num = parseFloat(val)
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Admin Panel...</div>

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500">Admin Control Panel</h1>
            {btcPrice > 0 && (
              <p className="text-slate-400 text-sm mt-1">
                Live BTC Price: <span className="text-green-400">${btcPrice.toLocaleString()}</span>
              </p>
            )}
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">Back to Dashboard</button>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg mb-6">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'users'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'deposits'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deposits ({deposits.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            <table className="w-full text-left">
              <thead className="bg-slate-700 text-slate-300 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Investment</th>
                  <th className="px-6 py-4">Rate</th>
                  <th className="px-6 py-4">BTC</th>
                  <th className="px-6 py-4">Daily Earn</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">${formatUSD(user.investmentAmount)}</td>
                    <td className="px-6 py-4 text-green-400">{formatPercent(user.dailyReturnRate)}%</td>
                    <td className="px-6 py-4 text-xs">{formatBTC(user.btcAllocated)}</td>
                    <td className="px-6 py-4 text-green-400">${formatUSD(user.dailyEarnings)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingUser(user)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Deposits Tab */}
        {activeTab === 'deposits' && (
          <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            <table className="w-full text-left">
              <thead className="bg-slate-700 text-slate-300 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-slate-400">No deposits found</td>
                  </tr>
                ) : (
                  deposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold">{deposit.name}</div>
                        <div className="text-xs text-slate-400">{deposit.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{deposit.transactionId}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          deposit.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          deposit.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(deposit.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {deposit.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveDeposit(deposit.id)} className="text-green-400 hover:text-green-300 text-sm">Approve</button>
                            <button onClick={() => handleRejectDeposit(deposit.id)} className="text-red-400 hover:text-red-300 text-sm">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">TRC20 Deposit Address</label>
                <p className="text-xs text-slate-500 mb-3">This address will be shown to users when they make a deposit</p>
                <input
                  type="text"
                  value={newTrc20Address}
                  onChange={(e) => setNewTrc20Address(e.target.value)}
                  placeholder="Enter TRC20 address (e.g., TRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                />
                <button
                  onClick={handleSaveTrc20Address}
                  className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-lg transition"
                >
                  Save TRC20 Address
                </button>
                {trc20Address && (
                  <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Current Address:</p>
                    <p className="text-sm font-mono text-green-400 break-all">{trc20Address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User: {editingUser.name}</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Investment Amount ($)</label>
                <input
                  type="number"
                  value={editingUser.investmentAmount}
                  onChange={(e) => handleInvestmentChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
                />
                <p className="text-[10px] text-slate-500 mt-1 italic">* BTC Allocated will auto-calculate based on live price (${btcPrice.toLocaleString()})</p>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Daily Return Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingUser.dailyReturnRate}
                  onChange={(e) => setEditingUser({ ...editingUser, dailyReturnRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">BTC Allocated</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={editingUser.btcAllocated}
                  onChange={(e) => setEditingUser({ ...editingUser, btcAllocated: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 rounded-lg">Save Changes</button>
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
