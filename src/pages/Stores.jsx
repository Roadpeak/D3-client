import React, { useEffect, useState } from 'react';
import { fetchRandomDiscounts } from '../utils/api/api';
import { getCookie } from '../utils/cookieUtils';
import axios from 'axios';
import { FaRegHeart, FaMapMarkerAlt } from 'react-icons/fa'; // Added FaMapMarkerAlt
import CategorySlider from '../elements/CategorySlider';
import SkeletonLoader from '../elements/SkeletonLoader';
import Navbar from '../components/Navbar';

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [filteredStores, setFilteredStores] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const placeholderImage = 'https://imgs.search.brave.com/1qOy-0Ymw2K6EdSAI4515c9T4mh-eoIQbDsp-koZkLw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1Lzk3LzQ3Lzk1/LzM2MF9GXzU5NzQ3/OTU1Nl83YmJRN3Q0/WjhrM3hiQWxvSEZI/VmRaSWl6V0sxUGRP/by5qcGc';

    const locations = [
        'All', // Added "All" as the first option
        'Kilimani', 'Westlands', 'Lavington', 'CBD', 'Upperhill',
        'Ruaka', 'Kitisuru', 'Karen', 'Muthaiga', 'Roysambu',
        'Kasarani', 'Pangani', 'Juja', 'Ngara', 'Parklands',
        'Kileleshwa', 'Embakasi', 'Kitengela', 'Imara'
    ];

    const fetchStores = async () => {
        try {
            const token = getCookie('access_token');
            const response = await axios.get('https://api.discoun3ree.com/api/shops', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStores(response.data);
            setFilteredStores(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stores:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const filterByLocation = (location) => {
        setSelectedLocation(location);
        if (location === 'All' || !location) {
            setFilteredStores(stores);
        } else {
            const filtered = stores.filter(store => store.location?.toLowerCase() === location.toLowerCase());
            setFilteredStores(filtered);
        }
    };

    return (
        <div className='flex flex-col w-full'>
            <Navbar />
            <div className="w-full flex flex-col px-[5%] py-[2%]">
                <div className="flex flex-col justify-center items-center text-center w-full ">
                    <p className="text-[18px] md:text-[24px] text-center">
                        Stores with cashbacks, Coupon Codes & Promo Codes
                    </p>
                    <p className="text-[16px] font-light text-gray-700">
                        Get upto 50% off at over 100 stores
                    </p>
                </div>
                <CategorySlider />
                <p className="text-black-600 font-medium mb-2 text-[20px]">
                    All Stores
                </p>
                
                <p className="text-gray-800 font-semibold text-[18px] mb-2">Sort by Location</p>
               
                <div className="flex flex-wrap mb-4">
                    {locations.map(location => (
                        <button
                            key={location}
                            className={`px-3 py-1 m-1 text-sm rounded-md ${selectedLocation === location ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                            onClick={() => filterByLocation(location)}
                        >
                            {location}
                        </button>
                    ))}
                </div>
                {/* Stores */}
                <div className="grid grid-cols-2 md:grid-cols-6 w-full lg:grid-cols-7 gap-4">
                    {loading ? (
                        <>
                            <SkeletonLoader />
                            <SkeletonLoader />
                            <SkeletonLoader />
                            <SkeletonLoader />
                            <SkeletonLoader />
                            <SkeletonLoader />
                        </>
                    ) : (
                        filteredStores.map((store) => (
                            <a
                                href={`/stores/${store?.id}/view`}
                                key={store?.id}
                                className="bg-white flex flex-col items-center shadow-md justify-between rounded-md border border-gray-50 hover:border-gray-200 cursor-pointer"
                            >
                                <div className="flex flex-col items-center w-full">
                                    <img
                                        src={store.image_url || placeholderImage}
                                        alt={store.name}
                                        className="w-full h-24 rounded-t-md border-b mx-auto object-contain bg-gray-50 p-2"
                                    />
                                    <p className="px-2 mt-2 text-black font-medium text-[15px] truncate">
                                        {store.name}
                                    </p>
                                    <div className="flex flex-col text-center w-full px-4 mt-1 mb-2">
                                        <span className="text-red-500 font-bold text-[16px]">
                                            Up to 90% Off
                                        </span>
                                    </div>
                                    <button className="w-full py-2 text-black bg-gray-200 rounded-md text-[14px] hover:bg-gray-300">
                                        Visit Store
                                    </button>
                                </div>
                            </a>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Stores;
