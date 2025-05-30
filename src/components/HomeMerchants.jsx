import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRegHeart } from 'react-icons/fa';

const HomeMerchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        // If you don't need a cookie, just remove this header.
        const response = await axios.get('/api/merchants');
        setMerchants(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching merchants:', error);
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Merchants</h1>
      <div>
        {merchants.map((merchant) => (
          <div key={merchant.id}>
            <h3>{merchant.name}</h3>
            <p>{merchant.description}</p>
            <FaRegHeart />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeMerchants;
