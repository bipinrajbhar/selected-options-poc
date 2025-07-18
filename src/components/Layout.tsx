import React from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/product-gallery"
              className="text-2xl font-light text-gray-900 font-display hover:text-gray-700 transition-colors"
            >
              React Playground
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <Link
                to="/product-gallery"
                className={`text-sm font-medium transition-colors font-body ${
                  isActive("/product-gallery") || isActive("/")
                    ? "text-black border-b-2 border-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Product Gallery
              </Link>
              <Link
                to="/home"
                className={`text-sm font-medium transition-colors font-body ${
                  isActive("/home")
                    ? "text-black border-b-2 border-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`text-sm font-medium transition-colors font-body ${
                  isActive("/products")
                    ? "text-black border-b-2 border-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Products
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors font-body ${
                  isActive("/about")
                    ? "text-black border-b-2 border-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                About
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;
