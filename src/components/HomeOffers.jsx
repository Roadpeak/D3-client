import React, { useEffect, useState } from 'react'
import { fetchRandomDiscounts } from '../utils/api/api';

const HomeOffers = () => {
    const [discounts, setDiscounts] = useState([]);
    const placeholderImage = 'https://imgs.search.brave.com/1qOy-0Ymw2K6EdSAI4515c9T4mh-eoIQbDsp-koZkLw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1Lzk3LzQ3Lzk1/LzM2MF9GXzU5NzQ3/OTU1Nl83YmJRN3Q0/WjhrM3hiQWxvSEZI/VmRaSWl6V0sxUGRP/by5qcGc';

    useEffect(() => {
        const fetchDiscountData = async () => {
            try {
                const data = await fetchRandomDiscounts();
                setDiscounts(data);
            } catch (error) {
                console.error('Error fetching discounts:', error);
            }
        };

        fetchDiscountData();
    }, []);

    const getCurrentMonthAndYear = () => {
        const date = new Date();
        const options = { month: 'long', year: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    return (
        <div className="flex flex-col px-[5%] mt-4">
            <p className='text-[22px] font-medium -mb-1'>Featured | {getCurrentMonthAndYear()}</p>
            <p className="text-primary font-medium text-[14px] mb-2">Top searched</p>
            <div className="w-full gap-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {discounts.map((discount, index) => (
                    <a href={`/offers/${discount?.slug}/${discount?.id}/see-details`} key={index} className='w-full h-full flex flex-col justify-between pb-4 shadow-md rounded-md  hover:border border-gray-200 mb-4 relative'>
                        <div className="absolute top-4 right-4 rounded-full bg-[#FF9021] text-white text-[14px] font-light w-10 h-10 flex items-center justify-center">
                            -{Math.floor(discount.percentage_discount)}%
                        </div>
                        <div className="flex flex-col">
                            <img src={discount.image_url || placeholderImage} alt={discount.name} className='w-full rounded-t-md object-cover' />
                            <div className='text-[14px] font-medium p-2 truncate-2-lines'>{discount.name}</div>
                            <p className="truncate-2-lines px-2 text-gray-600 text-[12px]">{discount.description}</p>
                            <span className='px-2 text-primary font-medium text-[16px]'>
                                ksh. {discount.price_after_discount}
                            </span>
                        </div>
                        <div className="px-2 flex items-center gap-1">
                            <button className="w-full border bg-yellow-50 text-primary capitalize py-1.5 rounded-md text-[14px] border-yellow-50 ">details</button>
                            <button className="w-full rounded-md text-center text-gray-900 text-[14px] py-1.5  bg-gray-100">Buy now </button>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    )
}

export default HomeOffers