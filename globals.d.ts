interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
  getApiKey: () => Promise<string>;
}

interface Window {
  aistudio: AIStudio;
}
