import React from 'react';

const BrowseCategories = () => {
  const categories = [
    { name: "Photography & Videography", icon: "🍔", color: "bg-orange-100" },
    { name: "Barber & Salon", icon: "🥤", color: "bg-blue-100" },
    { name: "Hotels & Restaurants", icon: "🛍️", color: "bg-red-100" },
    { name: "Beauty & Spa", icon: "💅", color: "bg-pink-100" },
    { name: "Travel", icon: "✈️", color: "bg-purple-100" },
    { name: "Entertainment", icon: "🎬", color: "bg-green-100" }
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">BROWSE CATEGORIES</h2>
        <a href="#" className="text-red-500 text-sm hover:underline">View All Categories →</a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="text-center cursor-pointer group">
            <div className={`${category.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl group-hover:scale-110 transition-transform`}>
              {category.icon}
            </div>
            <p className="text-sm font-medium group-hover:text-red-600">{category.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrowseCategories;