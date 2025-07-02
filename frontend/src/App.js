import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Package, Truck, CheckCircle2, Clock, AlertCircle, MapPin, Calendar, BarChart3, Star, Zap, Bell, RefreshCw } from 'lucide-react';

function App() {
  const [selectedExhibitor, setSelectedExhibitor] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [availableExhibitors, setAvailableExhibitors] = useState([]);

  // Mock exhibitors for login (you can replace this with API call later)
  const mockExhibitors = [
    {
      id: 'tech-innovations',
      name: 'TechFlow Innovations',
      booth: 'A-245',
      avatar: '🚀',
      color: 'from-blue-600 to-cyan-600',
      company: 'Leading AI Solutions'
    },
    {
      id: 'green-energy',
      name: 'GreenWave Energy',
      booth: 'B-156',
      avatar: '⚡',
      color: 'from-green-600 to-emerald-600',
      company: 'Sustainable Power Systems'
    },
    {
      id: 'smart-health',
      name: 'SmartHealth Corp',
      booth: 'C-089',
      avatar: '🏥',
      color: 'from-purple-600 to-pink-600',
      company: 'Digital Healthcare'
    },
    {
      id: 'nano-systems',
      name: 'NanoSys Industries',
      booth: 'D-312',
      avatar: '🔬',
      color: 'from-orange-600 to-red-600',
      company: 'Nanotechnology Solutions'
    }
  ];

  const orderStatuses = {
    'delivered': { 
      label: 'Delivered', 
      progress: 100, 
      color: 'from-green-500 to-emerald-500',
      icon: CheckCircle2,
      bgColor: 'bg-green-500/20 text-green-400'
    },
    'out-for-delivery': { 
      label: 'Out for Delivery', 
      progress: 75, 
      color: 'from-blue-500 to-cyan-500',
      icon: Truck,
      bgColor: 'bg-blue-500/20 text-blue-400'
    },
    'in-route': { 
      label: 'In Route from Warehouse', 
      progress: 50, 
      color: 'from-yellow-500 to-orange-500',
      icon: MapPin,
      bgColor: 'bg-yellow-500/20 text-yellow-400'
    },
    'in-process': { 
      label: 'In Process', 
      progress: 25, 
      color: 'from-purple-500 to-pink-500',
      icon: Clock,
      bgColor: 'bg-purple-500/20 text-purple-400'
    },
    'cancelled': { 
      label: 'Cancelled', 
      progress: 0, 
      color: 'from-red-500 to-red-600',
      icon: AlertCircle,
      bgColor: 'bg-red-500/20 text-red-400'
    }
  };

  // API calls
  const API_BASE = 'http://localhost:5000/api';

  const fetchOrders = async (exhibitorName) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/orders/exhibitor/${encodeURIComponent(exhibitorName)}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data.orders || []);
      setLastUpdated(new Date(data.last_updated));
      
      // Generate notifications based on recent order updates
      generateNotifications(data.orders || []);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to mock data if API fails
      const mockOrders = generateMockOrders(exhibitorName);
      setOrders(mockOrders);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (ordersData) => {
    const notifications = [];
    ordersData.forEach(order => {
      if (order.status === 'out-for-delivery') {
        notifications.push({
          id: Math.random(),
          message: `${order.item} is out for delivery!`,
          time: '2 min ago',
          type: 'delivery'
        });
      } else if (order.status === 'delivered') {
        notifications.push({
          id: Math.random(),
          message: `${order.item} has been delivered`,
          time: '15 min ago',
          type: 'success'
        });
      }
    });
    setNotifications(notifications.slice(0, 3)); // Show only last 3
  };

  // Fallback mock data generation
  const generateMockOrders = (exhibitorName) => {
    const baseOrders = [
      {
        id: 'ORD-2025-001',
        item: 'Premium Booth Setup Package',
        description: 'Complete booth installation with premium furniture, lighting, and tech setup',
        color: 'White',
        quantity: 1,
        status: 'out-for-delivery',
        order_date: 'June 14, 2025'
      },
      {
        id: 'ORD-2025-002',
        item: 'Interactive Display System',
        description: '75" 4K touchscreen display with interactive software and mounting',
        color: 'Black',
        quantity: 1,
        status: 'in-route',
        order_date: 'June 13, 2025'
      }
    ];
    return baseOrders;
  };

  // Auto-refresh orders every 30 seconds when logged in
  useEffect(() => {
    if (isLoggedIn && selectedExhibitor) {
      const exhibitor = mockExhibitors.find(e => e.id === selectedExhibitor);
      if (exhibitor) {
        fetchOrders(exhibitor.name);
        
        const interval = setInterval(() => {
          fetchOrders(exhibitor.name);
        }, 30000); // Refresh every 30 seconds
        
        return () => clearInterval(interval);
      }
    }
  }, [isLoggedIn, selectedExhibitor]);

  const handleLogin = () => {
    if (selectedExhibitor) {
      setIsLoggedIn(true);
    }
  };

  const handleRefresh = () => {
    if (selectedExhibitor) {
      const exhibitor = mockExhibitors.find(e => e.id === selectedExhibitor);
      if (exhibitor) {
        fetchOrders(exhibitor.name);
      }
    }
  };

  const renderProgressBar = (status) => {
    const statusInfo = orderStatuses[status];
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300 font-medium">Delivery Progress</span>
          <span className="text-white font-bold">{statusInfo.progress}%</span>
        </div>
        <div className="relative w-full bg-gray-700/50 rounded-full h-3">
          <div 
            className={`bg-gradient-to-r ${statusInfo.color} h-3 rounded-full transition-all duration-1000 relative overflow-hidden`}
            style={{ width: `${statusInfo.progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-20 animate-sweep"></div>
          </div>
        </div>
        <style jsx>{`
          @keyframes sweep {
            0% { transform: translateX(-100px); }
            100% { transform: translateX(calc(100vw)); }
          }
          .animate-sweep {
            animation: sweep 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">ExpoFlow</h1>
              <p className="text-gray-300">Exhibitor Order Management</p>
              <div className="flex items-center justify-center space-x-1 mt-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-yellow-400 text-sm">Real-time Order Tracking</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="block text-sm font-medium text-gray-200 mb-3 text-center">
                Select Your Company
              </label>
              {mockExhibitors.map((exhibitor) => (
                <div
                  key={exhibitor.id}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedExhibitor === exhibitor.id ? 'transform scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => setSelectedExhibitor(exhibitor.id)}
                >
                  <div className={`
                    p-4 rounded-2xl border-2 transition-all duration-300
                    ${selectedExhibitor === exhibitor.id
                      ? 'border-white/50 bg-white/20 shadow-lg'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }
                  `}>
                    <div className="flex items-center space-x-4">
                      <div className={`
                        w-12 h-12 rounded-xl bg-gradient-to-r ${exhibitor.color} 
                        flex items-center justify-center text-2xl shadow-lg
                      `}>
                        {exhibitor.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{exhibitor.name}</h3>
                        <p className="text-sm text-gray-300">{exhibitor.company}</p>
                        <p className="text-xs text-gray-400">Booth {exhibitor.booth}</p>
                      </div>
                      {selectedExhibitor === exhibitor.id && (
                        <div className="text-white">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleLogin}
              disabled={!selectedExhibitor}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300
                ${selectedExhibitor
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-gray-600/50 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center justify-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Access Your Orders</span>
              </div>
            </button>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-400">
                Live Updates • Real-time Tracking • Secure Portal
              </p>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm opacity-70 animate-bounce"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-sm opacity-70 animate-bounce delay-1000"></div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  const exhibitor = mockExhibitors.find(e => e.id === selectedExhibitor);
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${exhibitor.color} flex items-center justify-center text-3xl`}>
                {exhibitor.avatar}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{exhibitor.name}</h1>
                <p className="text-gray-300">{exhibitor.company} • Booth {exhibitor.booth}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-green-400">✓ Coffee Fest 2025</span>
                  <span className="text-sm text-gray-400">June 15-17, 2025</span>
                  {lastUpdated && (
                    <span className="text-xs text-gray-500">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 border border-white/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                <Bell className="w-6 h-6 text-white cursor-pointer hover:text-yellow-400 transition-colors" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 border border-white/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Total Orders</h3>
            </div>
            <div className="text-3xl font-bold text-blue-400">{orders.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Delivered</h3>
            </div>
            <div className="text-3xl font-bold text-green-400">{deliveredOrders}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Pending</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{pendingOrders}</div>
          </div>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span>Live Updates</span>
            </h2>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white flex-1">{notif.message}</span>
                  <span className="text-gray-400 text-sm">{notif.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
            <p className="text-white">Loading your orders...</p>
          </div>
        )}

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => {
            const statusInfo = orderStatuses[order.status];
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={order.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="w-6 h-6 text-white" />
                    <span className="text-white font-bold">{order.id}</span>
                  </div>
                </div>

                {/* Order Info */}
                <h3 className="text-xl font-bold text-white mb-2">{order.item}</h3>
                <p className="text-gray-300 text-sm mb-4">{order.description}</p>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-400">Order Date</p>
                    <p className="text-white font-medium">{order.order_date}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Quantity</p>
                    <p className="text-white font-medium">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Color</p>
                    <p className="text-white font-medium">{order.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Section</p>
                    <p className="text-white font-medium">{order.section}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  {renderProgressBar(order.status)}
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full ${statusInfo.bgColor}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{statusInfo.label}</span>
                </div>

                {/* Comments */}
                {order.comments && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">Comments</p>
                    <p className="text-white text-sm">{order.comments}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No orders message */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
            <p className="text-gray-400">No orders found for {exhibitor.name}. Check back later for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
