import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Plus } from 'lucide-react';

interface Props {
  onStartTuning: (samples: string[]) => void;
}

const IngestView: React.FC<Props> = ({ onStartTuning }) => {
  const [samples, setSamples] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = () => {
    if (textInput.trim()) {
      setSamples([...samples, textInput.trim()]);
      setTextInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setSamples(prev => [...prev, text]);
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSample = (index: number) => {
    setSamples(samples.filter((_, i) => i !== index));
  };

  const totalChars = samples.reduce((acc, s) => acc + s.length, 0);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif font-bold text-white mb-2">Knowledge Base</h2>
        <p className="text-mist">Upload your poetry, essays, or code documentation. <br/>The more you provide, the better the fine-tuning.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Left: Input Area */}
        <div className="flex flex-col gap-4 bg-charcoal/30 p-6 rounded-xl border border-charcoal/50">
          <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Add Content</h3>
          
          <textarea
            className="flex-1 bg-obsidian border border-charcoal rounded-lg p-4 text-sm text-gray-300 focus:outline-none focus:border-accent transition-colors resize-none font-mono"
            placeholder="Paste text here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          
          <div className="flex gap-3">
            <button
              onClick={handleAddText}
              disabled={!textInput.trim()}
              className="flex-1 bg-charcoal hover:bg-charcoal/80 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-charcoal"
            >
              <Plus size={16} />
              <span>Add Text</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-charcoal hover:bg-charcoal/80 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all border border-charcoal"
            >
              <Upload size={16} />
              <span>Upload .txt/.md</span>
            </button>
            <input
              type="file"
              accept=".txt,.md"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Right: Samples List */}
        <div className="flex flex-col gap-4 bg-charcoal/30 p-6 rounded-xl border border-charcoal/50">
           <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Samples ({samples.length})</h3>
            <span className="text-xs text-mist font-mono">{totalChars} chars</span>
           </div>

           <div className="flex-1 overflow-y-auto space-y-3 pr-2">
             {samples.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-mist/30 border-2 border-dashed border-charcoal/50 rounded-lg">
                 <FileText size={48} className="mb-2" />
                 <p className="text-sm">No samples yet</p>
               </div>
             )}
             {samples.map((sample, idx) => (
               <div key={idx} className="group relative bg-obsidian p-4 rounded-lg border border-charcoal hover:border-mist/30 transition-colors">
                 <p className="text-xs text-gray-400 line-clamp-3 font-serif leading-relaxed">
                   {sample}
                 </p>
                 <button 
                  onClick={() => removeSample(idx)}
                  className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <X size={14} />
                 </button>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => onStartTuning(samples)}
          disabled={samples.length === 0}
          className="bg-accent hover:bg-sky-400 text-obsidian font-bold py-3 px-12 rounded-full shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          Begin Fine-Tuning
        </button>
      </div>
    </div>
  );
};

export default IngestView;
