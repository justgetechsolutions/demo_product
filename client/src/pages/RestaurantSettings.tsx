import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Save, AlertCircle } from 'lucide-react';
import apiClient from '../utils/apiClient';

function RestaurantSettings() {
  const { restaurantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    billingName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    gstNumber: '',
    defaultGstPercentage: 0,
    billFooterMessage: 'Thank You! Visit Again',
  });

  useEffect(() => {
    fetchSettings();
  }, [restaurantId]);

  const fetchSettings = async () => {
    if (!restaurantId) {
      setError('Restaurant ID not found');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      console.log('Fetching settings for restaurantId:', restaurantId);
      const response = await apiClient.get(`/api/restaurants/${restaurantId}/settings`);
      console.log('Settings response:', response.data);
      setSettings(response.data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      // Initialize with empty values instead of showing error for new restaurants
      setError('Failed to load restaurant settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'defaultGstPercentage' ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!restaurantId) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await apiClient.put(`/api/restaurants/${restaurantId}/settings`, settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Settings</h1>
          <p className="text-gray-600">Configure your restaurant billing information</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <div className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0">✓</div>
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 space-y-6">
          {/* Billing Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Restaurant Name (for billing)
            </label>
            <input
              type="text"
              name="billingName"
              value={settings.billingName}
              onChange={handleChange}
              placeholder="e.g., Kismat Kathiyawadi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Name that will appear on bills and receipts</p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
              placeholder="e.g., Shukan Mall Char Rasta"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* City and Postal Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={settings.city}
                onChange={handleChange}
                placeholder="e.g., Sola"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={settings.postalCode}
                onChange={handleChange}
                placeholder="e.g., 380060"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Phone and Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="e.g., +91-98765-43210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                placeholder="e.g., info@restaurant.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* GST Number */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              GST Registration Number
            </label>
            <input
              type="text"
              name="gstNumber"
              value={settings.gstNumber}
              onChange={handleChange}
              placeholder="e.g., 24AABCL1234A1Z0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Default GST Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Default GST Percentage (%)
            </label>
            <input
              type="number"
              name="defaultGstPercentage"
              value={settings.defaultGstPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g., 18"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bill Footer Message */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Bill Footer Message
            </label>
            <textarea
              name="billFooterMessage"
              value={settings.billFooterMessage}
              onChange={handleChange}
              placeholder="e.g., Thank You! Visit Again"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Message shown at the bottom of bills</p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Preview</h2>
          <div className="bg-gray-50 p-4 border border-gray-200 rounded font-mono text-sm">
            <div className="text-center space-y-2">
              <div className="font-bold">{settings.billingName || 'Restaurant Name'}</div>
              {settings.address && <div className="text-xs">{settings.address}</div>}
              {(settings.city || settings.postalCode) && (
                <div className="text-xs">
                  {settings.city}
                  {settings.city && settings.postalCode && ', '}
                  {settings.postalCode}
                </div>
              )}
              {settings.phone && <div className="text-xs">Phone: {settings.phone}</div>}
              {settings.email && <div className="text-xs">Email: {settings.email}</div>}
              {settings.gstNumber && <div className="text-xs">GST: {settings.gstNumber}</div>}
              <div className="pt-2 border-t border-gray-300 text-xs">
                Bill #001 • Table: 01 • Date: DD/MM/YYYY
              </div>
              <div className="text-xs pt-2">Thank you for visiting!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantSettings;
