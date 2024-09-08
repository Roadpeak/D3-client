import React from 'react';

const SkeletonLoader = () => {
    return (
        <div className="bg-white flex flex-col items-center justify-between rounded-md px-4 py-2 cursor-pointer animate-pulse">
            <div className="flex flex-col justify-center mx-auto relative">
                <div className="bg-gray-200 shadow-xl mb-2 mx-auto w-[40%] h-24 rounded-sm"></div>
                <p className="text-center text-gray-200 font-medium h-4 w-3/4 mx-auto mb-2 rounded-sm"></p>
                <p className="text-center text-gray-200 h-3 w-1/2 mx-auto mb-2 rounded-sm"></p>
                <div className="bg-gray-200 h-5 w-5 rounded-md absolute top-0 right-0"></div>
            </div>
        </div>
    );
};

export default SkeletonLoader;
