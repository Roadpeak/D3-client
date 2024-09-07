import axios from 'axios';
import React, { useEffect, useState } from 'react'

const HomeCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const placeholderImage = 'https://imgs.search.brave.com/1qOy-0Ymw2K6EdSAI4515c9T4mh-eoIQbDsp-koZkLw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1Lzk3LzQ3Lzk1/LzM2MF9GXzU5NzQ3/OTU1Nl83YmJRN3Q0/WjhrM3hiQWxvSEZI/VmRaSWl6V0sxUGRP/by5qcGc';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const storedCategories = localStorage.getItem('cachedCategories');
                if (storedCategories) {
                    setCategories(JSON.parse(storedCategories));
                }

                const response = await axios.get ('https://api.discoun3ree.com/api/random-categories');
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
  return (
    <div className='flex flex-col w-full px-[5%]'>
        <p className="text-[22px] font-medium -mb-1">Browse by category</p>
        <p className="text-primary font-medium text-[14px]">Trending categories</p>
          <div className='w-full gap-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7'>
              {categories.map((category, index) => (
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
  )
}

export default HomeCategories