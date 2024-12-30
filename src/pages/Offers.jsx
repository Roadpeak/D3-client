import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/context/AuthContext';
import CategorySlider from '../elements/CategorySlider';
import Navbar from '../components/Navbar';

const Offers = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const placeholderImage = 'https://imgs.search.brave.com/1qOy-0Ymw2K6EdSAI4515c9T4mh-eoIQbDsp-koZkLw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1Lzk3LzQ3Lzk1/LzM2MF9GXzU5NzQ3/OTU1Nl83YmJRN3Q0/WjhrM3hiQWxvSEZI/VmRaSWl6V0sxUGRP/by5qcGc';

    useEffect(() => {
        const fetchDiscountsByShop = async () => {
            try {
                const response = await axios.get(`https://api.discoun3ree.com/api/discounts`);
                setDiscounts(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching discounts:', error);
                setLoading(false);
            }
        };

        fetchDiscountsByShop();
    }, []);

    const formatExpiryDate = (expiryDate) => {
        const expiry = new Date(expiryDate);
        const today = new Date();
        const differenceInDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (expiry < today) {
            return 'Expired 😕';
        } else {
            return `Expires in: ${differenceInDays} days`;
        }
    };

    return (
        <div className="">
            <Navbar />
            {user && user.first_discount === 0 && (
                <div className="bg-yellow-200">
                    <p className="text-yellow-800 px-4 text-center py-3 text-sm">
                        You have one free voucher. You will use it to access any discount and book an appointment.
                    </p>
                </div>
            )}
            <div className="bg-gray-100 flex flex-col px-[5%] py-4">
                <CategorySlider />
            </div>
            <div className='w-full px-[5%] flex flex-col bg-white pb-4 mt-4'>
                <p className="text-black font-semibold mb-2 text-[20px]">
                    Top Selling | 2024
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {loading ? (
                        'Loading, please wait...'
                    ) : (
                        discounts.map((item) => (
                            <div key={item.id} className="bg-white shadow-md border border-gray-200 pb-4 flex flex-col justify-between rounded-md">
                                <img src={item.image_url || placeholderImage} className='rounded-t-md' alt={item.name} />
                                <div className="flex flex-col p-4">
                                    <p className="text-black font-medium text-[16px] truncate-2-lines mb-2">{item.name}</p>
                                    <p className="text-gray-600 text-[14px] mb-2">Use Code: <span className="text-red-500 font-semibold">{item.promo_code || 'N/A'}</span></p>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <p className="text-gray-500 text-[14px] line-through">{`Ksh. ${item.initial_price}`}</p>
                                            <p className="text-primary font-semibold text-[14px]">{`Ksh. ${item.price_after_discount}`}</p>
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-gray-600 mb-2">{formatExpiryDate(item.expiry_date)}</p>
                                    <div className="flex items-center gap-2">
                                        <a href={`/offers/${item.slug}/${item.id}/see-details`} className="w-1/2 text-center bg-primary text-white py-2 rounded-md text-[14px]">Details</a>
                                        <a href={`/${item.slug}/${item.id}/checkout`} className="w-1/2 text-center bg-gray-100 text-gray-900 py-2 rounded-md text-[14px]">Buy Now</a>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Offers;
