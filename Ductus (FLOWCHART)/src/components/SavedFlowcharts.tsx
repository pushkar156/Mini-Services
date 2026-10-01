
import React from 'react';
import { TrashIcon } from './icons/TrashIcon';

export interface Flowchart {
  id: number;
  title: string;
  details: string;
  mermaidCode: string;
  timestamp: string;
}

interface SavedFlowchartsProps {
  flowcharts: Flowchart[];
  onLoad: (id: number) => void;
  onDelete: (id: number) => void;
}

export const SavedFlowcharts: React.FC<SavedFlowchartsProps> = ({ flowcharts, onLoad, onDelete }) => {
  return (
    <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4">
      <h2 className="text-xl font-semibold text-cyan-400 mb-3">Saved Flowcharts</h2>
      <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
        {flowcharts.length === 0 ? (
          <p className="text-gray-500 text-sm">You have no saved flowcharts yet.</p>
        ) : (
          flowcharts.map(fc => (
            <div key={fc.id} className="group flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
              <div>
                <p className="font-semibold text-gray-200 truncate" title={fc.title}>{fc.title}</p>
                <p className="text-xs text-gray-400">
                  Saved on {new Date(fc.timestamp).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onLoad(fc.id)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors"
                >
                  Load
                </button>
                <button
                  onClick={() => onDelete(fc.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete flowchart"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
