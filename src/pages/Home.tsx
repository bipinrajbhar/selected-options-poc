import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-light text-gray-900 leading-tight tracking-wide font-display mb-8">
            Welcome to React Playground
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed font-body mb-12 max-w-3xl mx-auto">
            Explore our product catalog and discover amazing items with
            customizable options.
          </p>
          <div className="space-x-6">
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-black text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-colors font-body"
            >
              View Products
            </Link>
            <Link
              to="/product-gallery"
              className="inline-flex items-center justify-center bg-gray-800 text-white px-8 py-4 text-lg font-medium hover:bg-gray-700 transition-colors font-body"
            >
              Product Gallery
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center border border-gray-300 text-gray-900 px-8 py-4 text-lg font-medium hover:bg-gray-50 transition-colors font-body"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
