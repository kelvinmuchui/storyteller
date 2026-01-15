
import React, { useState, useEffect } from 'react';

interface ApiKeyGuardProps {
  children: React.ReactNode;
}

export const ApiKeyGuard: React.FC<ApiKeyGuardProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success as per instructions to avoid race conditions
      setHasKey(true);
    } catch (error) {
      console.error("Key selection failed", error);
    }
  };

  if (hasKey === null) return <div className="min-h-screen bg-sky-50 flex items-center justify-center font-fun text-sky-600">Loading Magic...</div>;

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="text-6xl">🗝️</div>
          <h1 className="text-3xl text-sky-700">Magic Key Required!</h1>
          <p className="text-gray-600">To generate beautiful illustrations with our pro models, we need you to select your Gemini API key from a paid GCP project.</p>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sky-500 hover:underline text-sm block"
          >
            Learn about API billing
          </a>
          <button
            onClick={handleSelectKey}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-fun py-4 px-6 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Select My Magic Key
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
