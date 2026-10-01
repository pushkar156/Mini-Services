
import React, { useState, useCallback, useEffect } from 'react';
import { InputArea } from './components/InputArea';
import { OutputArea } from './components/OutputArea';
import { MermaidPreview } from './components/MermaidPreview';
import { generateMermaidCode } from './services/geminiService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SavedFlowcharts, Flowchart } from './components/SavedFlowcharts';


const App: React.FC = () => {
  const [title, setTitle] = useState<string>('The process of making coffee');
  const [details, setDetails] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlowcharts, setSavedFlowcharts] = useState<Flowchart[]>([]);

  useEffect(() => {
    try {
      const storedFlowcharts = localStorage.getItem('savedFlowcharts');
      if (storedFlowcharts) {
        setSavedFlowcharts(JSON.parse(storedFlowcharts));
      }
    } catch (e) {
      console.error("Failed to load flowcharts from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('savedFlowcharts', JSON.stringify(savedFlowcharts));
    } catch (e) {
      console.error("Failed to save flowcharts to localStorage", e);
    }
  }, [savedFlowcharts]);

  const handleGenerate = useCallback(async () => {
    if (!title.trim()) {
      setError('Please enter a title to generate a flowchart.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMermaidCode('');

    try {
      let imagePart;
      if (imageFile) {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(imageFile);
        });
        imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: imageFile.type,
          },
        };
      }

      const code = await generateMermaidCode(title, details, imagePart);
      setMermaidCode(code);
    } catch (err) {
      console.error(err);
      setError('Failed to generate flowchart. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [title, details, imageFile]);

  const handleSaveFlowchart = () => {
    if (!mermaidCode.trim() || !title.trim()) return;

    const newFlowchart: Flowchart = {
      id: Date.now(),
      title,
      details,
      mermaidCode,
      timestamp: new Date().toISOString(),
    };
    setSavedFlowcharts(prev => [newFlowchart, ...prev]);
  };

  const handleLoadFlowchart = (id: number) => {
    const flowchartToLoad = savedFlowcharts.find(fc => fc.id === id);
    if (flowchartToLoad) {
      setTitle(flowchartToLoad.title);
      setDetails(flowchartToLoad.details);
      setMermaidCode(flowchartToLoad.mermaidCode);
      setImageFile(null); // Image is not saved, so clear it
      setError(null);
    }
  };

  const handleDeleteFlowchart = (id: number) => {
    if (window.confirm('Are you sure you want to delete this saved flowchart?')) {
      setSavedFlowcharts(prev => prev.filter(fc => fc.id !== id));
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 lg:p-6 xl:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <InputArea
              title={title}
              setTitle={setTitle}
              details={details}
              setDetails={setDetails}
              imageFile={imageFile}
              setImageFile={setImageFile}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
            <OutputArea
              mermaidCode={mermaidCode}
              isLoading={isLoading}
              error={error}
              onSave={handleSaveFlowchart}
            />
             {savedFlowcharts.length > 0 && (
              <SavedFlowcharts
                flowcharts={savedFlowcharts}
                onLoad={handleLoadFlowchart}
                onDelete={handleDeleteFlowchart}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
             <h2 className="text-xl font-semibold mb-4 text-cyan-400">Flowchart Preview</h2>
            <MermaidPreview code={mermaidCode} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
