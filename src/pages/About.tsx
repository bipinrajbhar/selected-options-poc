import React from "react";
import { Link } from "react-router-dom";

const About: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-light text-gray-900 leading-tight tracking-wide font-display mb-8">
            About React Playground
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed font-body">
            A modern React application showcasing product customization and
            routing capabilities.
          </p>
        </div>

        <div className="space-y-12">
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-light text-gray-900 font-display mb-4">
              Features
            </h2>
            <ul className="space-y-3 text-gray-600 font-body">
              <li>• React Router for seamless navigation</li>
              <li>• Apollo Client for GraphQL integration</li>
              <li>• Tailwind CSS for modern styling</li>
              <li>• Product customization with dynamic options</li>
              <li>• URL state management with nuqs</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-light text-gray-900 font-display mb-4">
              Technology Stack
            </h2>
            <ul className="space-y-3 text-gray-600 font-body">
              <li>• React 19 with TypeScript</li>
              <li>• Vite for fast development</li>
              <li>• React Router DOM for routing</li>
              <li>• Apollo Client for GraphQL</li>
              <li>• Tailwind CSS v4 for styling</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors font-body"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
