
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wider">
          <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
            DUCTUS
          </span>
        </h1>
      </div>
    </header>
  );
};
