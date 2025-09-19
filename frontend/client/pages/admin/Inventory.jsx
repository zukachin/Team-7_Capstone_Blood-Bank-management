import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Download, Droplets, Activity, RefreshCw } from 'lucide-react';

// Replace this with your actual api import
import { api } from '../../lib/api';

const componentColors = {
  'WholeBlood': 'bg-red-600',
  'RBC': 'bg-red-800',
  'Plasma': 'bg-yellow-600',
  'Platelets': 'bg-purple-600'
};

const componentIcons = {
  'WholeBlood': '🩸',
  'RBC': '🔴',
  'Plasma': '🟡',
  'Platelets': '🟣'
};

export default function InventoryDashboard() {
  const [inventoryData, setInventoryData] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInventoryData();
    fetchLowStock();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using your existing API structure
      const data = await api.getInventorySummary();
      setInventoryData(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setError(`Failed to load inventory: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      // Using your existing API structure  
      const data = await api.getLowStockInventory(lowStockThreshold);
      setLowStock(data.data || []);
    } catch (err) {
      console.error('Failed to load low stock items:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchInventoryData(), fetchLowStock()]);
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      await api.exportInventoryCSV();
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const getTotalUnits = (components) => {
    return components.reduce((sum, comp) => sum + comp.units_available, 0);
  };

  const getOverallStats = () => {
    if (!inventoryData?.summary) return { total: 0, bloodGroups: 0, lowStockCount: lowStock.length };
    
    const total = inventoryData.summary.reduce((sum, bg) => 
      sum + getTotalUnits(bg.components), 0
    );
    
    return {
      total,
      bloodGroups: inventoryData.summary.length,
      lowStockCount: lowStock.length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="ml-4 text-gray-400">Loading inventory data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-600 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-200 mb-4">
          <AlertTriangle size={20} />
          <span className="font-medium">Error Loading Inventory</span>
        </div>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={fetchInventoryData}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="text-red-500" size={32} />
            Inventory Management
          </h1>
          <p className="text-gray-400 mt-1">
            Centre ID: <span className="text-white font-medium">{inventoryData?.centre_id || 'N/A'}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wide">Total Units</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <Package className="w-10 h-10 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-medium uppercase tracking-wide">Blood Groups</p>
              <p className="text-3xl font-bold mt-1">{stats.bloodGroups}</p>
            </div>
            <Droplets className="w-10 h-10 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm font-medium uppercase tracking-wide">Low Stock Items</p>
              <p className="text-3xl font-bold mt-1">{stats.lowStockCount}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-900/60 to-orange-900/60 border border-yellow-600 rounded-lg p-6">
          <div className="flex items-center gap-2 text-yellow-200 font-medium mb-4">
            <AlertTriangle size={20} />
            <span className="text-lg">Low Stock Alert</span>
            <span className="bg-yellow-600 text-yellow-900 px-2 py-1 rounded-full text-sm font-bold">
              {lowStock.length} items
            </span>
          </div>
          <p className="text-yellow-300 mb-4">Items below {lowStockThreshold} units threshold:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.slice(0, 6).map((item) => (
              <div key={item.inventory_id} className="bg-yellow-800/50 p-4 rounded-lg border border-yellow-600/50">
                <div className="text-yellow-100 font-medium text-lg">
                  {item.blood_group_name} - {item.component}
                </div>
                <div className="text-yellow-300 text-sm mt-1">
                  Only {item.units_available} units remaining
                </div>
              </div>
            ))}
          </div>
          {lowStock.length > 6 && (
            <p className="text-yellow-400 text-sm mt-3">
              +{lowStock.length - 6} more items need attention
            </p>
          )}
        </div>
      )}

      {/* Blood Group Inventory Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Blood Group Inventory</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {inventoryData?.summary?.map((bloodGroup) => (
            <div key={bloodGroup.blood_group_id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Droplets className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {bloodGroup.blood_group_name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Blood Group ID: {bloodGroup.blood_group_id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {getTotalUnits(bloodGroup.components)}
                  </div>
                  <div className="text-gray-400 text-sm">Total Units</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {bloodGroup.components.map((component) => (
                  <div key={component.component} className="bg-gray-700/60 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-4 h-4 rounded-full ${componentColors[component.component] || 'bg-gray-500'}`}></div>
                      <span className="text-gray-300 font-medium">{component.component}</span>
                    </div>
                    
                    <div className="text-2xl font-bold text-white mb-2">
                      {component.units_available}
                      <span className="text-sm text-gray-400 font-normal ml-1">units</span>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-2">
                      Last Updated: {component.last_updated ? 
                        new Date(component.last_updated).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Never'
                      }
                    </div>
                    
                    {/* Stock Status Indicator */}
                    <div className="flex items-center gap-1">
                      {component.units_available <= lowStockThreshold ? (
                        <div className="flex items-center gap-1 text-yellow-400 text-xs bg-yellow-900/30 px-2 py-1 rounded">
                          <AlertTriangle size={12} />
                          Low Stock
                        </div>
                      ) : component.units_available <= 20 ? (
                        <div className="flex items-center gap-1 text-orange-400 text-xs bg-orange-900/30 px-2 py-1 rounded">
                          <Activity size={12} />
                          Medium Stock
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">
                          Good Stock
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No Data State */}
      {(!inventoryData?.summary || inventoryData.summary.length === 0) && (
        <div className="text-center py-16 text-gray-400">
          <Package size={64} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No Inventory Data Available</h3>
          <p className="text-gray-500 mb-4">
            There is no inventory data for your centre at the moment.
          </p>
          <p className="text-sm text-gray-500">
            Check your centre assignment or contact the system administrator for assistance.
          </p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
}