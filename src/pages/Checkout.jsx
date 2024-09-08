import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../utils/context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PaymentLoaderModal from '../elements/PaymentLoaderModal';
import LoginModal from '../elements/LoginModal';

const Checkout = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedGateway, setSelectedGateway] = useState(null);
    const [mpesaDetails, setMpesaDetails] = useState({ phone: '' });
    const [cardDetails, setCardDetails] = useState({ cardNumber: '', cvv: '', expiry: '' });
    const [discount, setDiscount] = useState(null);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showPaymentLoaderModal, setShowPaymentLoaderModal] = useState(false);
    const [paymentStatusResponse, setPaymentStatusResponse] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('pending'); 
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    let userId = null;

    if (user) {
        userId = user.id;
    }

    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
    };

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
        window.location.reload();
    };

    
    useEffect(() => {
        const fetchDiscount = async () => {
            try {
                const response = await axios.get(`https://api.discoun3ree.com/api/discounts/${id}`);
                setDiscount(response.data);
            } catch (error) {
                console.error('Error fetching discount:', error);
            }
        };

        fetchDiscount();
    }, [id]);


    const handleGatewaySelect = (gateway) => {
        setSelectedGateway(gateway);
        setMpesaDetails({ phone: '' });
        setCardDetails({ cardNumber: '', cvv: '', expiry: '' });
        setShowPaymentPopup(true);
    };

    const handleMpesaInputChange = (e) => {
        const { value } = e.target;
        setMpesaDetails((prevDetails) => ({ ...prevDetails, phone: value }));
    };

    const validateAndFormatPhoneNumber = (phone) => {
        let formattedPhone = '';
        if (/^07\d{8}$/.test(phone) || /^01\d{8}$/.test(phone)) {
            formattedPhone = '254' + phone.slice(-9);
        } else if (/^\+254\d{9}$/.test(phone)) {
            formattedPhone = '254' + phone.slice(-9);
        }
        return formattedPhone;
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        setCardDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
    };

    const handlePaymentInitiation = async () => {
        const formattedPhone = validateAndFormatPhoneNumber(mpesaDetails.phone);
        if (!formattedPhone) {
            alert('Invalid phone number format. Please enter a valid Mpesa number.');
            return;
        }

        setShowPaymentLoaderModal(true);
        try {
            const endpoint = 'https://api.discoun3ree.com/api/mpesa/payment';
            const response = await axios.post(endpoint, {
                phone: formattedPhone,
                discount_id: id,
                user_id: user?.id,
            });
            const { MerchantRequestID } = response.data.data;
            setPaymentStatusResponse(response.data);
            handleQueryPaymentStatus(MerchantRequestID);
        } catch (error) {
            console.error('Error initiating payment:', error);
        }
    };
    const handleQueryPaymentStatus = async (MerchantRequestID) => {
        const endpoint = `https://api.discoun3ree.com/api/payments/checkout/${MerchantRequestID}`;
        try {
            const response = await axios.get(endpoint);
            setPaymentStatusResponse(response.data);

            const paymentStatus = response.data.payment.status;
            if (paymentStatus === 'pending') {
                setTimeout(() => handleQueryPaymentStatus(MerchantRequestID), 4000);
            } else if (paymentStatus === 'failed') {
                setPaymentStatus('failed');
                setShowPaymentLoaderModal(true);
            } else if (paymentStatus === 'complete') {
                setPaymentStatus('complete');
                setShowPaymentLoaderModal(true);
                setTimeout(() => navigate(`/discount/${id}/booking`), 3000);
            }
        } catch (error) {
            console.error('Error querying payment status:', error);
            setPaymentStatus('failed');
            setShowPaymentLoaderModal(true);
        }
    };

    const handleCheckout = () => {
        if (user) {
            handlePaymentInitiation();
        } else {
            setShowLoginModal(true);
        }
    };

    const handleClosePopup = () => {
        setShowPaymentPopup(false);
        window.location.reload();
    };


  return (
      <>
          <Navbar />
          <div className="px-[5%] mx-auto bg-white py-[2%]">
              <h2 className="text-[18px] font-medium mb-4">Checkout</h2>
              <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/2">
                      {discount && (
                          <div className='flex items-center gap-2 p-2 rounded-md border shadow-sm'>
                              <img src={discount.image_url} className='w-[110px] rounded-lg' alt="" />
                              <div className="flex flex-col ">
                                  <p className='font-medium text-[15px]'>{discount?.name}</p>
                                  <p className="text-[13px] text-primary">Voucher: <span className="font-medium">Ksh. {discount.amount}</span></p>
                              </div>
                          </div>
                      )}
                  </div>
                  <div className="w-full md:w-1/2 ">
                      <h3 className="text-[16px] font-medium text-black mb-2">Make payment Via</h3>
                      <div className="flex flex-col gap-4">
                          <label
                              className={`cursor-pointer p-4 border border-gray-200 bg-white shadow-md hover:border-primary rounded-md ${selectedGateway === 'mpesa' ? 'bg-gray-50' : ''
                                  }`}
                          >
                              <input
                                  type="radio"
                                  name="gateway"
                                  value="mpesa"
                                  onChange={() => handleGatewaySelect('mpesa')}
                              />
                              <img src='https://imgs.search.brave.com/-8NOtwE_p1CKFQNjYquNzIoND4bFQE51XUbNGQITkzU/rs:fit:860:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5naXRlbS5jb20v/cGltZ3MvbS8zODgt/Mzg4OTMzMV9tLXBl/c2EtbG9nby1wbmct/bS1wZXNhLXRyYW5z/cGFyZW50LXBuZy5w/bmc' alt="" className="bg-transparent w-[100px]" />
                              <div className="flex flex-col">
                                  Mpesa
                              </div>
                          </label>

                          <label className={`cursor-pointer p-4 border border-gray-200 bg-white shadow-md hover:border-primary rounded-md ${selectedGateway === 'card' ? 'bg-gray-50 border-gray-400' : 'border-gray-200'}`}>
                              <input
                                  type="radio"
                                  name="gateway"
                                  value="card"
                                  onChange={() => handleGatewaySelect('card')}
                              />
                              <div className="flex items-center gap-4">
                                  <img
                                      src="https://imgs.search.brave.com/dXCE-WJuXRMQUkkb88Uh5dpDISHy1mc4Yc9_2hBqApI/rs:fit:860:0:0/g:ce/aHR0cHM6Ly91c2Eu/dmlzYS5jb20vZGFt/L1ZDT00vcmVnaW9u/YWwvdmUvcm9tYW5p/YS9ibG9ncy9oZXJv/LWltYWdlL3Zpc2Et/bG9nby04MDB4NDUw/LmpwZw"
                                      className='w-[100px] h-auto'
                                      alt="Visa/Mastercard Logo"
                                  />
                                  <img
                                      src="https://imgs.search.brave.com/FTbABrpr5DauchTd3jS5PmLhGIvA8oZY3csPRDwzIw0/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuZnJlZWltYWdl/cy5jb20vdmhxL2lt/YWdlcy9wcmV2aWV3/cy82NDAvbWFzdGVy/Y2FyZC1sb2dvLTY3/OTMyLmpwZz9mbXQ"
                                      alt="Visa/Mastercard Logo"
                                      className="w-[100px] h-auto"
                                  />
                              </div>
                          </label>
                      </div>
                  </div>
              </div>

              {showLoginModal && (
                  <LoginModal
                      onClose={handleCloseLoginModal}
                      onLogin={handleLoginSuccess}
                  />
              )}

              {showPaymentLoaderModal && (
                  <PaymentLoaderModal
                      onClose={() => setShowPaymentLoaderModal(false)}
                      paymentStatusResponse={paymentStatusResponse}
                      paymentStatus={paymentStatus}
                  />
              )}

              {showPaymentPopup && (
                  <div className="absolute h-full top-0 left-0 right-0 bottom-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white p-8 w-[80%] md:w-1/3 rounded-lg">
                          {selectedGateway === 'mpesa' && (
                              <div className="flex flex-col">
                                  <p className="text-center mb-2">Enter Your Mpesa number</p>
                                  <input
                                      type="text"
                                      placeholder="Enter your phone number"
                                      className="border outline-none text-[14px] rounded-md p-2 mt-2"
                                      value={mpesaDetails.phone}
                                      onChange={handleMpesaInputChange}
                                  />
                                  <p className="text-[13px] text-gray-600 font-light">Format: 07/01/+254</p>
                                  <div className="flex w-full items-center justify-end">
                                      <button className="mt-4 text-primary mr-4 border-none outline-none" onClick={handleClosePopup}>Cancel</button>
                                      <button
                                          className="mt-4 bg-primary text-white py-2 px-6 rounded-md"
                                          onClick={handleCheckout}
                                      >
                                          Complete
                                      </button>
                                  </div>
                              </div>
                          )}
                          {selectedGateway === 'card' && (
                              <div className="flex flex-col">
                                  <div className="">
                                      <p className="">Coming Soon!</p>
                                      <button className="mt-1 text-primary mr-4 border-none outline-none" onClick={handleClosePopup}>Cancel</button>
                                  </div>
                                  {/* <div className='flex flex-col justify-center '>
                                        <p className="text-center text-gray-700 text-[18px] mb-4 font-medium">Enter Your Visa/Mastercard Information</p>
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                placeholder="Card Number"
                                                className="border rounded-md outline-none p-3 text-gray-800 placeholder-gray-500 focus:border-primary focus:ring-primary"
                                                value={cardDetails.cardNumber}
                                                onChange={handleCardInputChange}
                                            />
                                            <input
                                                type="text"
                                                name="cvv"
                                                placeholder="CVV"
                                                className="border rounded-md outline-none flex-1 p-3 text-gray-800 placeholder-gray-500 focus:border-primary focus:ring-primary"
                                                value={cardDetails.cvv}
                                                onChange={handleCardInputChange}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            name="expiry"
                                            placeholder="Expiry Date"
                                            className="border rounded-md outline-none flex-1 p-3 text-gray-800 placeholder-gray-500 focus:border-primary focus:ring-primary"
                                            value={cardDetails.expiry}
                                            onChange={handleCardInputChange}
                                        />
                                        <div className="flex w-full items-center justify-end">
                                            <button className="mt-4 text-primary mr-4 border-none outline-none" onClick={handleClosePopup}>Cancel</button>
                                            <button
                                                className="mt-4 bg-primary text-white py-3 px-6 rounded-md"
                                                onClick={handleCheckout}
                                            >
                                                Complete
                                            </button>
                                        </div>
                                    </div> */}
                              </div>
                          )}
                      </div>
                  </div>
              )}

              <div className="mt-8">
                  {selectedProduct && selectedGateway && (
                      <div>
                          <h3 className="text-xl font-semibold mb-4">Purchase Summary</h3>
                          <div className="bg-blue-100 p-4 rounded-lg">
                              <p className="text-lg font-semibold">{selectedProduct.name}</p>
                              <p className="text-gray-500">Amount for discount: <span className="font-medium">Ksh. {(0.2 * selectedProduct.price).toLocaleString("en-US")}</span></p>
                              <p className="text-gray-500">Payment: <span className="uppercase font-medium">{selectedGateway}</span></p>
                          </div>
                      </div>
                  )}
              </div>
          </div>
          {/* <Footer /> */}
      </>
  )
}

export default Checkout