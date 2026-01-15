
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Story, ImageSize } from '../types';
import { generateIllustration, generateSpeech } from '../services/geminiService';

interface StoryBookProps {
  story: Story;
  imageSize: ImageSize;
  onUpdatePage: (index: number, updates: Partial<Story['pages'][0]>) => void;
  onReset: () => void;
}

export const StoryBook: React.FC<StoryBookProps> = ({ story, imageSize, onUpdatePage, onReset }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const currentPageData = story.pages[currentPage];

  // Auto-generate illustration for current page if missing
  useEffect(() => {
    if (!currentPageData.illustrationUrl && !currentPageData.isGeneratingImage) {
      const loadIllustration = async () => {
        onUpdatePage(currentPage, { isGeneratingImage: true });
        setErrorState(null);
        try {
          const url = await generateIllustration(currentPageData.text, story.title, imageSize);
          onUpdatePage(currentPage, { illustrationUrl: url, isGeneratingImage: false });
        } catch (error: any) {
          console.error("Image generation failed", error);
          onUpdatePage(currentPage, { isGeneratingImage: false });
          
          if (error.message === "API_KEY_PERMISSION_ERROR") {
            setErrorState("Magic key permission error! You might need to select a key from a paid GCP project.");
          } else {
            setErrorState("The magic brush slipped! Try moving to the next page and back.");
          }
        }
      };
      loadIllustration();
    }
  }, [currentPage, currentPageData, story.title, imageSize, onUpdatePage]);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      currentSourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      }

      const buffer = await generateSpeech(currentPageData.text);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      
      currentSourceRef.current = source;
      source.start();
    } catch (error) {
      console.error("TTS failed", error);
      setIsPlaying(false);
    }
  };

  const handleResetKey = async () => {
    await window.aistudio.openSelectKey();
    window.location.reload(); // Reload to ensure new key is picked up
  };

  const next = () => {
    if (currentPage < story.pages.length - 1) {
      currentSourceRef.current?.stop();
      setCurrentPage(prev => prev + 1);
    }
  };

  const prev = () => {
    if (currentPage > 0) {
      currentSourceRef.current?.stop();
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center px-4">
        <button onClick={onReset} className="text-sky-500 font-fun flex items-center gap-2">
          <span>🏠</span> Home
        </button>
        <h2 className="text-2xl text-sky-800 text-center">{story.title}</h2>
        <div className="w-16"></div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden story-card flex flex-col md:flex-row min-h-[500px]">
        {/* Left Side: Illustration */}
        <div className="md:w-1/2 bg-sky-50 relative aspect-video md:aspect-auto">
          {currentPageData.illustrationUrl ? (
            <img 
              src={currentPageData.illustrationUrl} 
              alt={`Page ${currentPage + 1}`} 
              className="w-full h-full object-cover transition-opacity duration-1000"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              {errorState ? (
                <div className="space-y-4">
                  <div className="text-4xl">🪄💨</div>
                  <p className="text-rose-400 font-fun text-sm">{errorState}</p>
                  {errorState.includes("Magic key") && (
                    <button 
                      onClick={handleResetKey}
                      className="bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-fun hover:bg-sky-600 shadow-md"
                    >
                      Update My Magic Key
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sky-400 font-fun mt-4">Painting your magic...</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Text & Controls */}
        <div className="md:w-1/2 p-10 flex flex-col justify-between space-y-8 bg-white">
          <div className="space-y-6">
            <div className="flex justify-between items-center text-sky-200 font-fun text-sm">
              <span>PAGE {currentPage + 1}</span>
              <span>{Math.round(((currentPage + 1) / story.pages.length) * 100)}%</span>
            </div>
            <p className="text-2xl text-sky-900 leading-relaxed font-semibold">
              {currentPageData.text}
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handlePlayAudio}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-fun text-lg transition-all ${
                isPlaying 
                ? 'bg-rose-100 text-rose-500 hover:bg-rose-200' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg'
              }`}
            >
              {isPlaying ? (
                <><span>⏹️</span> Stop Listening</>
              ) : (
                <><span>🔊</span> Read to Me!</>
              )}
            </button>

            <div className="flex gap-4">
              <button
                onClick={prev}
                disabled={currentPage === 0}
                className="flex-1 py-4 bg-sky-100 text-sky-600 rounded-2xl font-fun disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sky-200"
              >
                ⬅️ Previous
              </button>
              <button
                onClick={next}
                disabled={currentPage === story.pages.length - 1}
                className="flex-1 py-4 bg-sky-500 text-white rounded-2xl font-fun disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sky-600 shadow-lg"
              >
                Next ➡️
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-sky-300 font-fun text-xs">
        Generated by Magic AI with {imageSize} illustrations
      </div>
    </div>
  );
};
