import axios from 'axios';
import { getCookie } from '../cookieUtils';
import toast from 'react-hot-toast';

const API_URL = 'https://api.discoun3ree.com/api/discounts';
const BASE_URL = 'https://api.discoun3ree.com/api';

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
    // toast.error('An error occurred while fetching reviews.');
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