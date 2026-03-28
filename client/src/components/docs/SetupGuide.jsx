import { useState } from 'react';
import { ChevronRight, Copy, Check, Terminal, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SetupGuide({ guide, icon: Icon }) {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <Icon size={20} className="text-blue-400" />
          </div>
          <h3 className="font-semibold text-white text-lg">{guide.title}</h3>
        </div>
      </div>

      <div className="flex">
        {/* Steps Sidebar */}
        <div className="w-64 border-r border-white/10 bg-black/20">
          {guide.steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`
                w-full px-4 py-3 text-left border-b border-white/5 transition-colors
                ${activeStep === index 
                  ? 'bg-blue-500/15 border-r-2 border-r-blue-400' 
                  : 'hover:bg-white/5'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${activeStep === index 
                    ? 'bg-blue-500 text-white' 
                    : activeStep > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-600 text-gray-300'
                  }
                `}>
                  {activeStep > index ? '✓' : index + 1}
                </div>
                <span className={`
                  text-sm font-medium
                  ${activeStep === index ? 'text-white' : 'text-gray-400'}
                `}>
                  {step.title}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="font-semibold text-white text-xl mb-3">
                Step {activeStep + 1}: {guide.steps[activeStep].title}
              </h4>
              <p className="text-gray-400 mb-4 leading-relaxed">
                {guide.steps[activeStep].description}
              </p>
              
              {guide.steps[activeStep].code && (
                <div className="relative">
                  <button
                    onClick={() => handleCopy(guide.steps[activeStep].code)}
                    className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors z-10"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                  <pre className="bg-black/40 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                    <code>{guide.steps[activeStep].code}</code>
                  </pre>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="btn-ghost py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-400">
                  {activeStep + 1} of {guide.steps.length}
                </span>
                <button
                  onClick={() => setActiveStep(Math.min(guide.steps.length - 1, activeStep + 1))}
                  disabled={activeStep === guide.steps.length - 1}
                  className="btn-primary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}