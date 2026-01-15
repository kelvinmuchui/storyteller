
import React, { useState } from 'react';
import { StoryWizard } from './components/StoryWizard';
import { StoryBook } from './components/StoryBook';
import { ChatBot } from './components/ChatBot';
import { ApiKeyGuard } from './components/ApiKeyGuard';
import { Story, ImageSize } from './types';
import { generateStoryStructure } from './services/geminiService';

const App: React.FC = () => {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');

  const handleStartStory = async (prompt: string, size: ImageSize) => {
    setIsGenerating(true);
    setImageSize(size);
    try {
      const { title, pages } = await generateStoryStructure(prompt);
      const story: Story = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        currentPageIndex: 0,
        pages: pages.map(text => ({
          text,
          isGeneratingImage: false
        }))
      };
      setCurrentStory(story);
    } catch (error) {
      console.error("Story creation failed", error);
      alert("Magic wand failure! Please try again with a different prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdatePage = (index: number, updates: Partial<Story['pages'][0]>) => {
    setCurrentStory(prev => {
      if (!prev) return null;
      const newPages = [...prev.pages];
      newPages[index] = { ...newPages[index], ...updates };
      return { ...prev, pages: newPages };
    });
  };

  const handleReset = () => {
    setCurrentStory(null);
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <header className="py-8 px-6 text-center">
        <h1 className="text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-indigo-600 drop-shadow-sm">
          Magic Storybook AI
        </h1>
        <p className="text-sky-400 font-fun mt-2">Where your imagination comes to life!</p>
      </header>

      <main className="container mx-auto px-4 pb-24">
        <ApiKeyGuard>
          {!currentStory ? (
            <StoryWizard onStart={handleStartStory} isGenerating={isGenerating} />
          ) : (
            <StoryBook 
              story={currentStory} 
              imageSize={imageSize}
              onUpdatePage={handleUpdatePage}
              onReset={handleReset}
            />
          )}
        </ApiKeyGuard>
      </main>

      <ChatBot />

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 pointer-events-none opacity-20 hidden lg:block">
        <span className="text-9xl animate-pulse">✨</span>
      </div>
      <div className="fixed bottom-20 left-20 pointer-events-none opacity-20 hidden lg:block">
        <span className="text-9xl animate-bounce">🎨</span>
      </div>
      <div className="fixed top-40 right-10 pointer-events-none opacity-20 hidden lg:block">
        <span className="text-9xl animate-pulse">📚</span>
      </div>
    </div>
  );
};

export default App;
