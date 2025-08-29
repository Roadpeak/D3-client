// services/enhancedBookingService.js - UPDATED with branch support

import axios from 'axios';
import { getTokenFromCookie } from '../config/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || '${process.env.REACT_APP_API_BASE_URL}/api/v1';

class EnhancedBookingService {
    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 15000
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
                    data: config.data
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
                
                if (error.response?.status === 401) {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // ==================== SLOT GENERATION (UNCHANGED) ====================

    async getAvailableSlotsForOffer(offerId, date) {
        try {
            console.log('📅 Getting unified slots for offer:', offerId, date);
            
            try {
                const response = await this.api.get('/bookings/slots/unified', {
                    params: { entityId: offerId, entityType: 'offer', date }
                });
                
                if (response.data.success) {
                    try {
                        const offerResponse = await this.api.get(`/offers/${offerId}`);
                        if (offerResponse.data.success && offerResponse.data.offer) {
                            const discount = parseFloat(offerResponse.data.offer.discount) || 20;
                            response.data.accessFee = (discount * 0.15).toFixed(2);
                        }
                    } catch {
                        response.data.accessFee = 5.99;
                    }
                    response.data.requiresPayment = true;
                    response.data.bookingType = 'offer';
                    
                    return response.data;
                } else {
                    throw new Error(response.data.message || 'No slots available');
                }
            } catch (error) {
                console.warn('⚠️ Unified endpoint failed:', error.response?.data?.message || error.message);
                
                if (error.response?.data?.message?.includes('closed') || 
                    error.response?.data?.message?.includes('not open')) {
                    
                    console.error('🐛 WORKING DAYS DEBUG:', {
                        errorMessage: error.response?.data?.message,
                        offerId,
                        date,
                        selectedDay: new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
                    });
                    
                    if (error.response?.data?.workingDays) {
                        console.error('🐛 Store working days from API:', error.response.data.workingDays);
                    }
                    
                    throw error;
                }
            }

            // Fallback to legacy endpoint
            try {
                const response = await this.api.get('/bookings/slots', {
                    params: { offerId, date, bookingType: 'offer' }
                });
                
                if (response.data.success || response.data.availableSlots) {
                    const result = {
                        success: true,
                        availableSlots: response.data.availableSlots || [],
                        detailedSlots: response.data.detailedSlots || [],
                        bookingRules: response.data.bookingRules || null,
                        storeInfo: response.data.storeInfo || null,
                        accessFee: response.data.accessFee || 5.99,
                        requiresPayment: true,
                        bookingType: 'offer'
                    };
                    
                    return result;
                } else {
                    throw new Error(response.data.message || 'No slots available from legacy endpoint');
                }
            } catch (legacyError) {
                console.warn('⚠️ Legacy endpoint also failed:', legacyError.response?.data?.message || legacyError.message);
                
                if (legacyError.response?.data?.message?.includes('closed') || 
                    legacyError.response?.data?.message?.includes('not open')) {
                    throw legacyError;
                }
            }

            throw new Error('Unable to fetch slots from API');
            
        } catch (error) {
            console.error('❌ Error fetching offer slots:', error);
            
            const errorMessage = error.response?.data?.message || error.message;
            if (errorMessage?.includes('closed') || 
                errorMessage?.includes('not open') ||
                errorMessage?.includes('working days') ||
                errorMessage?.includes('business hours')) {
                
                return {
                    success: false,
                    message: errorMessage,
                    availableSlots: [],
                    detailedSlots: [],
                    bookingRules: null,
                    storeInfo: null,
                    accessFee: 5.99,
                    requiresPayment: true,
                    bookingType: 'offer',
                    businessRuleViolation: true,
                    debugInfo: {
                        offerId,
                        date,
                        dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
                        errorSource: 'backend_validation'
                    }
                };
            }
            
            throw this.handleError(error);
        }
    }

    async getAvailableSlotsForService(serviceId, date) {
        try {
            console.log('📅 Getting unified slots for service:', serviceId, date);
            
            try {
                const response = await this.api.get('/bookings/slots/unified', {
                    params: { entityId: serviceId, entityType: 'service', date }
                });
                
                if (response.data.success) {
                    response.data.accessFee = 0;
                    response.data.requiresPayment = false;
                    response.data.bookingType = 'service';
                    return response.data;
                }
            } catch (error) {
                console.warn('⚠️ Unified endpoint failed, trying legacy method:', error);
            }

            const response = await this.api.get('/bookings/slots', {
                params: { serviceId, date, bookingType: 'service' }
            });
            
            if (response.data.success || response.data.availableSlots) {
                const result = {
                    success: true,
                    availableSlots: response.data.availableSlots || [],
                    detailedSlots: response.data.detailedSlots || [],
                    bookingRules: response.data.bookingRules || null,
                    storeInfo: response.data.storeInfo || null,
                    accessFee: 0,
                    requiresPayment: false,
                    bookingType: 'service'
                };
                
                return result;
            }
            
            throw new Error('No slots available');
            
        } catch (error) {
            console.error('❌ Error fetching service slots:', error);
            throw this.handleError(error);
        }
    }

    // ==================== BOOKING CREATION (UNCHANGED) ====================

    async createBooking(bookingData) {
        try {
            console.log('📝 Creating booking:', bookingData);
            
            const isOfferBooking = bookingData.offerId || bookingData.bookingType === 'offer';
            const isServiceBooking = bookingData.serviceId || bookingData.bookingType === 'service';
            
            if (!isOfferBooking && !isServiceBooking) {
                throw new Error('Booking must specify either offerId or serviceId');
            }
            
            const payload = {
                ...bookingData,
                bookingType: isOfferBooking ? 'offer' : 'service'
            };
            
            if (isServiceBooking) {
                console.log('🔧 Service booking - no payment required');
                delete payload.paymentData;
                payload.accessFee = 0;
            }
            
            const response = await this.api.post('/bookings', payload);
            
            console.log('✅ Booking created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating booking:', error);
            throw this.handleError(error);
        }
    }

    // ==================== BRANCHES AND STAFF MANAGEMENT (UPDATED) ====================

    /**
     * UPDATED: Get branch for offer (instead of stores)
     */
    async getBranchForOffer(offerId) {
        try {
            console.log('🏢 Getting branch for offer:', offerId);
            
            try {
                const response = await this.api.get(`/bookings/branches/offer/${offerId}`);
                return response.data;
            } catch (error) {
                console.warn('⚠️ Branch endpoint failed, trying fallback');
                
                // Fallback: get offer details and extract branch/store info
                const offerResponse = await this.api.get(`/offers/${offerId}`);
                if (offerResponse.data.success && offerResponse.data.offer) {
                    const offer = offerResponse.data.offer;
                    const branches = [];
                    
                    if (offer.service && offer.service.store) {
                        branches.push({
                            id: `store-${offer.service.store.id}`,
                            name: offer.service.store.name + ' (Main Branch)',
                            address: offer.service.store.location,
                            phone: offer.service.store.phone,
                            openingTime: offer.service.store.opening_time,
                            closingTime: offer.service.store.closing_time,
                            workingDays: offer.service.store.working_days,
                            isMainBranch: true
                        });
                    }
                    
                    return {
                        success: true,
                        branch: branches[0] || null,
                        branches: branches
                    };
                }
                
                throw new Error('No branch found for offer');
            }
        } catch (error) {
            console.error('❌ Error getting branch for offer:', error);
            return {
                success: true,
                branch: null,
                branches: []
            };
        }
    }

    /**
     * UPDATED: Get branch for service (instead of stores)
     */
    async getBranchForService(serviceId) {
        try {
            console.log('🏢 Getting branch for service:', serviceId);
            
            try {
                const response = await this.api.get(`/bookings/branches/service/${serviceId}`);
                return response.data;
            } catch (error) {
                console.warn('⚠️ Branch endpoint failed, trying fallback');
                
                const serviceResponse = await this.api.get(`/services/${serviceId}`);
                if (serviceResponse.data.success && serviceResponse.data.service) {
                    const service = serviceResponse.data.service;
                    
                    const branch = service.store ? {
                        id: `store-${service.store.id}`,
                        name: service.store.name + ' (Main Branch)',
                        address: service.store.location,
                        phone: service.store.phone,
                        openingTime: service.store.opening_time,
                        closingTime: service.store.closing_time,
                        workingDays: service.store.working_days,
                        isMainBranch: true
                    } : null;
                    
                    return {
                        success: true,
                        branch: branch,
                        branches: branch ? [branch] : []
                    };
                }
                
                throw new Error('No branch found for service');
            }
        } catch (error) {
            console.error('❌ Error getting branch for service:', error);
            return {
                success: true,
                branch: null,
                branches: []
            };
        }
    }

    /**
     * UPDATED: Get staff specifically for an offer (branch-based)
     */
    async getStaffForOffer(offerId) {
        try {
            console.log('👥 Fetching staff for offer:', offerId);
            
            const response = await this.api.get(`/bookings/staff/offer/${offerId}`);
            
            if (response.data.success) {
                console.log('✅ Offer staff fetched:', {
                    count: response.data.staff?.length || 0,
                    serviceId: response.data.serviceInfo?.id,
                    branchId: response.data.serviceInfo?.branchId
                });
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch offer staff');
            }
            
        } catch (error) {
            console.error('❌ Error getting staff for offer:', error);
            return {
                success: true,
                staff: [],
                message: 'Offer staff not available'
            };
        }
    }

    /**
     * UPDATED: Get staff specifically for a service (branch-based)
     */
    async getStaffForService(serviceId) {
        try {
            console.log('👥 Fetching staff for service:', serviceId);
            
            const response = await this.api.get(`/bookings/staff/service/${serviceId}`);
            
            if (response.data.success) {
                console.log('✅ Service staff fetched:', {
                    count: response.data.staff?.length || 0,
                    branchId: response.data.serviceInfo?.branchId
                });
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch service staff');
            }
            
        } catch (error) {
            console.error('❌ Error getting staff for service:', error);
            return {
                success: true,
                staff: [],
                message: 'Service staff not available'
            };
        }
    }

    // ==================== LEGACY COMPATIBILITY ====================

    /**
     * LEGACY: Get stores for offer (now redirects to branches)
     */
    async getStoresForOffer(offerId) {
        console.log('⚠️ Using legacy getStoresForOffer, redirecting to branches...');
        const branchResult = await this.getBranchForOffer(offerId);
        
        // Convert branch to store format for compatibility
        return {
            success: true,
            stores: branchResult.branch ? [{
                id: branchResult.branch.id,
                name: branchResult.branch.name,
                location: branchResult.branch.address,
                address: branchResult.branch.address,
                phone: branchResult.branch.phone,
                opening_time: branchResult.branch.openingTime,
                closing_time: branchResult.branch.closingTime,
                working_days: branchResult.branch.workingDays
            }] : []
        };
    }

    /**
     * LEGACY: Get stores for service (now redirects to branches)
     */
    async getStoresForService(serviceId) {
        console.log('⚠️ Using legacy getStoresForService, redirecting to branches...');
        const branchResult = await this.getBranchForService(serviceId);
        
        return {
            success: true,
            stores: branchResult.branch ? [{
                id: branchResult.branch.id,
                name: branchResult.branch.name,
                location: branchResult.branch.address,
                address: branchResult.branch.address,
                phone: branchResult.branch.phone,
                opening_time: branchResult.branch.openingTime,
                closing_time: branchResult.branch.closingTime,
                working_days: branchResult.branch.workingDays
            }] : []
        };
    }

    // ==================== OTHER METHODS (UNCHANGED) ====================

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
            const response = await this.api.get(`/bookings/${bookingId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
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

    calculateAccessFee(discount) {
        return (parseFloat(discount) * 0.15).toFixed(2);
    }

    handleError(error) {
        console.error('🚨 Booking service error:', error);
        
        if (error.response) {
            const message = error.response.data?.message || error.response.data?.error || 'Server error occurred';
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