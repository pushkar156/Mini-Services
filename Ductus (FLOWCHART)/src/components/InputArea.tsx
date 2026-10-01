
import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';


interface InputAreaProps {
  title: string;
  setTitle: (value: string) => void;
  details: string;
  setDetails: (value: string) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ title, setTitle, details, setDetails, imageFile, setImageFile, onGenerate, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      onGenerate();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const examples = [
    'The scientific method',
    'My morning routine',
    'How a bill becomes a law',
    'Agile software development workflow',
    'Brewing a cup of tea',
  ];
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="title-input" className="text-lg font-semibold text-cyan-400">
          Enter Title
        </label>
        <input
          id="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., The scientific method"
          className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          disabled={isLoading}
        />
      </div>

       <div className="flex flex-col gap-2">
        <label htmlFor="details-input" className="text-lg font-semibold text-cyan-400">
          Enter Details <span className="text-sm text-gray-500">(Optional)</span>
        </label>
        <textarea
          id="details-input"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Provide additional context, steps, or requirements here..."
          className="w-full h-28 p-3 bg-gray-800 border-2 border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-2">
         <label htmlFor="image-input" className="text-lg font-semibold text-cyan-400">
          Add Image <span className="text-sm text-gray-500">(Optional)</span>
        </label>
        {imageFile ? (
            <div className="relative group">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-auto max-h-40 object-contain rounded-lg bg-gray-800 border-2 border-gray-700"/>
                <button onClick={removeImage} className="absolute top-2 right-2 p-1 bg-gray-900/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Remove image">
                    <XCircleIcon />
                </button>
            </div>
        ) : (
            <button onClick={() => fileInputRef.current?.click()} className="flex justify-center w-full px-4 py-6 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
                <div className="text-center">
                    <UploadIcon />
                    <p className="mt-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, or JPEG</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
            </button>
        )}
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !title.trim()}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-2 mt-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Generate Flowchart'
        )}
      </button>
       <p className="text-sm text-gray-500 text-center">Tip: Press Cmd/Ctrl + Enter to generate.</p>
       
       <div className="pt-2">
        <p className="text-sm text-gray-400 mb-2 text-center">Or try an example:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => {
                  setTitle(example);
                  setDetails('');
                  removeImage();
              }}
              className="bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 text-xs font-medium py-1.5 px-3 rounded-full transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
