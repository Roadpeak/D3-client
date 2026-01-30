import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config/api';
import { useLocation } from 'react-router-dom';
import { FaRegHeart } from 'react-icons/fa';
import { fetchRandomDiscounts } from '../utils/api/api';
import SkeletonLoader from '../elements/SkeletonLoader';

const SearchResults = () => {
    const [discounts, setDiscounts] = useState([]);
    const [random, setRandom] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const placeholderImage = 'https://imgs.search.brave.com/1qOy-0Ymw2K6EdSAI4515c9T4mh-eoIQbDsp-koZkLw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1Lzk3LzQ3Lzk1/LzM2MF9GXzU5NzQ3/OTU1Nl83YmJRN3Q0/WjhrM3hiQWxvSEZI/VmRaSWl6V0sxUGRP/by5qcGc';

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('query');
        if (query) {
            fetchSearchResults(query);
        }
    }, [location]);

    const fetchSearchResults = async (query) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/search?query=${query}`);
            setDiscounts(response.data.discounts);
            setStores(response.data.shops);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchDiscountData = async () => {
            try {
                const data = await fetchRandomDiscounts();
                setRandom(data);
            } catch (error) {
                console.error('Error fetching discounts:', error);
            }
        };

        fetchDiscountData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className='flex flex-col px-[5%] py-4'>
                {discounts?.length > 0 && (
                    <p className="text-gray-700 dark:text-gray-200 font-medium my-2 text-[18px]">
                        Offers
                    </p>
                )}
                {discounts.length > 0 && (
                    <div className="w-full gap-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {discounts.map((discount) => (
                            <a href={`/offers/${discount?.slug}/${discount?.id}/see-details`} key={discount.id} className='w-full h-full flex flex-col justify-between pb-4 shadow-md dark:shadow-gray-800 rounded-md bg-white dark:bg-gray-800 hover:border border-gray-200 dark:border-gray-700 mb-4 relative transition-colors duration-200'>
                                <div className="absolute top-4 right-4 rounded-full bg-[#FF9021] text-white text-[14px] font-light w-10 h-10 flex items-center justify-center">
                                    -{Math.floor(discount.percentage_discount)}%
                                </div>
                                <div className="flex flex-col">
                                    <img src={discount.image_url || placeholderImage} alt={discount.name} className='w-full rounded-t-md object-cover' />
                                    <div className='text-[14px] font-medium p-2 truncate-2-lines text-gray-900 dark:text-gray-100'>{discount.name}</div>
                                    <p className="truncate-2-lines px-2 text-gray-600 dark:text-gray-400 text-[12px]">{discount.description}</p>
                                    <span className='px-2 text-primary dark:text-yellow-400 font-medium text-[16px]'>
                                        ksh. {discount.price_after_discount}
                                    </span>
                                </div>
                                <div className="px-2 flex items-center gap-1">
                                    <button className="w-full border bg-yellow-50 dark:bg-yellow-900/30 text-primary dark:text-yellow-400 capitalize py-1.5 rounded-md text-[14px] border-yellow-50 dark:border-yellow-900/50">details</button>
                                    <button className="w-full rounded-md text-center text-gray-900 dark:text-gray-100 text-[14px] py-1.5 bg-gray-100 dark:bg-gray-700">Buy now</button>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
                {stores?.length > 0 && (
                    <p className="text-gray-700 dark:text-gray-200 font-medium mt-2 text-[18px]">
                        Stores
                    </p>
                )}
                {loading && (
                    <div className='grid grid-cols-2 md:grid-cols-6 w-full lg:grid-cols-7 gap-4'>
                        <SkeletonLoader />
                        <SkeletonLoader />
                        <SkeletonLoader />
                        <SkeletonLoader />
                        <SkeletonLoader />
                        <SkeletonLoader />
                    </div>
                )}
                {stores?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 w-full lg:grid-cols-6 gap-4 my-2">
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
                            stores.map((store) => (
                                <a
                                    href={`/stores/${store?.id}/view`}
                                    key={store?.id}
                                    className="bg-white dark:bg-gray-800 flex flex-col items-center shadow-md dark:shadow-gray-800 justify-between rounded-md border border-gray-50 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer transition-colors duration-200"
                                >
                                    <div className="flex flex-col justify-center h-full mx-auto relative w-full">
                                        <img
                                            src={store.image_url || placeholderImage}
                                            alt={store.name}
                                            className="w-full rounded-t-md border-b dark:border-gray-700 mx-auto object-cover"
                                        />
                                        <p className="text-start px-2 mt-2 text-[15px] text-gray-900 dark:text-gray-100 font-medium line-clamp-2 w-full">
                                            {store.name}
                                        </p>
                                        <div className="flex items-center px-2 my-2 gap-2">
                                            <button className="w-full py-1.5 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md text-[14px]">Go to store</button>
                                            <button className="border h-full px-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md">
                                                <FaRegHeart />
                                            </button>
                                        </div>
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                )}
                <div className="flex w-full bg-white dark:bg-gray-800 p-4 rounded-md flex-col h-full mt-4 mb-6 shadow-sm dark:shadow-gray-800 transition-colors duration-200">
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-[20px] mb-2">Check this out!</p>
                    <div className="w-full gap-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {random.map((discount, index) => (
                            <a href={`/offers/${discount?.slug}/${discount?.id}/see-details`} key={index} className='w-full h-full flex flex-col justify-between pb-4 shadow-md dark:shadow-gray-700 rounded-md bg-white dark:bg-gray-800 hover:border border-gray-200 dark:border-gray-700 mb-4 relative transition-colors duration-200'>
                                <div className="absolute top-4 right-4 rounded-full bg-[#FF9021] text-white text-[14px] font-light w-10 h-10 flex items-center justify-center">
                                    -{Math.floor(discount.percentage_discount)}%
                                </div>
                                <div className="flex flex-col">
                                    <img src={discount.image_url || placeholderImage} alt={discount.name} className='w-full rounded-t-md object-cover' />
                                    <div className='text-[14px] font-medium p-2 truncate-2-lines text-gray-900 dark:text-gray-100'>{discount.name}</div>
                                    <p className="truncate-2-lines px-2 text-gray-600 dark:text-gray-400 text-[12px]">{discount.description}</p>
                                    <span className='px-2 text-primary dark:text-yellow-400 font-medium text-[16px]'>
                                        ksh. {discount.price_after_discount}
                                    </span>
                                </div>
                                <div className="px-2 flex items-center gap-1">
                                    <button className="w-full border bg-yellow-50 dark:bg-yellow-900/30 text-primary dark:text-yellow-400 capitalize py-1.5 rounded-md text-[14px] border-yellow-50 dark:border-yellow-900/50">details</button>
                                    <button className="w-full rounded-md text-center text-gray-900 dark:text-gray-100 text-[14px] py-1.5 bg-gray-100 dark:bg-gray-700">Buy now</button>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
