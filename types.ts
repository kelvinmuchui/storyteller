
export type ImageSize = '1K' | '2K' | '4K';

export interface Page {
  text: string;
  illustrationUrl?: string;
  isGeneratingImage: boolean;
}

export interface Story {
  id: string;
  title: string;
  pages: Page[];
  currentPageIndex: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

declare global {
  /**
   * The AIStudio interface is typically defined by the environment.
   * We declare it here to ensure type safety and resolve property declaration conflicts.
   */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Ensuring the aistudio property matches the globally defined AIStudio type and modifiers.
    // Added readonly modifier to align with the platform's injected global definition and fix identical modifiers error.
    readonly aistudio: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}
