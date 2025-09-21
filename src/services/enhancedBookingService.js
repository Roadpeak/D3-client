// services/enhancedBookingService.js - Updated with improved error handling and branch support

import axios from 'axios';
import { getTokenFromCookie } from '../config/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

class EnhancedBookingService {
    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 20000 // Increased timeout for better reliability
        });

        // Add auth token to requests
        this.api.interceptors.request.use((config) => {
            const token = getTokenFromCookie();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            if (process.env.NODE_ENV === 'development') {
                console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, {
                    params: config.params,
                    data: config.data ? { ...config.data, paymentData: config.data.paymentData ? '[REDACTED]' : undefined } : undefined
                });
            }

            return config;
        });

        this.api.interceptors.response.use(
            (response) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
                }
                return response;
            },
            (error) => {
                if (process.env.NODE_ENV === 'development') {
                    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        message: error.message
                    });
                }

                // Handle authentication errors
                if (error.response?.status === 401) {
                    const currentPath = window.location.pathname;
                    if (!currentPath.includes('/login')) {
                        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // ==================== ENHANCED SLOT GENERATION ====================

    async getAvailableSlotsForOffer(offerId, date) {
        try {
            console.log('📅 Getting slots for offer:', { offerId, date });

            if (!offerId || !date) {
                throw new Error('Offer ID and date are required');
            }

            // Validate date format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                throw new Error('Date must be in YYYY-MM-DD format');
            }

            let response;
            let lastError;

            // Try the dedicated offer slots endpoint first
            try {
                response = await this.api.get('/bookings/offer-slots', {
                    params: { offerId, date },
                    timeout: 15000
                });

                if (response.data && (response.data.success || response.data.availableSlots)) {
                    return this.normalizeSlotResponse(response.data, 'offer', offerId);
                }
            } catch (error) {
                console.warn('⚠️ Dedicated offer slots endpoint failed:', error.response?.data?.message || error.message);
                lastError = error;
            }

            // Fallback to unified slots endpoint
            try {
                response = await this.api.get('/bookings/slots/unified', {
                    params: { entityId: offerId, entityType: 'offer', date },
                    timeout: 15000
                });

                if (response.data && response.data.success) {
                    return this.normalizeSlotResponse(response.data, 'offer', offerId);
                }
            } catch (error) {
                console.warn('⚠️ Unified slots endpoint failed:', error.response?.data?.message || error.message);
                lastError = error;
            }

            // Final fallback to legacy endpoint
            try {
                response = await this.api.get('/bookings/slots', {
                    params: { offerId, date, bookingType: 'offer' },
                    timeout: 15000
                });

                if (response.data) {
                    return this.normalizeSlotResponse(response.data, 'offer', offerId);
                }
            } catch (error) {
                console.warn('⚠️ Legacy slots endpoint failed:', error.response?.data?.message || error.message);
                lastError = error;
            }

            // If all endpoints failed, check if it's a business rule violation
            if (lastError?.response?.data?.message) {
                const message = lastError.response.data.message;
                if (this.isBusinessRuleViolation(message)) {
                    return {
                        success: false,
                        message: message,
                        availableSlots: [],
                        detailedSlots: [],
                        businessRuleViolation: true,
                        bookingType: 'offer',
                        storeInfo: lastError.response.data.storeInfo,
                        branchInfo: lastError.response.data.branchInfo
                    };
                }
            }

            throw lastError || new Error('Unable to fetch offer slots');

        } catch (error) {
            console.error('❌ Error fetching offer slots:', error);
            return this.handleSlotError(error, 'offer');
        }
    }

    async getAvailableSlotsForService(serviceId, date) {
        try {
            console.log('📅 Getting slots for service:', { serviceId, date });

            if (!serviceId || !date) {
                throw new Error('Service ID and date are required');
            }

            // Validate date format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                throw new Error('Date must be in YYYY-MM-DD format');
            }

            let response;
            let lastError;

            // Try the dedicated service slots endpoint first
            try {
                response = await this.api.get('/bookings/service-slots', {
                    params: { serviceId, date },
                    timeout: 15000
                });

                if (response.data && (response.data.success || response.data.availableSlots)) {
                    return this.normalizeSlotResponse(response.data, 'service', serviceId);
                }
            } catch (error) {
                console.warn('⚠️ Dedicated service slots endpoint failed:', error.response?.data?.message || error.message);
                lastError = error;
            }

            // Fallback to unified slots endpoint
            try {
                response = await this.api.get('/bookings/slots/unified', {
                    params: { entityId: serviceId, entityType: 'service', date },
                    timeout: 15000
                });

                if (response.data && response.data.success) {
                    return this.normalizeSlotResponse(response.data, 'service', serviceId);
                }
            } catch (error) {
                console.warn('⚠️ Unified slots endpoint failed:', error.response?.data?.message || error.message);
                lastError = error;
            }

            // Final fallback to legacy endpoint
            try {
                response = await this.api.get('/bookings/slots', {
                    params: { serviceId, date, bookingType: 'service' },
                    timeout: 15000
                });

                if (response.data) {
                    return this.normalizeSlotResponse(response.data, 'service', serviceId);
                }
            } catch (error) {
                console.warn('⚠️ Legacy slots endpoint failed:', error.response?.data?.message || error.message);
                lastError = error;
            }

            // Handle business rule violations
            if (lastError?.response?.data?.message && this.isBusinessRuleViolation(lastError.response.data.message)) {
                return {
                    success: false,
                    message: lastError.response.data.message,
                    availableSlots: [],
                    detailedSlots: [],
                    businessRuleViolation: true,
                    bookingType: 'service',
                    storeInfo: lastError.response.data.storeInfo,
                    branchInfo: lastError.response.data.branchInfo
                };
            }

            throw lastError || new Error('Unable to fetch service slots');

        } catch (error) {
            console.error('❌ Error fetching service slots:', error);
            return this.handleSlotError(error, 'service');
        }
    }

    // Helper method to normalize slot responses
    normalizeSlotResponse(data, bookingType, entityId) {
        const result = {
            success: true,
            availableSlots: data.availableSlots || [],
            detailedSlots: data.detailedSlots || [],
            bookingRules: data.bookingRules || null,
            storeInfo: data.storeInfo || null,
            branchInfo: data.branchInfo || null,
            bookingType: bookingType
        };

        // Set payment requirements based on booking type
        if (bookingType === 'offer') {
            result.accessFee = data.accessFee || this.calculateDefaultAccessFee(data.discount);
            result.requiresPayment = true;
        } else {
            result.accessFee = 0;
            result.requiresPayment = false;
        }

        console.log(`✅ Normalized ${bookingType} slots:`, {
            slotsCount: result.availableSlots.length,
            detailedCount: result.detailedSlots.length,
            accessFee: result.accessFee
        });

        return result;
    }

    // Helper to identify business rule violations
    isBusinessRuleViolation(message) {
        const violations = [
            'closed', 'not open', 'working days', 'business hours',
            'outside operating hours', 'branch not operational',
            'service not available on this day'
        ];
        return violations.some(violation => message.toLowerCase().includes(violation));
    }

    // Enhanced slot error handling
    handleSlotError(error, bookingType) {
        const message = error.response?.data?.message || error.message;
        
        if (this.isBusinessRuleViolation(message)) {
            return {
                success: false,
                message: message,
                availableSlots: [],
                detailedSlots: [],
                businessRuleViolation: true,
                bookingType: bookingType,
                storeInfo: error.response?.data?.storeInfo,
                branchInfo: error.response?.data?.branchInfo
            };
        }

        throw this.handleError(error);
    }

    // ==================== ENHANCED BOOKING CREATION ====================

    async createBooking(bookingData) {
        try {
            console.log('📝 Creating booking with data:', {
                ...bookingData,
                paymentData: bookingData.paymentData ? '[REDACTED]' : undefined
            });

            // Validate required fields
            this.validateBookingData(bookingData);

            const isOfferBooking = bookingData.offerId || bookingData.bookingType === 'offer';
            const isServiceBooking = bookingData.serviceId || bookingData.bookingType === 'service';

            if (!isOfferBooking && !isServiceBooking) {
                throw new Error('Booking must specify either offerId or serviceId');
            }

            // Prepare payload with proper booking type
            const payload = {
                ...bookingData,
                bookingType: isOfferBooking ? 'offer' : 'service'
            };

            // Handle service bookings (no payment required)
            if (isServiceBooking) {
                console.log('🔧 Service booking - removing payment data');
                delete payload.paymentData;
                payload.accessFee = 0;
            }

            // Validate datetime format
            if (payload.startTime) {
                payload.startTime = this.validateAndNormalizeDateTime(payload.startTime);
            }

            let response;
            
            // Try dedicated booking endpoint first
            try {
                if (isOfferBooking) {
                    response = await this.api.post('/bookings/offers', payload);
                } else {
                    response = await this.api.post('/bookings/service', payload);
                }
            } catch (error) {
                console.warn('⚠️ Dedicated booking endpoint failed, trying general endpoint:', error.response?.data?.message || error.message);
                
                // Fallback to general booking endpoint
                response = await this.api.post('/bookings', payload);
            }

            if (response.data && response.data.success) {
                console.log('✅ Booking created successfully:', response.data.booking?.id);
                return response.data;
            } else {
                throw new Error(response.data?.message || 'Booking creation failed');
            }

        } catch (error) {
            console.error('❌ Error creating booking:', error);
            throw this.handleError(error);
        }
    }

    // Enhanced datetime validation
    validateAndNormalizeDateTime(dateTime) {
        if (!dateTime) {
          throw new Error('Start time is required');
        }
      
        // If it's already a properly formatted ISO string, validate and return as-is
        if (typeof dateTime === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateTime)) {
          const date = new Date(dateTime);
          if (!isNaN(date.getTime())) {
            return dateTime; // Return the original string if it's valid
          }
        }
      
        // Try to parse and normalize
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid datetime format: ${dateTime}`);
        }
      
        // Return ISO string format
        return date.toISOString().slice(0, 19); // Remove milliseconds and Z
      }

    // Validate booking data before submission
    validateBookingData(data) {
        const required = ['userId', 'startTime'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        // Validate entity IDs
        if (!data.offerId && !data.serviceId) {
            throw new Error('Either offerId or serviceId is required');
        }

        // Validate location data
        if (!data.storeId && !data.branchId) {
            console.warn('⚠️ No location data provided - booking may fail');
        }
    }

    // ==================== ENHANCED BRANCH AND STAFF MANAGEMENT ====================

    // Enhanced getBranchForOffer method with better error handling and fallbacks

async getBranchForOffer(offerId) {
    try {
      console.log('🏢 Getting branch for offer:', offerId);
  
      if (!offerId) {
        throw new Error('Offer ID is required');
      }
  
      let response;
      let lastError;
  
      // Try the dedicated branch endpoint first
      try {
        response = await this.api.get(`/bookings/offers/${offerId}/branch`);
        if (response.data && response.data.success && response.data.branch) {
          console.log('✅ Got branch from dedicated endpoint:', response.data.branch.name);
          return response.data;
        }
      } catch (error) {
        console.warn('⚠️ Dedicated branch endpoint failed:', error.response?.data?.message || error.message);
        lastError = error;
      }
  
      // Fallback to legacy endpoint
      try {
        response = await this.api.get(`/bookings/branches/offer/${offerId}`);
        if (response.data && response.data.branch) {
          console.log('✅ Got branch from legacy endpoint:', response.data.branch.name);
          return response.data;
        }
      } catch (error) {
        console.warn('⚠️ Legacy branch endpoint failed:', error.response?.data?.message || error.message);
        lastError = error;
      }
  
      // Final fallback: extract from offer details
      try {
        console.log('🔄 Trying to get branch from offer details...');
        const offerResponse = await this.api.get(`/offers/${offerId}`);
        
        if (offerResponse.data && (offerResponse.data.success || offerResponse.data.offer)) {
          const offer = offerResponse.data.offer || offerResponse.data;
          console.log('📄 Offer data received:', {
            hasService: !!offer.service,
            hasStore: !!offer.service?.store,
            storeId: offer.service?.store?.id,
            storeName: offer.service?.store?.name
          });
          
          if (offer.service?.store) {
            const extractedBranch = this.extractBranchFromEntity(offer, 'offer');
            console.log('✅ Extracted branch from offer details:', extractedBranch.branch?.name);
            return extractedBranch;
          }
        }
      } catch (error) {
        console.warn('⚠️ Offer details fallback failed:', error.response?.data?.message || error.message);
        lastError = error;
      }
  
      // If we still don't have a branch, try to get it from the slots endpoint
      // as the slot generation often returns store info
      try {
        console.log('🔄 Trying to get store info from slots endpoint...');
        const today = new Date().toISOString().split('T')[0];
        const slotsResponse = await this.api.get('/bookings/slots', {
          params: { 
            offerId: offerId, 
            date: today, 
            bookingType: 'offer' 
          }
        });
        
        if (slotsResponse.data && (slotsResponse.data.storeInfo || slotsResponse.data.branchInfo)) {
          const storeInfo = slotsResponse.data.storeInfo || slotsResponse.data.branchInfo;
          const branch = {
            id: `store-${storeInfo.id || 'unknown'}`,
            name: storeInfo.name + ' (Main Branch)',
            address: storeInfo.location || storeInfo.address,
            phone: storeInfo.phone_number || storeInfo.phone,
            openingTime: storeInfo.opening_time || storeInfo.openingTime,
            closingTime: storeInfo.closing_time || storeInfo.closingTime,
            workingDays: storeInfo.working_days || storeInfo.workingDays,
            isMainBranch: true,
            storeId: storeInfo.id
          };
          
          console.log('✅ Got branch from slots endpoint store info:', branch.name);
          return {
            success: true,
            branch: branch,
            branches: [branch],
            source: 'slots_endpoint'
          };
        }
      } catch (error) {
        console.warn('⚠️ Slots endpoint fallback failed:', error.response?.data?.message || error.message);
        lastError = error;
      }
  
      // Return empty result if all methods fail, but don't throw error
      console.warn('⚠️ All branch retrieval methods failed for offer:', offerId);
      return {
        success: false,
        branch: null,
        branches: [],
        message: 'Branch information not available for this offer',
        error: lastError?.response?.data?.message || lastError?.message || 'Unknown error'
      };
  
    } catch (error) {
      console.error('❌ Error getting branch for offer:', error);
      return {
        success: false,
        branch: null,
        branches: [],
        message: error.message || 'Failed to fetch branch information',
        error: error.message
      };
    }
  }
  
  // Enhanced extractBranchFromEntity method
  extractBranchFromEntity(entity, entityType) {
    try {
      console.log('🔧 Extracting branch from entity:', entityType, {
        hasService: !!entity.service,
        hasStore: !!entity.service?.store || !!entity.store,
        directStore: !!entity.store
      });
      
      let service, store;
      
      if (entityType === 'offer') {
        service = entity.service;
        store = service?.store;
      } else {
        service = entity;
        store = entity.store;
      }
      
      if (!store) {
        console.warn('⚠️ No store found in entity');
        return {
          success: false,
          branch: null,
          branches: [],
          message: 'Store information not available'
        };
      }
  
      // Handle working days - ensure it's always an array
      let workingDays = store.working_days;
      if (typeof workingDays === 'string') {
        try {
          workingDays = JSON.parse(workingDays);
        } catch (e) {
          workingDays = workingDays.split(',').map(day => day.trim());
        }
      }
      if (!Array.isArray(workingDays)) {
        workingDays = [];
      }
  
      const branch = {
        id: `store-${store.id}`,
        name: store.name + ' (Main Branch)',
        address: store.location,
        location: store.location, // For compatibility
        phone: store.phone_number,
        openingTime: store.opening_time,
        closingTime: store.closing_time,
        workingDays: workingDays,
        isMainBranch: true,
        storeId: store.id
      };
  
      console.log('✅ Branch extracted successfully:', {
        name: branch.name,
        workingDays: branch.workingDays,
        hasOpeningTime: !!branch.openingTime
      });
  
      return {
        success: true,
        branch: branch,
        branches: [branch],
        source: 'entity_extraction'
      };
    } catch (error) {
      console.error('❌ Error extracting branch from entity:', error);
      return {
        success: false,
        branch: null,
        branches: [],
        message: 'Failed to extract branch information'
      };
    }
  }

    // Helper to extract branch from entity data
    extractBranchFromEntity(entity, entityType) {
        const service = entityType === 'offer' ? entity.service : entity;
        
        if (!service?.store) {
            return {
                success: true,
                branch: null,
                branches: []
            };
        }

        const branch = {
            id: `store-${service.store.id}`,
            name: service.store.name + ' (Main Branch)',
            address: service.store.location,
            location: service.store.location, // For compatibility
            phone: service.store.phone_number,
            openingTime: service.store.opening_time,
            closingTime: service.store.closing_time,
            workingDays: Array.isArray(service.store.working_days) 
                ? service.store.working_days 
                : (service.store.working_days ? [service.store.working_days] : []),
            isMainBranch: true,
            storeId: service.store.id
        };

        return {
            success: true,
            branch: branch,
            branches: [branch]
        };
    }

    async getStaffForOffer(offerId) {
        try {
            console.log('👥 Fetching staff for offer:', offerId);

            if (!offerId) {
                throw new Error('Offer ID is required');
            }

            let response;

            // Try dedicated staff endpoint
            try {
                response = await this.api.get(`/bookings/offers/${offerId}/staff`);
                if (response.data && response.data.success) {
                    return response.data;
                }
            } catch (error) {
                console.warn('⚠️ Dedicated staff endpoint failed:', error.response?.data?.message || error.message);
            }

            // Fallback to legacy endpoint
            try {
                response = await this.api.get(`/bookings/staff/offer/${offerId}`);
                if (response.data) {
                    return response.data;
                }
            } catch (error) {
                console.warn('⚠️ Legacy staff endpoint failed:', error.response?.data?.message || error.message);
            }

            return {
                success: true,
                staff: [],
                message: 'Staff information not available for this offer'
            };

        } catch (error) {
            console.error('❌ Error getting staff for offer:', error);
            return {
                success: false,
                staff: [],
                message: error.message || 'Failed to fetch staff information'
            };
        }
    }

    async getStaffForService(serviceId) {
        try {
            console.log('👥 Fetching staff for service:', serviceId);

            if (!serviceId) {
                throw new Error('Service ID is required');
            }

            let response;

            // Try dedicated staff endpoint
            try {
                response = await this.api.get(`/bookings/services/${serviceId}/staff`);
                if (response.data && response.data.success) {
                    return response.data;
                }
            } catch (error) {
                console.warn('⚠️ Dedicated staff endpoint failed:', error.response?.data?.message || error.message);
            }

            // Fallback to legacy endpoint
            try {
                response = await this.api.get(`/bookings/staff/service/${serviceId}`);
                if (response.data) {
                    return response.data;
                }
            } catch (error) {
                console.warn('⚠️ Legacy staff endpoint failed:', error.response?.data?.message || error.message);
            }

            return {
                success: true,
                staff: [],
                message: 'Staff information not available for this service'
            };

        } catch (error) {
            console.error('❌ Error getting staff for service:', error);
            return {
                success: false,
                staff: [],
                message: error.message || 'Failed to fetch staff information'
            };
        }
    }

    // ==================== LEGACY COMPATIBILITY ====================

    async getStoresForOffer(offerId) {
        console.log('⚠️ Using deprecated getStoresForOffer, redirecting to getBranchForOffer...');
        const branchResult = await this.getBranchForOffer(offerId);

        return {
            success: true,
            stores: branchResult.branch ? [this.branchToStoreFormat(branchResult.branch)] : [],
            message: branchResult.message
        };
    }

    async getStoresForService(serviceId) {
        console.log('⚠️ Using deprecated getStoresForService, redirecting to getBranchForService...');
        const branchResult = await this.getBranchForService(serviceId);

        return {
            success: true,
            stores: branchResult.branch ? [this.branchToStoreFormat(branchResult.branch)] : [],
            message: branchResult.message
        };
    }

    // Convert branch format to legacy store format
    branchToStoreFormat(branch) {
        return {
            id: branch.id,
            name: branch.name,
            location: branch.address || branch.location,
            address: branch.address || branch.location,
            phone: branch.phone,
            phone_number: branch.phone,
            opening_time: branch.openingTime,
            closing_time: branch.closingTime,
            working_days: branch.workingDays
        };
    }

    // ==================== UTILITY METHODS ====================

    calculateDefaultAccessFee(discount) {
        if (!discount) return 5.99;
        return (parseFloat(discount) * 0.15).toFixed(2);
    }

    calculateAccessFee(discount) {
        return this.calculateDefaultAccessFee(discount);
    }

    // ==================== UNCHANGED METHODS ====================

    async getUserBookings(params = {}) {
        try {
            const response = await this.api.get('/bookings/user', { params });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getBookingById(bookingId) {
        try {
            console.log('📖 Fetching booking details for:', bookingId);
            
            if (!bookingId) {
                throw new Error('Booking ID is required');
            }
    
            // Validate booking ID format (assuming UUID format)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(bookingId)) {
                throw new Error('Invalid booking ID format');
            }
    
            let response;
            let lastError;
    
            // Try the primary endpoint
            try {
                response = await this.api.get(`/bookings/${bookingId}`, {
                    timeout: 15000
                });
    
                if (response.data && (response.data.success || response.data.booking)) {
                    console.log('✅ Booking details fetched successfully');
                    return {
                        success: true,
                        booking: response.data.booking || response.data,
                        message: 'Booking details retrieved successfully'
                    };
                }
            } catch (error) {
                console.warn('⚠️ Primary booking endpoint failed:', error.response?.data?.message || error.message);
                lastError = error;
    
                // If it's a 404, the booking doesn't exist
                if (error.response?.status === 404) {
                    return {
                        success: false,
                        booking: null,
                        message: 'Booking not found. It may have been deleted or you may not have permission to view it.',
                        notFound: true
                    };
                }
    
                // If it's a 500 error, try alternative approach
                if (error.response?.status === 500) {
                    console.log('🔄 Server error detected, trying alternative approach...');
                    
                    // Try to get booking from user's booking list
                    try {
                        const userBookingsResponse = await this.api.get('/bookings/user', {
                            params: { 
                                limit: 100,
                                bookingId: bookingId // Some APIs support filtering by booking ID
                            },
                            timeout: 10000
                        });
    
                        if (userBookingsResponse.data?.bookings) {
                            const foundBooking = userBookingsResponse.data.bookings.find(
                                booking => booking.id === bookingId
                            );
    
                            if (foundBooking) {
                                console.log('✅ Found booking in user bookings list');
                                return {
                                    success: true,
                                    booking: foundBooking,
                                    message: 'Booking details retrieved successfully',
                                    source: 'user_bookings_fallback'
                                };
                            }
                        }
                    } catch (fallbackError) {
                        console.warn('⚠️ Fallback to user bookings also failed:', fallbackError.message);
                    }
                }
            }
    
            // If we reach here, all attempts failed
            throw lastError || new Error('Unable to fetch booking details');
    
        } catch (error) {
            console.error('❌ Error fetching booking details:', error);
            
            // Return structured error response instead of throwing
            return {
                success: false,
                booking: null,
                message: this.getBookingErrorMessage(error),
                error: error.message,
                statusCode: error.response?.status
            };
        }
    }
    
    // Add this helper method to provide better error messages
    getBookingErrorMessage(error) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            switch (status) {
                case 400:
                    return 'Invalid booking request. Please check the booking ID and try again.';
                case 401:
                    return 'You need to be logged in to view this booking.';
                case 403:
                    return 'You do not have permission to view this booking.';
                case 404:
                    return 'Booking not found. It may have been cancelled or deleted.';
                case 429:
                    return 'Too many requests. Please wait a moment and try again.';
                case 500:
                    return 'Server error occurred while retrieving booking details. Please try again in a few moments.';
                case 502:
                case 503:
                case 504:
                    return 'Service temporarily unavailable. Please try again later.';
                default:
                    return data?.message || 'An unexpected error occurred while retrieving booking details.';
            }
        } else if (error.request) {
            return 'Network error. Please check your connection and try again.';
        } else {
            return error.message || 'An unexpected error occurred.';
        }
    }
    
    // Enhanced method for fetching user bookings with better error handling
    async getUserBookings(params = {}) {
        try {
            console.log('📋 Fetching user bookings with params:', params);
            
            const response = await this.api.get('/bookings/user', { 
                params,
                timeout: 20000 
            });
            
            if (response.data) {
                // Handle different response formats
                if (response.data.success !== undefined) {
                    return response.data;
                } else if (response.data.bookings) {
                    return {
                        success: true,
                        bookings: response.data.bookings,
                        pagination: response.data.pagination,
                        summary: response.data.summary
                    };
                } else if (Array.isArray(response.data)) {
                    return {
                        success: true,
                        bookings: response.data,
                        pagination: { total: response.data.length, totalPages: 1 }
                    };
                }
            }
            
            return {
                success: true,
                bookings: [],
                pagination: { total: 0, totalPages: 0 },
                message: 'No bookings found'
            };
            
        } catch (error) {
            console.error('❌ Error fetching user bookings:', error);
            
            return {
                success: false,
                bookings: [],
                pagination: { total: 0, totalPages: 0 },
                message: this.getBookingErrorMessage(error),
                error: error.message
            };
        }
    }
    
    // Add retry mechanism for critical operations
    async retryOperation(operation, maxRetries = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
                const result = await operation();
                return result;
            } catch (error) {
                console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // Don't retry client errors (4xx) except 429
                if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
                    throw error;
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }

    async cancelBooking(bookingId, reason = '', refundRequested = false) {
        try {
            console.log('❌ Cancelling booking:', bookingId, 'Reason:', reason);

            const response = await this.api.put(`/bookings/${bookingId}/cancel`, {
                reason,
                refundRequested
            });

            console.log('✅ Booking cancelled successfully');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateBookingStatus(bookingId, status) {
        try {
            const response = await this.api.put(`/bookings/${bookingId}/status`, { status });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async processMpesaPayment(phoneNumber, amount, bookingId) {
        try {
            console.log('💳 Processing M-Pesa payment:', { phoneNumber, amount, bookingId });

            const response = await this.api.post('/payments/mpesa', {
                phoneNumber,
                amount: parseFloat(amount),
                bookingId,
                type: 'booking_access_fee'
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async checkPaymentStatus(paymentId) {
        try {
            const response = await this.api.get(`/payments/${paymentId}/status`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Enhanced error handling
    handleError(error) {
        console.error('🚨 Booking service error:', error);

        if (error.response) {
            const data = error.response.data;
            let message = data?.message || data?.error || 'Server error occurred';
            
            // Handle specific error cases
            switch (error.response.status) {
                case 400:
                    if (message.includes('datetime') || message.includes('time format')) {
                        message = 'Invalid time format. Please try selecting a different time slot.';
                    } else if (message.includes('not found')) {
                        message = 'The selected item is no longer available.';
                    }
                    break;
                case 401:
                    message = 'Authentication required. Please log in again.';
                    break;
                case 403:
                    message = 'You do not have permission to perform this action.';
                    break;
                case 404:
                    message = 'The requested resource was not found.';
                    break;
                case 409:
                    message = 'This time slot is no longer available. Please select a different time.';
                    break;
                case 429:
                    message = 'Too many requests. Please wait a moment and try again.';
                    break;
                default:
                    if (error.response.status >= 500) {
                        message = 'Server error occurred. Please try again in a few moments.';
                    }
            }
            
            const newError = new Error(message);
            newError.status = error.response.status;
            newError.response = error.response;
            return newError;
        } else if (error.request) {
            return new Error('Network error. Please check your connection and try again.');
        } else {
            return error;
        }
    }

    async debugOfferWorkingDays(offerId) {
        try {
            const response = await this.api.get(`/bookings/debug/working-days?entityId=${offerId}&entityType=offer`);
            return response.data;
        } catch (error) {
            console.error('🐛 Debug failed:', error);
            return { debug: 'Failed', error: error.message };
        }
    }
}

const enhancedBookingService = new EnhancedBookingService();

export default enhancedBookingService;

export const {
    getAvailableSlots,
    getAvailableSlotsForOffer,
    getAvailableSlotsForService,
    createBooking,
    getBranchForOffer,
    getBranchForService,
    getStoresForOffer, // Legacy compatibility
    getStoresForService, // Legacy compatibility
    getStaffForOffer,
    getStaffForService,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    processMpesaPayment,
    checkPaymentStatus,
    calculateAccessFee,
    handleError,
    debugOfferWorkingDays
} = enhancedBookingService;