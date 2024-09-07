import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
// import logo from '../../assets/icon.png';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import GoogleSignInButton from './GoogleSignInButton';

const SignUp = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = 'https://api.discoun3ree.com/api/user/register';
      const response = await axios.post(endpoint, formData);
      const token = response.data.access_token;
      if (window.location.hostname === 'localhost') {
        document.cookie = `access_token=${token}; path=/`;
      } else {
        document.cookie = `access_token=${token}; path=/; domain=.discoun3ree.com; secure; SameSite=None`;
      }
      setErrors({});
      setLoading(false);
      navigate('/accounts/verify-otp', { state: { phone: formData.phone } });
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error) && error.response) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: ['An error occurred'] });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex border bg-gray-100 items-center justify-center min-h-screen">
      <div className="w-fit bg-white h-fit rounded-md flex flex-col md:flex-row">
        <div className="bg-white p-8 rounded-lg w-full md:w-1/2">
          <div className="text-center mb-2">
            <a href="/">
              {/* <img src={logo} className='w-[50px] -mb-4 mx-auto' alt="" /> */}
            </a>
            <h1 className="text-2xl font-semibold text-black">Sign Up</h1>
          </div>
          <div className="flex w-full md:hidden justify-start gap-2 border-b border-gray-400 mb-4">
            <button
              className={`px-4 py-2 flex md:hidden items-center text-primary border-b-[2px] border-primary`}
            >
              User
            </button>
            <Link
              to='https://merchants.discoun3ree.com/accounts/register'
              target='_blank'
              className={`px-4 py-2 flex items-center md:hidden text-black`}
            >
              Merchant
            </Link>
          </div>
          <form onSubmit={handleSubmit}>
            {Object.keys(errors).map((key) => (
              errors[key].map((message) => <p key={message} className="text-sm text-red-500 mb-4">{message}</p>)
            ))}
            <div className="flex w-full gap-[2%] items-center">
              <div className="mb-1 w-full">
                <label htmlFor="first_name" className="text-[14px] text-black">First Name <span className='text-primary '>*</span></label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  placeholder='Enter first name'
                  value={formData.first_name}
                  onChange={handleChange}
                  className="p-3 block w-full text-[13px] font-light text-primary border-b border-gray-300 focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="mb-1 w-full">
                <label htmlFor="last_name" className="text-[14px] text-black">Last name <span className='text-primary '>*</span></label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  placeholder='Enter last name'
                  onChange={handleChange}
                  className="p-3 block w-full text-[13px] font-light text-primary border-b border-gray-300 focus:border-primary focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="text-[14px] text-black">Email <span className='text-primary '>*</span></label>
              <input
                type="email"
                id="email"
                placeholder='Enter email address'
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="p-3 block w-full text-[13px] font-light text-primary border-b border-gray-300 focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="text-[14px] text-black">Phone <span className='text-primary '>*</span></label>
              <input
                type="number"
                id="phone"
                name="phone"
                placeholder='Enter phone number'
                value={formData.phone}
                onChange={handleChange}
                className="p-3 block w-full text-[13px] font-light text-primary border-b border-gray-300 focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="flex items-center w-full gap-2">
              <div className="relative mb-1 w-full">
                <label htmlFor="password" className="text-[14px] text-black">
                  Password <span className="text-primary">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  placeholder="Type your password"
                  onChange={handleChange}
                  className="p-3 block w-full text-[13px] font-light text-primary border-b border-gray-300 focus:border-primary focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 top-6 flex items-center text-gray-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="relative mb-1 w-full">
                <label htmlFor="password_confirmation" className="text-[14px] text-black">
                  Confirm Password <span className="text-primary">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  placeholder="Confirm your password"
                  onChange={handleChange}
                  className="p-3 block w-full text-[13px] font-light text-primary border-b border-gray-300 focus:border-primary focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 top-6 flex items-center text-gray-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <p className="text-[12px] text-gray-600 font-light">Password must be at least 8 characters long</p>
            <div className="flex w-full items-center mt-1 gap-2">
              <input required type="checkbox" />
              <p className="text-gray-600 text-[13px] font-light">By signing up, you agree to our
                <a href="https://discoun3ree.com/terms-and-conditions" target='_blank' className="text-primary px-2">Terms & Conditions</a>
                and
                <a href="https://discoun3ree.com/privacy-policy" target='_blank' className="text-primary px-2">Privacy Policy</a>
              </p>
            </div>
            <div className="flex flex-col w-full gap-1">
              <button
                type="submit"
                className="bg-primary w-full text-white py-2 px-4 rounded-full transition duration-300"
              >
                {loading ? <ClipLoader color="#fff" /> : 'Sign Up'}
              </button>
              <div className="flex items-center gap-2 w-full">
                <hr className='w-full bg-gray-500' />
                <p className="text-center text-gray-600 font-light text-[14px]">or</p>
                <hr className='w-full bg-gray-500' />
              </div>
              <GoogleSignInButton />
            </div>
            <p className="text-[14px] text-gray-700 font-light text-start mt-2 mb-1">Already have an account? <Link to='/accounts/sign-in' className="text-primary">Sign In</Link></p>
          </form>
        </div>
        <div className="w-1/2 hidden md:flex items-center justify-center">
          <img src="https://imgs.search.brave.com/VikpyiN7OTH_xj6mfR6zYxy8_mHlGuCGveLv7wIAg14/rs:fit:500:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA0LzUzLzMyLzc2/LzM2MF9GXzQ1MzMy/NzYyMF9mbExTaFJD/VU50cW9WTUszTnlm/SmRLSTFVblEzRHhC/eS5qcGc" alt="" />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
