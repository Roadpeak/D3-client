import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Clock, Calendar, Camera } from 'lucide-react';

const ServiceCard = ({ service, storeId }) => {
  const navigate = useNavigate();

  const handleBookService = () => {
    // Use nested route if storeId is provided, otherwise use legacy route
    if (storeId) {
      navigate(`/store/${storeId}/service/${service.id}`); // Changed from /services/ to /service/
    } else {
      navigate(`/service/${service.id}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 group">
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
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            service.type === 'fixed'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
          }`}>
            {service.type === 'fixed' ? 'Fixed Price' : 'Dynamic Price'}
          </span>
        </div>
      </div>

      {/* Service Content */}
      <div className="p-6">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2 line-clamp-1">
          {service.name}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {service.description || 'No description available'}
        </p>

        {service.type === 'fixed' && (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>KES {service.price}</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">{service.duration} mins</span>
            </div>
          </div>
        )}

        {service.category && (
          <div className="mb-4">
            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {service.category}
            </span>
          </div>
        )}

        <button
          className="w-full bg-blue-500 dark:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          onClick={handleBookService}
        >
          <Calendar className="w-4 h-4" />
          Book Service
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;