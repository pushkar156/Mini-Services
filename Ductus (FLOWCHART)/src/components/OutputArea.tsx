
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SaveIcon } from './icons/SaveIcon';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface OutputAreaProps {
  mermaidCode: string;
  isLoading: boolean;
  error: string | null;
  onSave: () => void;
}

export const OutputArea: React.FC<OutputAreaProps> = ({ mermaidCode, isLoading, error, onSave }) => {
  const [copied, setCopied] = useState(false);
  const canSave = mermaidCode && !isLoading && !error;

  const handleCopy = () => {
    if (mermaidCode) {
      navigator.clipboard.writeText(mermaidCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-gray-400">Generating Mermaid code...</div>;
    }
    if (error) {
      return <div className="text-red-400 whitespace-pre-wrap">{error}</div>;
    }
    if (mermaidCode) {
      return (
        <SyntaxHighlighter
          language="mermaid"
          style={vscDarkPlus}
          customStyle={{
            background: 'transparent',
            margin: 0,
            padding: 0,
            overflow: 'visible',
            height: '100%',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'inherit',
              fontSize: 'inherit',
            },
          }}
          showLineNumbers
        >
          {mermaidCode}
        </SyntaxHighlighter>
      );
    }
    return <div className="text-gray-500">Your generated Mermaid code will appear here.</div>;
  };

  return (
    <div className="flex-grow flex flex-col relative bg-gray-800 border-2 border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-cyan-400">Mermaid Code</h2>
        <div className="flex items-center gap-2">
          {canSave && (
             <button
              onClick={onSave}
              className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Save flowchart"
              title="Save flowchart"
            >
              <SaveIcon />
            </button>
          )}
          {mermaidCode && !error && (
            <button
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Copy code to clipboard"
              title="Copy code"
            >
              {copied ? <CheckIcon /> : <ClipboardIcon />}
            </button>
          )}
        </div>
      </div>
      <div className="flex-grow overflow-auto text-sm">
        {renderContent()}
      </div>
    </div>
  );
};
