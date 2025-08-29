import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  DollarSign,
  Clock,
  Calendar,
  Loader2
} from 'lucide-react';

// Enhanced API service for services
const serviceAPI = {
  getServices: async (params = {}) => {
    try {
      // Try multiple endpoints for services
      let url;
      if (params.storeId) {
        // First try the store-specific endpoint
        url = `${process.env.REACT_APP_API_BASE_URL}/api/v1/services/store/${params.storeId}`;
      } else {
        url = '${process.env.REACT_APP_API_BASE_URL}/api/v1/services';
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Services API error:', error);

      // If store-specific endpoint fails, try general endpoint with filter
      if (params.storeId) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/services?storeId=${params.storeId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            return response.json();
          }
        } catch (fallbackError) {
          console.warn('Fallback services API also failed:', fallbackError);
        }
      }

      return { services: [] };
    }
  }
};

// Enhanced Service Card Component
const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Service Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback gradient background */}
        <div className={`absolute inset-0 flex items-center justify-center ${service.image_url ? 'hidden' : 'flex'}`}>
          <div className="text-center text-white">
            <Camera className="w-12 h-12 mx-auto mb-2 opacity-80" />
            <div className="text-lg font-semibold opacity-90">{service.name}</div>
          </div>
        </div>

        {/* Service Type Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${service.type === 'fixed'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
            }`}>
            {service.type === 'fixed' ? 'Fixed Price' : 'Dynamic Price'}
          </span>
        </div>
      </div>

      {/* Service Content */}
      <div className="p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
          {service.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description || 'No description available'}
        </p>

        {service.type === 'fixed' && (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center text-green-600 font-semibold">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>KES {service.price}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">{service.duration} mins</span>
            </div>
          </div>
        )}

        {service.category && (
          <div className="mb-4">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
              {service.category}
            </span>
          </div>
        )}

        <button
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          onClick={() => navigate(`/service/${service.id}`)}
        >
          <Calendar className="w-4 h-4" />
          Book Service
        </button>
      </div>
    </div>
  );
};

// Main StoreServices Component
const StoreServices = ({ storeId, isActive = false }) => {
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Fetch services for the store
  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await serviceAPI.getServices({ storeId });
      setServices(response.services || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  // Fetch services when component mounts or when storeId changes
  useEffect(() => {
    if (storeId) {
      fetchServices();
    }
  }, [storeId]);

  // Auto-refresh when section becomes active (if not already loaded)
  useEffect(() => {
    if (isActive && storeId && services.length === 0 && !servicesLoading) {
      fetchServices();
    }
  }, [isActive, storeId, services.length, servicesLoading]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
        {services.length > 0 && (
          <span className="text-sm text-gray-500">
            {services.length} {services.length === 1 ? 'service' : 'services'} available
          </span>
        )}
      </div>

      {servicesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading services...</span>
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No services available</h3>
          <p className="text-gray-600">Services will be listed here when available.</p>
        </div>
      )}
    </div>
  );
};

export default StoreServices;