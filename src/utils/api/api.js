import axios from 'axios';
import { getCookie } from '../cookieUtils';
import toast from 'react-hot-toast';

const API_URL = 'http://${process.env.REACT_APP_API_URL}/discounts';
const BASE_URL = 'http://${process.env.REACT_APP_API_URL}';

const getToken = () => getCookie('access_token');

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.error('Access token not found in localStorage');
      throw new Error('Access token not found');
    }
  }

  return headers;
};


export const fetchRandomDiscounts = async () => {
  try {
    const response = await axios.get(`${API_URL}/random-discounts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return [];
  }
};

export const getReviewsByReviewable = async (reviewableType, reviewableId) => {
  try {
    const response = await axios.get(`${BASE_URL}/reviews/${reviewableType}/${reviewableId}`, {
      headers: getHeaders(false),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const manageReview = async (method, data) => {
  const url = method === 'post' ? `${BASE_URL}/reviews` : `${BASE_URL}/reviews/${data.id}`;

  try {
    const response = await axios({
      method,
      url,
      data,
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error ${method}ing review:`, error);
    toast.error(`An error occurred.`);
    throw error;
  }
};

export const fetchShopServices = async (shopId) => {
  try {
    const response = await axios.get(`${BASE_URL}/shops/${shopId}/services`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shop services:', error);
    throw error;
  }
};

export const followShop = async (shopId) => {
  try {
    const response = await axios.post(`${BASE_URL}/follow`, { shop_id: shopId }, {
      headers: getHeaders(),
    });
    toast.success('Followed shop successfully!');
    return response.data;
  } catch (error) {
    toast.error('An error occurred.');
    throw error;
  }
};

export const unfollowShop = async (shopId) => {
  try {
    const response = await axios.post(`${BASE_URL}/unfollow`, { shop_id: shopId }, {
      headers: getHeaders(),
    });
    toast.success('Unfollowed shop successfully!');
    return response.data;
  } catch (error) {
    toast.error('An error occurred.');
    throw error;
  }
};

export const getShopFollowers = async (shopId) => {
  try {
    const response = await axios.get(`${BASE_URL}/followers/${shopId}`);
    return response.data;
  } catch (error) {
    toast.error('An error occurred.');
    throw error;
  }
};

export const getShopById = async (shopId
) => {
  try {
    const response = await axios.get(`${BASE_URL}/shops/${shopId}`, {
      headers: getHeaders(false),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching shop information:', error);
    toast.error('An error occurred while fetching shop information.');
    throw error;
  }
};

export const fetchUserPayments = async () => {
  const token = getCookie('access_token');;
  const response = await axios.get(`${BASE_URL}/payments/by-current-user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};