import axios from 'axios';
import React, { useEffect, useState } from 'react';

const HomeCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

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

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
    };

    return (
        <div className="flex flex-col w-full px-[5%]">
            <p className="text-[22px] font-medium -mb-1">Browse by category</p>
            <p className="text-gray-400 font-medium text-[14px]">Trending categories</p>
            <div className="flex flex-wrap gap-2 py-4">
                <button
                    onClick={() => handleCategoryClick('All')}
                    className={`px-4 py-2 rounded-full ${activeCategory === 'All' ? 'bg-black text-white' : 'bg-white text-black'} border border-gray-400 whitespace-nowrap`}
                >
                    All
                </button>
                {categories.map((category, index) => (
                    <button
                        key={index}
                        onClick={() => handleCategoryClick(category.name)}
                        className={`px-4 py-2 rounded-full ${activeCategory === category.name ? 'bg-black text-white' : 'bg-gray-200 text-black'} whitespace-nowrap hover:bg-gray-300 transition`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HomeCategories;
