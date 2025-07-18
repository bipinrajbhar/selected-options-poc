import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="bg-white flex items-center justify-center p-8 min-h-[calc(100vh-4rem)]">
      <div className="text-center space-y-8 max-w-lg">
        <h1 className="text-6xl lg:text-8xl font-light text-gray-900 font-display">
          404
        </h1>
        <h2 className="text-3xl font-light text-gray-900 font-display">
          Page Not Found
        </h2>
        <p className="text-gray-600 font-light text-lg leading-relaxed font-body">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors font-body"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center border border-gray-300 text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-50 transition-colors font-body"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
