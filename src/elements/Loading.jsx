import React from 'react';

const Loading = () => {
    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-white opacity-80 flex flex-col items-center justify-center">
            <span className="loader"></span>
            <h2 className="text-center text-[#00313D] text-[14px] mt-4">Processing...</h2>
        </div>
    )
};

export default Loading;