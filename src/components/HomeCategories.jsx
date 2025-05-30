import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
        const interval = setInterval(fetchCategories, 180000); // Refresh every 3 minutes
        return () => clearInterval(interval);
    }, []);

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
    };

    return (
        <div className="bg-white py-12 px-[5%]">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Categories</h2>
                <p className="text-gray-600">Find what you're looking for</p>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading categories...</p>
            ) : (
                <div className="flex flex-wrap gap-3 mb-8">
                    <button
                        onClick={() => handleCategoryClick('All')}
                        className={`px-6 py-3 rounded-full font-medium transition-all ${
                            activeCategory === 'All'
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((category, index) => (
                        <button
                            key={index}
                            onClick={() => handleCategoryClick(category.name)}
                            className={`px-6 py-3 rounded-full font-medium transition-all ${
                                activeCategory === category.name
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomeCategories;
