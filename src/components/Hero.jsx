import React from 'react';
import { IoIosSearch } from 'react-icons/io';

const Hero = () => {
    return (
        <div className="px-[5%] py-8">
            <div
                className="bg-home rounded-xl h-[370px] w-full flex flex-col p-4 md:p-8 relative"
            >
                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-black to-transparent rounded-xl"></div>

                <div className="relative flex flex-col md:w-[40%] bg-gray-800 bg-opacity-40 h-auto gap-4 rounded-lg w-full px-4 py-6 z-10">
                    <button className="bg-white rounded-md px-6 py-1.5 text-[14px] font-medium w-fit ">
                        Find Offers
                    </button>
                    <p className="text-white text-[22px] font-semibold">
                        Exclusive Offers on all your favorite services, a one stop for all
                    </p>
                    <div className="flex h-[40px] items-center w-full rounded-lg">
                        <input 
                            type="text" 
                            placeholder='Search favorites'
                            className="h-full w-fit bg-white outline-none text-[14px] rounded-l-lg text-gray-600 px-2 md:px-6 " 
                        />
                        <button className="px-4 h-full text-white text-[14px] rounded-r-lg bg-primary border-y-2 border-primary ">
                            <span className="hidden md:flex">
                                Search
                            </span>
                            <IoIosSearch className='flex md:hidden' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
