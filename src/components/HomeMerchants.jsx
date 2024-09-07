import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { getCookie } from '../utils/cookieUtils';
import { FaExternalLinkAlt, FaRegHeart } from 'react-icons/fa';

const HomeMerchants = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const placeholderImage = 'https://imgs.search.brave.com/1qOy-0Ymw2K6EdSAI4515c9T4mh-eoIQbDsp-koZkLw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1Lzk3LzQ3Lzk1/LzM2MF9GXzU5NzQ3/OTU1Nl83YmJRN3Q0/WjhrM3hiQWxvSEZI/VmRaSWl6V0sxUGRP/by5qcGc';

    const fetchStores = async () => {
        try {
            const token = getCookie('access_token');;
            const response = await axios.get('https://api.discoun3ree.com/api/shops', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStores(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stores:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);
    return (
        <div className='flex flex-col px-[5%] mt-4'>
            <p className="text-[22px] font-medium -mb-1">Featured Merchants</p>
            <p className="text-primary font-medium text-[14px] mb-2">Top rated stores</p>
            <div className="grid grid-cols-2 md:grid-cols-5 w-full lg:grid-cols-7 gap-4 mb-4 mt-2">
                {stores.slice(0, 21).map(store => (
                    <a
                        href={`/stores/${store?.id}/view`}
                        key={store?.id}
                        className="bg-white flex flex-col items-center shadow-md justify-between rounded-md border border-gray-50 hover:border hover:border-gray-200 cursor-pointer"
                    >
                        <div className="flex flex-col justify-center h-full mx-auto relative">
                            <img
                                src={store.image_url || placeholderImage}
                                alt={store.name}
                                className="w-full rounded-t-md border-b mx-auto object-cover"
                            />
                            <p className="text-start px-2 mt-2 text-[15px] text-black font-medium line-clamp-2 w-full">
                                {store.name}
                            </p>
                            <div className="flex items-center px-2 my-2 gap-2">
                                <button className="w-full py-1.5 text-gray-700 bg-gray-200 rounded-md text-[14px] ">Go to store</button>
                                <button className="border h-full px-2 border-gray-300 text-gray-700 rounded-md">
                                    <FaRegHeart />
                                </button>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    )
}

export default HomeMerchants