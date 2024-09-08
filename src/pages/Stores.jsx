import React, { useEffect, useState } from 'react'
import { fetchRandomDiscounts } from '../utils/api/api';
import { getCookie } from '../utils/cookieUtils';
import axios from 'axios';
import { FaRegHeart, FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import CategorySlider from '../elements/CategorySlider';
import SkeletonLoader from '../elements/SkeletonLoader';
import Navbar from '../components/Navbar';

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const placeholderImage = 'https://imgs.search.brave.com/1qOy-0Ymw2K6EdSAI4515c9T4mh-eoIQbDsp-koZkLw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1Lzk3LzQ3Lzk1/LzM2MF9GXzU5NzQ3/OTU1Nl83YmJRN3Q0/WjhrM3hiQWxvSEZI/VmRaSWl6V0sxUGRP/by5qcGc';

    const fetchStores = async () => {
        try {
            const token = getCookie('access_token');
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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const storedCategories = localStorage.getItem('cachedCategories');
                if (storedCategories) {
                    setCategories(JSON.parse(storedCategories));
                }

                const response = await axios.get('https://api.discoun3ree.com/api/random-categories');
                setCategories(response.data);
                localStorage.setItem('cachedCategories', JSON.stringify(response.data));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setLoading(false);
            }
        };

        fetchCategories();

        const interval = setInterval(fetchCategories, 180000);

        return () => clearInterval(interval);
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
      <div className='flex flex-col w-full'>
          <Navbar />
          <div className="w-full flex flex-col px-[5%] py-[2%]">
              <div className="flex flex-col justify-center items-center text-center w-full ">
                  <p className="text-[18px] md:text-[24px] text-center">
                      Stores with cashbacks, Coupon Codes & Promo Codes
                  </p>
                  <p className="text-[16px] font-light text-gray-700">
                      Get Extra 5% Bonus at over 100 stores
                  </p>
              </div>
              <CategorySlider />
              <p className="text-gray-600 font-medium mb-2 text-[20px]">
                  Double Cash Back Stores
              </p>
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
                      stores.map((store) => (
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
                      ))
                  )}
              </div>
              <div className="flex flex-col my-6 h-full w-full">
                  <p className="text-black font-semibold text-[20px] mb-2">Top searched</p>
                  <div className="h-full grid grid-cols-2 md:grid-cols-7 w-full lg:grid-cols-6 gap-4">
                      {categories.slice(0, 6).map((category, index) => (
                          <a href={`/search?query=${category.name.toLowerCase()}`} key={index} className='w-full mb-2 h-full'>
                              <div className='cursor-pointer flex items-center justify-center flex-col shadow-md rounded-md hover:bg-gray-900 hover:text-white transition-all'>
                                  <div className='image-container bg-white'>
                                      <img src={category.image_url || placeholderImage} alt={category.name} className='w-full h-fit m-auto rounded-t-md mt-3 object-cover' />
                                  </div>
                                  <span className="mx-auto w-full text-start px-2 text-[14px] font-normal py-2 truncate">
                                      {category.name}
                                  </span>
                              </div>
                          </a>
                      ))}
                  </div>
              </div>
              <div className="flex w-full bg-white p-4 rounded-md flex-col h-full mt-4 mb-6">
                  <p className="text-black font-semibold text-[20px] mb-2">You may like</p>
                  <div className="w-full grid grid-cols-2 h-full md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                      {discounts.map((item, index) => (
                          <div key={item.id} className="bg-white shadow-md hover:border border-gray-200 pb-4 flex flex-col justify-between rounded-md">
                              <img src={item.image_url || placeholderImage} className='rounded-t-md' alt="" />
                              <div className="flex flex-col">
                                  <p className="text-black px-2 my-2 font-medium text-[16px] truncate-2-lines">{item.name}</p>
                                  <div className="flex md:mt-2 items-center justify-between w-full">
                                      <div className="flex px-2 flex-col md:flex-row gap-1">
                                          <p className="text-gray-500 text-[14px] line-through">{`${item.initial_price}`}</p>
                                          <p className="text-primary font-semibold text-[14px] md:ml-2">
                                              {`Ksh. ${item.price_after_discount}`}
                                          </p>
                                      </div>
                                  </div>
                                  <p className="text-[13px] px-2 text-gray-600 "><span className=''>{formatExpiryDate(item.expiry_date)}</span></p>
                                  <div className="px-2 flex items-center gap-1">
                                      <a href={`/offers/${item.slug}/${item.id}/see-details`} className="w-full text-center border bg-yellow-50 text-primary capitalize py-1.5 rounded-md text-[14px] border-yellow-50 ">details</a>
                                      <a href={`/${item.slug}/${item.id}/checkout`} className="w-full rounded-md text-center text-gray-900 text-[14px] py-1.5  bg-gray-100">Buy now </a>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
          {/* <Footer /> */}
      </div>
  )
}

export default Stores
