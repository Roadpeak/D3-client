import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomeOffers = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomDiscounts = async () => {
      try {
        const response = await axios.get('/api/discounts');
        setDiscounts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching discounts:', error);
        setLoading(false);
      }
    };

    fetchRandomDiscounts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Offers</h1>
      <div>
        {discounts.map((discount) => (
          <div key={discount.id}>
            <h3>{discount.name}</h3>
            <p>{discount.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeOffers;
