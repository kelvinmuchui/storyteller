
import React, { useState } from 'react';
import { ImageSize } from '../types';

interface StoryWizardProps {
  onStart: (prompt: string, size: ImageSize) => void;
  isGenerating: boolean;
}

export const StoryWizard: React.FC<StoryWizardProps> = ({ onStart, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');

  const suggestions = [
    "A space-traveling cat looking for the moon's milk",
    "A shy dragon who loves baking rainbow cupcakes",
    "The secret underwater kingdom of glowing jellyfish",
    "A little robot who wants to learn how to whistle"
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-xl space-y-8">
      <div className="text-center">
        <h2 className="text-3xl text-sky-600 mb-2">Create a New Story!</h2>
        <p className="text-gray-500">What should your magical adventure be about?</p>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A brave squirrel who found a giant golden acorn..."
          className="w-full h-32 p-4 rounded-2xl border-2 border-sky-100 focus:border-sky-400 focus:ring-0 text-lg transition-colors resize-none"
        />
        
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setPrompt(s)}
              className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-full text-xs transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sky-600 font-semibold">Illustration Quality</label>
        <div className="flex gap-4">
          {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`flex-1 py-3 rounded-xl border-2 transition-all font-fun ${
                size === s 
                  ? 'bg-sky-500 border-sky-500 text-white shadow-md' 
                  : 'bg-white border-sky-100 text-sky-300 hover:border-sky-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400">Higher resolution takes longer to generate.</p>
      </div>

      <button
        onClick={() => onStart(prompt, size)}
        disabled={!prompt || isGenerating}
        className={`w-full py-4 rounded-2xl font-fun text-xl text-white shadow-lg transition-all transform ${
          !prompt || isGenerating 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-gradient-to-r from-sky-400 to-indigo-500 hover:scale-105 active:scale-95'
        }`}
      >
        {isGenerating ? '🪄 Casting Magic...' : '✨ Generate My Story!'}
      </button>
    </div>
  );
};
