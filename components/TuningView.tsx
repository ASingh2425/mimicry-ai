import React, { useEffect, useState } from 'react';
import { Loader2, BrainCircuit, Scan, Wand2 } from 'lucide-react';

const STEPS = [
  { icon: Scan, label: "Scanning text structure...", duration: 1500 },
  { icon: BrainCircuit, label: "Analyzing semantic patterns...", duration: 2500 },
  { icon: Wand2, label: "Distilling style parameters...", duration: 2000 },
];

const TuningView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate visual progression, even though the real API call is running in background parent
    // The parent controls when this component unmounts, but we can animate strictly for UX
    let timer: any;
    
    if (currentStep < STEPS.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, STEPS[currentStep].duration);
    }

    return () => clearTimeout(timer);
  }, [currentStep]);

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full animate-fade-in p-6">
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        {/* Pulsing Rings */}
        <div className="absolute inset-0 border-4 border-accent/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute inset-4 border-4 border-accent/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]"></div>
        
        <div className="relative bg-charcoal/50 p-8 rounded-full border border-accent/30 backdrop-blur-sm">
           <StepIcon size={64} className="text-accent animate-pulse" />
        </div>
      </div>

      <h2 className="text-2xl font-mono font-bold text-white mb-2">
        Fine-Tuning Model
      </h2>
      <p className="text-accent font-mono text-sm animate-pulse">
        {STEPS[currentStep].label}
      </p>

      <div className="mt-8 w-64 h-1 bg-charcoal rounded-full overflow-hidden">
        <div className="h-full bg-accent animate-[progress_6s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
      </div>
    </div>
  );
};

export default TuningView;