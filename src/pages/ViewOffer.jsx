import React, { useEffect, useState } from 'react';
import { FaAngleLeft, FaFacebookF, FaInstagram, FaLink, FaRegHeart, FaWhatsapp } from 'react-icons/fa';
import { FaTwitter } from 'react-icons/fa';
import { FacebookShareButton, WhatsappShareButton, TwitterShareButton, InstapaperShareButton } from 'react-share';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReviewComponent from '../components/ReviewComponent';
import { MdContentCopy } from 'react-icons/md';
import { useAuth } from '../utils/context/AuthContext';
import Navbar from '../components/Navbar';
const ViewOffer = () => {

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('details');
    const [discount, setDiscount] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false)
    const placeholderImage = 'https://imgs.search.brave.com/1qOy-0Ymw2K6EdSAI4515c9T4mh-eoIQbDsp-koZkLw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1Lzk3LzQ3Lzk1/LzM2MF9GXzU5NzQ3/OTU1Nl83YmJRN3Q0/WjhrM3hiQWxvSEZI/VmRaSWl6V0sxUGRP/by5qcGc';

    const { user } = useAuth();
    const { id } = useParams();
    const discounId = id ? parseInt(id, 10) : 0;

    useEffect(() => {
        const fetchDiscount = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`https://api.discoun3ree.com/api/discounts/${id}`);
                setDiscount(response.data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setError('An error occurred while fetching discount data.');
            }
        };

        fetchDiscount();
    }, [id]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                console.log("Copied!")
            })
            .catch((error) => {
                console.error('Failed to copy link: ', error);
            });
    };

    const formatDate = (dateString) => {
        const options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };
  return (
      <div>
          <Navbar />
          {user && user.first_discount === 0 && (
              <div className="bg-yellow-200">
                  <p className="text-yellow-800 px-4 text-center py-3 text-sm">
                      You have one free voucher. You will use it to access this discount and book an appointment.
                  </p>
              </div>
          )}
          <div className="flex px-[5%] flex-col py-[2%]">
              <div className="flex w-full flex-col gap-2 items-start ">
                  <button onClick={() => navigate(-1)} className="flex text-gray-600 font-light text-[15px] items-center gap-2">
                      <FaAngleLeft />
                      <span>Go back</span>
                  </button>
                  <div className="w-full flex flex-col md:flex-row gap-[2%]">
                      <div className="flex flex-col w-full gap-[2%] md:w-2/3">
                          {
                              loading ? (
                                  <div className="border rounded-md p-4 flex flex-col md:flex-row w-full">
                                      <div className="flex flex-col md:flex-row flex-wrap overflow-x-auto w-full md:w-1/2">
                                          <div className="px-[5%] w-full md:w-2/3 mt-4 md:mt-0">
                                              <div className="bg-gray-300 h-64 rounded-md animate-pulse"></div>
                                          </div>
                                      </div>

                                      <div className="flex flex-col w-full md:w-1/2 space-y-4">
                                          <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                                          <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
                                          <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                                          <div className="flex items-center gap-2">
                                              <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                                              <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                                          </div>
                                          <div className="h-12 bg-gray-300 rounded-md animate-pulse"></div>
                                          <div className="flex flex-col space-y-2">
                                              <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                                              <div className="flex border rounded-md border-gray-300 px-2 py-1.5 w-fit items-center gap-2">
                                                  <div className="h-6 bg-gray-300 rounded-full animate-pulse"></div>
                                                  <div className="h-6 bg-gray-300 rounded-full animate-pulse"></div>
                                              </div>
                                          </div>
                                          <div className="flex flex-col space-y-2">
                                              <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                                              <div className="flex flex-wrap items-center gap-4">
                                                  <div className="h-12 w-12 bg-gray-100 rounded-full items-end flex gap-1 animate-pulse">
                                                      <div className="h-6 bg-blue-500 rounded-full"></div>
                                                      <div className="h-6 bg-gray-400 rounded-full"></div>
                                                  </div>
                                                  <div className="h-12 w-12 bg-gray-100 rounded-full items-end flex gap-1 animate-pulse">
                                                      <div className="h-6 bg-green-500 rounded-full"></div>
                                                      <div className="h-6 bg-gray-400 rounded-full"></div>
                                                  </div>
                                                  <div className="h-12 w-12 bg-gray-100 rounded-full items-end flex gap-1 animate-pulse">
                                                      <div className="h-6 bg-rose-200 rounded-full"></div>
                                                      <div className="h-6 bg-gray-400 rounded-full"></div>
                                                  </div>
                                                  <div className="h-12 w-12 bg-gray-100 rounded-full items-end flex gap-1 animate-pulse">
                                                      <div className="h-6 bg-gray-200 rounded-full"></div>
                                                      <div className="h-6 bg-gray-400 rounded-full"></div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="border p-4 flex flex-col md:flex-row w-full">
                                      <div className="flex flex-col md:flex-row flex-wrap overflow-x-auto w-full md:w-1/2">
                                          <div className="w-full md:w-2/3 mt-4 md:mt-0">
                                              <img className="rounded-md" alt="image" src={discount?.image_url || placeholderImage} />
                                          </div>
                                      </div>
                                      <div className="flex flex-col w-full md:w-1/2">
                                          <p className="text-gray-400 font-light text-[11px]">{discount?.category}</p>
                                          <p className="font-medium text-[20px] ">{discount?.name}</p>
                                          <span className="text-primary text-[15px]">
                                              {discount?.percentage_discount}% OFF
                                          </span>
                                          <div className="flex items-center gap-2 ">
                                              <span className="font-light text-[12px] text-gray-600">was</span>
                                              <p className="text-[13px] line-through">Ksh {discount?.initial_price}</p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              <span className="font-light text-gray-600">now</span>
                                              <p className="font-medium text-[18px]">Ksh {discount?.price_after_discount}</p>
                                          </div>
                                          <p className="text-[13px] font-light text-gray-600 mt-1.5">
                                              Expires {discount?.expiry_date ? formatDate(discount.expiry_date) : 'N/A'}
                                          </p>
                                          <button
                                              onClick={() => {
                                                  if (!user) {
                                                      navigate(`/${discount?.slug}/${discount?.id}/checkout`);
                                                  } else if (user.first_discount === 1) {
                                                      navigate(`/${discount?.slug}/${discount?.id}/checkout`);
                                                  } else {
                                                      navigate(`/discount/${discount?.id}/booking`);
                                                  }
                                              }}
                                              className="w-full py-1.5 bg-primary rounded-md text-white capitalize text-[13px] font-medium flex items-center justify-center mb-2"
                                          >
                                              {!user ? (
                                                  <>
                                                      Get voucher @ Ksh <span>{discount?.amount}</span>
                                                  </>
                                              ) : user.first_discount === 1 ? (
                                                  <>
                                                      Get voucher @ Ksh <span>{discount?.amount}</span>
                                                  </>
                                              ) : (
                                                  'Book appointment'
                                              )}
                                          </button>
                                          <div className="flex flex-col my-3.5">
                                              <span className="text-[15px]">Save this for later</span>
                                              <button className="flex border rounded-md border-gray-300 px-6 py-1.5 w-fit items-center gap-2">
                                                  <FaRegHeart />
                                                  Favorite
                                              </button>
                                          </div>
                                          <div className="flex flex-col mb-2">
                                              <p className="text-[16px] font-light">Share with friends and family</p>
                                              <div className="flex flex-wrap items-center w-fit gap-4">
                                                  <FacebookShareButton url={window.location.href} className="flex items-center">
                                                      <div className="bg-gray-100 rounded-md p-1 items-end flex gap-1">
                                                          <FaFacebookF size={24} className="bg-blue-500 text-white p-1" />
                                                          <span className="text-gray-600 text-[14px] font-light">share</span>
                                                      </div>
                                                  </FacebookShareButton>
                                                  <WhatsappShareButton url={window.location.href} className="flex items-center">
                                                      <div className="bg-gray-100 p-1 rounded-md items-end flex gap-1">
                                                          <FaWhatsapp size={24} className="bg-green-500 text-white p-1" />
                                                          <span className="text-gray-600 text-[14px] font-light">share</span>
                                                      </div>
                                                  </WhatsappShareButton>
                                                  <InstapaperShareButton url={window.location.href} className="flex items-center">
                                                      <div className="bg-gray-100 p-1 rounded-md items-end flex gap-1">
                                                          <FaInstagram size={24} className="bg-rose-200 text-black p-1" />
                                                          <span className="text-gray-600 text-[14px] font-light">share</span>
                                                      </div>
                                                  </InstapaperShareButton>
                                                  <TwitterShareButton url={window.location.href} className="flex items-center">
                                                      <div className="bg-gray-100 p-1 items-end rounded-md flex gap-1">
                                                          <FaTwitter size={24} className="bg-gray-200 text-black p-1" />
                                                          <span className="text-gray-600 text-[14px] font-light">share</span>
                                                      </div>
                                                  </TwitterShareButton>
                                                  <button onClick={handleCopyLink} className="p-1 flex items-center gap-1 text-gray-600 text-[14px]">
                                                      <MdContentCopy className="text-[17px] text-gray-500" /> Copy Link
                                                  </button>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              )
                          }
                      </div>
                      <div className="w-full md:w-1/3">
                          <div className="flex gap-6 w-full items-center mb-2">
                              <p
                                  className={`font-medium text-[18px] cursor-pointer ${activeTab === 'details' ? 'text-primary border-b border-primary' : 'text-gray-600'
                                      }`}
                                  onClick={() => setActiveTab('details')}
                              >
                                  Details
                              </p>
                              <a href={`/stores/${discount?.shop_id}/view`} className="text-primary font-nromal text-[14px] flex items-center gap-1">View Store <FaLink /></a>
                          </div>
                          {activeTab === 'details' ? (
                              <div className="">
                                  <p className="font-light text-[14px] text-gray-600">
                                      {discount?.description}
                                  </p>
                              </div>
                          ) : (
                              <></>
                          )}
                      </div>
                  </div>
                  <div className="w-full mt-4 rounded-md">
                      <ReviewComponent reviewableType="discount" reviewableId={discounId} />
                  </div>
              </div>
          </div>
      </div>
  )
}

export default ViewOffer