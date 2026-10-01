"use client";

import { useState, useCallback, useRef, type DragEvent } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { generatePhotoDescription } from "@/ai/flows/generate-photo-description";
import { regeneratePhotoDescription } from "@/ai/flows/regenerate-photo-description";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadCloud, Copy, RefreshCw, Wand2, X, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


type HistoryItem = {
  photoDataUri: string;
  description: string;
  id: number;
};

type State = {
  photoDataUri: string | null;
  description: string | null;
  isLoading: boolean;
  error: string | null;
  isDragging: boolean;
  history: HistoryItem[];
  viewingHistoryItem: HistoryItem | null;
};

export default function PhotoNarrator() {
  const [state, setState] = useState<State>({
    photoDataUri: null,
    description: null,
    isLoading: false,
    error: null,
    isDragging: false,
    history: [],
    viewingHistoryItem: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetToUpload = () => {
    setState((s) => ({
      ...s,
      photoDataUri: null,
      description: null,
      isLoading: false,
      error: null,
      viewingHistoryItem: null,
    }));
  };
  
  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., PNG, JPG, GIF).",
        });
        return;
      }
      
      setState((s) => ({ ...s, isLoading: true, description: null, error: null, viewingHistoryItem: null }));
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        setState((s) => ({ ...s, photoDataUri: dataUri }));
        
        try {
          const apiKey = typeof window !== "undefined" && (window as any).ApiKeyManager ? (window as any).ApiKeyManager.getGeminiKey() : "";
          const result = await generatePhotoDescription({ photoDataUri: dataUri, apiKey });
          setState((s) => ({ 
            ...s, 
            description: result.description, 
            isLoading: false,
            history: [...s.history, {photoDataUri: dataUri, description: result.description, id: Date.now()}]
          }));
        } catch (err: any) {
          console.error(err);
          setState((s) => ({ ...s, error: "Failed to generate description.", isLoading: false }));
          if (typeof window !== "undefined" && (window as any).ApiKeyManager && !((window as any).ApiKeyManager.hasGeminiKey())) {
            (window as any).ApiKeyManager.openSettings("gemini");
          }
          toast({
            variant: "destructive",
            title: "Generation Error",
            description: err?.message || "Could not generate description. Please configure your Gemini API Key in the top navigation.",
          });
        }
      };
      reader.readAsDataURL(file);
    },
    [toast]
  );

  const handleRegenerate = useCallback(async () => {
    const photoToRegenerate = state.viewingHistoryItem?.photoDataUri || state.photoDataUri;
    if (!photoToRegenerate) return;
    
    setState((s) => ({ ...s, isLoading: true, description: null, error: null }));
    try {
      const apiKey = typeof window !== "undefined" && (window as any).ApiKeyManager ? (window as any).ApiKeyManager.getGeminiKey() : "";
      const result = await regeneratePhotoDescription({ photoDataUri: photoToRegenerate, apiKey });
      
      const newDescription = result.description;
      
      setState((s) => {
        const newHistoryItem = { photoDataUri: photoToRegenerate, description: newDescription, id: Date.now() };
        let newHistory = s.history;
        let viewingHistoryItem = s.viewingHistoryItem;

        // If we are regenerating a history item, we create a new history entry and view it.
        // If we are regenerating the current photo, we also create a new history entry.
        newHistory = [...s.history, newHistoryItem];
        if (viewingHistoryItem) {
          viewingHistoryItem = newHistoryItem;
        }

        return { 
          ...s, 
          description: newDescription, 
          isLoading: false,
          history: newHistory,
          viewingHistoryItem: viewingHistoryItem,
          // If we are regenerating the main photo (not from history), update its description
          ...(s.photoDataUri === photoToRegenerate && !s.viewingHistoryItem && { description: newDescription }),
        }
      });
      toast({ title: "Success", description: "A new description has been generated." });
    } catch (err: any) {
      console.error(err);
      setState((s) => ({ ...s, error: "Failed to regenerate description.", isLoading: false }));
      if (typeof window !== "undefined" && (window as any).ApiKeyManager && !((window as any).ApiKeyManager.hasGeminiKey())) {
        (window as any).ApiKeyManager.openSettings("gemini");
      }
      toast({
        variant: "destructive",
        title: "Regeneration Error",
        description: err?.message || "Could not regenerate a description. Please check your Gemini API key.",
      });
    }
  }, [state.photoDataUri, state.viewingHistoryItem, toast]);


  const handleCopy = () => {
    const textToCopy = state.viewingHistoryItem?.description || state.description;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied to clipboard!",
      description: "The description is now ready to be pasted.",
    });
  };

  const handleViewHistoryItem = (item: HistoryItem) => {
    setState(s => ({...s, viewingHistoryItem: item, photoDataUri: item.photoDataUri, description: item.description}));
  }

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(s => ({...s, isDragging: true }));
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if the leave event is not going to a child element
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setState(s => ({...s, isDragging: false }));
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(!state.isDragging) setState(s => ({...s, isDragging: true }));
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(s => ({...s, isDragging: false }));
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  if (!state.photoDataUri) {
    return (
      <div 
        className="max-w-2xl mx-auto space-y-8"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <Card 
          className={cn(
            "border-2 border-dashed rounded-xl transition-colors duration-300",
            state.isDragging ? 'border-primary bg-primary/10' : 'border-muted'
          )}
        >
          <CardContent className="p-8 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <UploadCloud className="w-16 h-16 text-muted-foreground" />
            <p className="text-muted-foreground font-body">
              Drag & drop your photo here, or{" "}
              <span
                className="text-primary font-semibold cursor-pointer hover:underline"
                onClick={() => fileInputRef.current?.click()}
              >
                browse to upload
              </span>
              .
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
          </CardContent>
        </Card>
        {state.history.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="history">
              <AccordionTrigger>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <History className="w-5 h-5" /> Session History
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  {state.history.slice().reverse().map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleViewHistoryItem(item)}>
                      <Image src={item.photoDataUri} alt="History item" width={64} height={64} className="rounded-md object-cover w-16 h-16"/>
                      <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    );
  }

  const currentDescription = state.viewingHistoryItem?.description || state.description;
  const currentPhoto = state.viewingHistoryItem?.photoDataUri || state.photoDataUri;

  return (
    <div className="max-w-7xl mx-auto">
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-4"
          >
            <Card className="overflow-hidden shadow-lg relative">
              <Image
                src={currentPhoto}
                alt="Uploaded photo"
                width={1024}
                height={768}
                className="w-full h-auto object-contain"
                data-ai-hint="user uploaded content"
              />
              <Button variant="destructive" size="icon" className="absolute top-4 right-4 rounded-full" onClick={resetToUpload}>
                <X className="h-4 w-4"/>
                <span className="sr-only">Upload another photo</span>
              </Button>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mt-8 md:mt-0"
          >
            {state.isLoading && !currentDescription && (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </CardContent>
              </Card>
            )}

            {currentDescription && (
              <Card className="shadow-lg h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Wand2 />
                    Generated Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                   {state.isLoading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                   ) : (
                    <p className="text-foreground/90 font-body text-base md:text-lg leading-relaxed">{currentDescription}</p>
                   )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 mt-auto">
                  <Button variant="outline" onClick={handleCopy} disabled={state.isLoading}>
                    <Copy />
                    Copy Text
                  </Button>
                  <Button onClick={handleRegenerate} disabled={state.isLoading}>
                    <RefreshCw className={cn(state.isLoading && "animate-spin")} />
                    Regenerate
                  </Button>
                </CardFooter>
              </Card>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}

    