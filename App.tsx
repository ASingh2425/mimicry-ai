import React, { useState } from 'react';
import { Brain, ExternalLink } from 'lucide-react';
import { AppState, AnalysisResult } from './types';
import IngestView from './components/IngestView';
import TuningView from './components/TuningView';
import StudioView from './components/StudioView';
import { analyzeStyle, hasApiKey } from './services/gemini';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INGEST);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKey] = useState(hasApiKey());

  const handleStartTuning = async (samples: string[]) => {
    setAppState(AppState.TUNING);
    setError(null);
    try {
      const result = await analyzeStyle(samples);
      setAnalysisResult(result);
      // Add a small artificial delay if the API was too fast, just for the UX of "Tuning"
      setTimeout(() => {
        setAppState(AppState.STUDIO);
      }, 2000);
    } catch (e) {
      console.error(e);
      setError("Failed to analyze style. Please try again with different samples.");
      setAppState(AppState.INGEST);
    }
  };

  const handleReset = () => {
    setAppState(AppState.INGEST);
    setAnalysisResult(null);
  };

  if (!hasKey) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-obsidian text-white p-6">
            <div className="max-w-md text-center space-y-4">
                <Brain size={64} className="mx-auto text-accent mb-6" />
                <h1 className="text-2xl font-bold">API Key Missing</h1>
                <p className="text-gray-400">
                    To use Mimicry AI, you must provide a Google Gemini API Key in the environment variables.
                </p>
                <div className="bg-charcoal p-4 rounded-lg font-mono text-sm text-red-400 border border-red-900/50">
                    process.env.API_KEY is undefined
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-obsidian flex flex-col text-slate-200 selection:bg-accent/30 selection:text-accent">
      {/* Header */}
      <header className="h-16 border-b border-charcoal/50 flex items-center justify-between px-6 md:px-10 bg-obsidian/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
            <Brain size={18} className="text-accent" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">Mimicry <span className="font-normal text-mist">AI</span></h1>
        </div>
        <div className="text-xs font-mono flex gap-4 text-mist">
          <span className={appState === AppState.INGEST ? 'text-accent' : ''}>01. INGEST</span>
          <span className="text-charcoal/50">/</span>
          <span className={appState === AppState.TUNING ? 'text-accent' : ''}>02. TUNE</span>
          <span className="text-charcoal/50">/</span>
          <span className={appState === AppState.STUDIO ? 'text-accent' : ''}>03. GENERATE</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm z-50 animate-fade-in">
                {error}
            </div>
        )}

        {appState === AppState.INGEST && (
          <IngestView onStartTuning={handleStartTuning} />
        )}
        
        {appState === AppState.TUNING && (
          <TuningView />
        )}

        {appState === AppState.STUDIO && analysisResult && (
          <StudioView analysis={analysisResult} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-charcoal/30 flex items-center justify-between px-10 text-[10px] text-gray-600 bg-obsidian">
        <div>
            POWERED BY GOOGLE GEMINI 2.5 FLASH
        </div>
        <div className="flex items-center gap-2 hover:text-mist transition-colors cursor-pointer">
            DOCS <ExternalLink size={10} />
        </div>
      </footer>
    </div>
  );
};

export default App;