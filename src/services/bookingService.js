// services/bookingService.js - FINAL FIXED VERSION
// Simple, working booking service without complex imports

class BookingService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    this.apiVersion = '/api/v1';
    
    console.log('🎯 BookingService initialized');
    console.log('🔗 Base URL:', this.baseURL);
    console.log('🔗 API Version:', this.apiVersion);
  }

  // Get auth headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Get auth token from multiple possible locations
    const token = localStorage.getItem('authToken') || 
                  localStorage.getItem('access_token') ||
                  localStorage.getItem('token') ||
                  this.getTokenFromCookie();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add API key if available
    const apiKey = process.env.REACT_APP_API_KEY;
    if (apiKey) {
      headers['api-key'] = apiKey;
    }

    return headers;
  }

  // Get token from cookie
  getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('access_token=') ||
      cookie.trim().startsWith('authToken=')
    );
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }

  // Make API request
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${this.apiVersion}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      ...options
    };

    console.log(`🔄 ${config.method} ${url}`);

    try {
      const response = await fetch(url, config);
      
      console.log(`📡 Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }

        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Success:', data);
      return data;

    } catch (error) {
      console.error('💥 Request failed:', error);
      throw error;
    }
  }

  // Get available time slots for an offer
  async getAvailableSlots(offerId, date) {
    try {
      console.log('🔍 Getting available slots for offer:', offerId, 'on date:', date);
      
      // Validate inputs
      if (!offerId || !date) {
        throw new Error('Offer ID and date are required');
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }

      // Make the API call
      const queryParams = new URLSearchParams({ offerId, date });
      const response = await this.makeRequest(`/bookings/get-slots?${queryParams}`);
      
      return {
        success: true,
        availableSlots: response.availableSlots || [],
        storeInfo: response.storeInfo,
        offerInfo: response.offerInfo,
        message: response.message
      };
      
    } catch (error) {
      console.error('❌ Error getting available slots:', error);
      
      // Handle specific error cases
      let errorMessage;
      if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage = 'Booking service not available or offer not found';
      } else if (error.message.includes('400') || error.message.includes('Invalid')) {
        errorMessage = 'Invalid request data';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error while fetching slots. Please try again.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || 'Failed to fetch available slots';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Get stores for booking selection
  async getStoresForOffer(offerId) {
    try {
      console.log('🏪 Getting stores for offer:', offerId);
      
      // Try the dedicated booking stores endpoint first
      try {
        const response = await this.makeRequest(`/bookings/stores/${offerId}`);
        if (response.success) {
          return {
            success: true,
            stores: response.stores || []
          };
        }
      } catch (endpointError) {
        console.log('Dedicated stores endpoint not available, trying offer endpoint');
      }

      // Fallback: get offer details and extract store
      try {
        const response = await this.makeRequest(`/offers/${offerId}`);
        const offer = response.offer || response.data || response;
        
        // Try different possible store locations in the response
        let store = null;
        if (offer.service?.store) {
          store = offer.service.store;
        } else if (offer.store) {
          store = offer.store;
        } else if (offer.service?.Store) {
          store = offer.service.Store;
        }
        
        if (store) {
          return {
            success: true,
            stores: [store]
          };
        }
      } catch (offerError) {
        console.warn('Could not get offer details:', offerError.message);
      }
      
      // If no store found, return empty array but don't throw error
      console.warn('No store found for offer:', offerId);
      return {
        success: true,
        stores: [],
        message: 'No store information available for this offer'
      };
      
    } catch (error) {
      console.error('❌ Error getting stores for offer:', error);
      
      // Don't throw error for stores - return empty array
      return {
        success: true,
        stores: [],
        message: 'Unable to load store information'
      };
    }
  }

  // Get staff for booking selection
  async getStaffForStore(storeId) {
    try {
      console.log('👥 Getting staff for store:', storeId);
      
      const response = await this.makeRequest(`/bookings/staff/${storeId}`);
      
      return {
        success: true,
        staff: response.staff || response || []
      };
      
    } catch (error) {
      console.warn('❌ Error getting staff for store (non-critical):', error);
      
      // Return empty staff list if endpoint doesn't exist - this is not critical
      return {
        success: true,
        staff: [],
        message: 'Staff selection not available'
      };
    }
  }

  // Create a new booking with payment
  async createBooking(bookingData) {
    try {
      console.log('📝 Creating booking with data:', bookingData);
      
      // Validate required fields
      this.validateBookingData(bookingData);
      
      // Prepare booking payload
      const bookingPayload = {
        offerId: bookingData.offerId,
        userId: bookingData.userId,
        startTime: this.formatDateTime(bookingData.date, bookingData.time),
        storeId: bookingData.storeId,
        staffId: bookingData.staffId || null,
        notes: bookingData.notes || '',
        paymentData: {
          amount: bookingData.accessFee || 5.99,
          currency: 'KES',
          method: bookingData.paymentMethod || 'mpesa',
          phoneNumber: bookingData.clientPhone
        },
        clientInfo: {
          name: bookingData.clientName,
          email: bookingData.clientEmail,
          phone: bookingData.clientPhone
        }
      };
      
      console.log('📤 Sending booking payload:', bookingPayload);
      
      const response = await this.makeRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingPayload)
      });
      
      console.log('✅ Booking created successfully:', response);
      
      return {
        success: true,
        booking: response.booking,
        payment: response.payment,
        message: response.message || 'Booking created successfully'
      };
      
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      throw new Error(error.message || 'Failed to create booking');
    }
  }

  // Process M-Pesa payment
  async processMpesaPayment(phoneNumber, amount, bookingId) {
    try {
      console.log('💳 Processing M-Pesa payment:', { phoneNumber, amount, bookingId });
      
      if (!phoneNumber || phoneNumber.length < 10) {
        throw new Error('Valid phone number is required');
      }
      
      if (!amount || amount <= 0) {
        throw new Error('Valid amount is required');
      }
      
      const paymentData = {
        phoneNumber: this.formatPhoneNumber(phoneNumber),
        amount: parseFloat(amount),
        callbackMetadata: {
          bookingId: bookingId || 'temp-booking',
          type: 'offer_booking'
        }
      };

      const response = await this.makeRequest('/bookings/payment/mpesa', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });
      
      return {
        success: true,
        checkoutRequestId: response.checkoutRequestId,
        payment: response.payment,
        message: response.message || 'Payment request sent to your phone'
      };
      
    } catch (error) {
      console.error('❌ M-Pesa payment error:', error);
      throw new Error(error.message || 'Failed to process M-Pesa payment. Please try again.');
    }
  }

  // Get user's bookings
  async getUserBookings(userId, filters = {}) {
    try {
      const queryParams = new URLSearchParams({ userId, ...filters });
      const response = await this.makeRequest(`/bookings/user/my-bookings?${queryParams}`);
      
      return {
        success: true,
        bookings: response.bookings || response || []
      };
    } catch (error) {
      console.error('❌ Error getting user bookings:', error);
      throw new Error(error.message || 'Failed to fetch bookings');
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId, reason = '') {
    try {
      const response = await this.makeRequest(`/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason })
      });
      
      return {
        success: true,
        booking: response.booking,
        message: response.message || 'Booking cancelled successfully'
      };
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      throw new Error(error.message || 'Failed to cancel booking');
    }
  }

  // Utility methods
  validateBookingData(data) {
    const required = ['offerId', 'userId', 'date', 'time'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }
    
    // Validate time format
    const timeRegex = /^\d{1,2}:\d{2}\s?(AM|PM)$/i;
    if (!timeRegex.test(data.time)) {
      throw new Error('Time must be in format like "2:30 PM"');
    }
    
    // Validate date is in the future
    const bookingDateTime = new Date(`${data.date}T${this.convertTo24Hour(data.time)}`);
    if (bookingDateTime <= new Date()) {
      throw new Error('Booking date and time must be in the future');
    }
  }

  formatDateTime(date, time) {
    try {
      const time24 = this.convertTo24Hour(time);
      return `${date}T${time24}:00.000Z`;
    } catch (error) {
      throw new Error('Invalid date or time format');
    }
  }

  convertTo24Hour(time12h) {
    const [time, modifier] = time12h.toUpperCase().split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM' && hours !== '00') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Kenyan phone numbers
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      // Already in correct format
    } else if (cleaned.length === 9) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  // Health check method for debugging
  async healthCheck() {
    try {
      console.log('🏥 Booking service health check');
      const response = await this.makeRequest('/health');
      console.log('🏥 Health check result:', response);
      return response;
    } catch (error) {
      console.warn('⚠️ Health check failed:', error.message);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Debug method to test connectivity
  async debugConnectivity() {
    console.log('🐛 Running booking service connectivity debug...');
    console.log('🔗 Base URL:', this.baseURL);
    console.log('🔗 Full API URL:', `${this.baseURL}${this.apiVersion}`);
    
    try {
      // Test health endpoint
      await this.healthCheck();
      
      // Test with your actual offer ID
      const testOfferId = '85957bde-cd71-40ed-af3c-7483858d0f0c';
      const testDate = '2025-07-23';
      
      console.log('🧪 Testing slots endpoint with real data...');
      try {
        const slotsResult = await this.getAvailableSlots(testOfferId, testDate);
        console.log('🐛 Available slots endpoint: ACCESSIBLE ✅');
        console.log('🐛 Slots result:', slotsResult);
      } catch (error) {
        console.log('🐛 Available slots endpoint: ERROR ❌', error.message);
      }
      
      console.log('🧪 Testing stores endpoint...');
      try {
        const storesResult = await this.getStoresForOffer(testOfferId);
        console.log('🐛 Stores endpoint: ACCESSIBLE ✅');
        console.log('🐛 Stores result:', storesResult);
      } catch (error) {
        console.log('🐛 Stores endpoint: ERROR ❌', error.message);
      }
      
    } catch (error) {
      console.error('🐛 Debug connectivity failed:', error);
    }
  }

  // Manual test of the problematic endpoint
  async testSlotsEndpoint(offerId = '85957bde-cd71-40ed-af3c-7483858d0f0c', date = '2025-07-23') {
    console.log('🧪 Manual test of slots endpoint...');
    
    const fullUrl = `${this.baseURL}${this.apiVersion}/bookings/get-slots?offerId=${offerId}&date=${date}`;
    console.log('📍 Full URL:', fullUrl);
    
    try {
      const response = await this.getAvailableSlots(offerId, date);
      console.log('✅ Slots endpoint test SUCCESS:', response);
      return response;
    } catch (error) {
      console.error('❌ Slots endpoint test FAILED:', error.message);
      throw error;
    }
  }
}

// Create and export instance
const bookingService = new BookingService();

// Auto-run debug on initialization in development (with delay to avoid immediate errors)
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    console.log('🔧 Auto-running booking service debug...');
    bookingService.debugConnectivity().catch(error => {
      console.log('🔧 Debug failed (expected on first load):', error.message);
    });
  }, 3000); // 3 second delay
}

export default bookingService;