
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800/30 border-t border-gray-700 mt-8">
      <div className="container mx-auto px-4 lg:px-6 py-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Mermaid Flowchart Generator. All rights reserved.</p>
      </div>
    </footer>
  );
};
