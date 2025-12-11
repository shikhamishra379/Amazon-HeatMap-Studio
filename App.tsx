import React, { useState, useRef } from 'react';
import { AnalysisContext, AnalysisResult, VisualizationMode } from './types';
import { analyzeImage } from './services/geminiService';
import { HeatmapOverlay } from './components/HeatmapOverlay';
import { AnalysisView } from './components/AnalysisView';
import { Button } from './components/Button';
import { Upload, Layout, Search, Image as ImageIcon, Sparkles, RefreshCw, Wand2, Eye, Store, Fingerprint, Activity, Info, Scale, ArrowRightLeft } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  
  // File State: Supports up to 2 files for A/B testing
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [vizMode, setVizMode] = useState<VisualizationMode>('heatmap');

  // Visualization State
  const [activeImageIndex, setActiveImageIndex] = useState<0 | 1>(0);

  // Form State
  const [context, setContext] = useState<AnalysisContext | null>(null);

  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      const newFiles = [...files];
      newFiles[index] = selectedFile;
      setFiles(newFiles);
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newPreviews = [...previews];
        newPreviews[index] = ev.target?.result as string;
        setPreviews(newPreviews);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (files.length === 0 || !context) return;
    if (context === AnalysisContext.AB_TEST && files.length < 2) return;

    setLoading(true);
    try {
      // Clean undefined slots if any
      const validFiles = files.filter(Boolean);
      const analysisData = await analyzeImage(validFiles, context);
      setResult(analysisData);
      setStep(2);
      setActiveImageIndex(0); // Default to Image A
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again or check your API key/Internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setFiles([]);
    setPreviews([]);
    setContext(null);
    setVizMode('heatmap');
    setActiveImageIndex(0);
  };

  const isAB = context === AnalysisContext.AB_TEST;

  const getButtonText = () => {
    if (loading) return 'Analyzing Assets...';
    if (isAB) {
        if (!files[0] || !files[1]) return 'Upload Both Images (A & B)';
    } else {
        if (!files[0]) return 'Upload an Image First';
    }
    if (!context) return 'Select Asset Type to Continue';
    return 'Run Auto-Analysis';
  };

  const getVizGuide = (mode: VisualizationMode) => {
    switch (mode) {
      case 'heatmap':
        return {
          title: 'Heatmap Analysis',
          advertiser: 'Shows high-intensity zones. If your product is "cold" (blue) in a search grid, your PPC budget is being wasted on impressions that get ignored.',
          customer: 'Represents general visual interest. Customers look at the red/hot zones first when scanning.'
        };
      case 'fogmap':
        return {
          title: 'Fog Map (The "3-Second Rule")',
          advertiser: 'Simulates peripheral vision during scrolling. It reveals what is visible in the first 50ms. If your USP is hidden in the fog, you lose the click.',
          customer: 'Mimics the brain’s initial filter (System 1 thinking). Only high-contrast, salient features penetrate the fog.'
        };
      case 'path':
        return {
          title: 'Attention Path Sequence',
          advertiser: 'Validates hierarchy. Are they seeing Brand -> Product -> Price in the right order? A chaotic path reduces trust and conversion.',
          customer: 'The order in which information is consumed. A logical path reduces cognitive load.'
        };
    }
  };

  const vizGuide = getVizGuide(vizMode);

  // Phase 1: Input View
  const renderInputPhase = () => (
    <div className="max-w-5xl mx-auto w-full animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        
        {/* Header */}
        <div className="bg-gray-900 p-8 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             <span className="w-8 h-8 rounded bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
               <Sparkles className="w-5 h-5 text-white" />
             </span>
             Amazon HeatMap Studio
          </h2>
          <p className="text-gray-400 mt-2">Amazon Conversion & PPC Optimization Studio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          
          {/* Left: Upload Area */}
          <div className="p-8 border-r border-gray-700 flex flex-col items-center justify-center bg-gray-800/50">
             
             {/* Dynamic Layout for A/B vs Single */}
             <div className={`w-full grid gap-4 ${isAB ? 'grid-cols-2' : 'grid-cols-1'}`}>
                
                {/* Upload A */}
                <div 
                   className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${previews[0] ? 'border-pink-500 bg-gray-900' : 'border-gray-600 hover:border-gray-400 hover:bg-gray-700/50'}`}
                   onClick={() => fileInputRefA.current?.click()}
                >
                    {previews[0] ? (
                      <div className="relative w-full h-full p-2">
                        <img src={previews[0]} alt="Preview A" className="w-full h-full object-contain rounded-lg" />
                        {isAB && <span className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">Image A</span>}
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-300 font-medium text-sm">{isAB ? 'Upload Control (A)' : 'Upload Asset'}</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRefA} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 0)} />
                </div>

                {/* Upload B (Only for A/B) */}
                {isAB && (
                   <div 
                   className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${previews[1] ? 'border-purple-500 bg-gray-900' : 'border-gray-600 hover:border-gray-400 hover:bg-gray-700/50'}`}
                   onClick={() => fileInputRefB.current?.click()}
                >
                    {previews[1] ? (
                      <div className="relative w-full h-full p-2">
                        <img src={previews[1]} alt="Preview B" className="w-full h-full object-contain rounded-lg" />
                        <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">Image B</span>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-300 font-medium text-sm">Upload Variant (B)</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRefB} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 1)} />
                </div>
                )}
             </div>

             {previews[0] && (
               <button 
                 onClick={(e) => { e.stopPropagation(); setFiles([]); setPreviews([]); }} 
                 className="mt-4 text-sm text-gray-400 hover:text-white underline"
               >
                 Clear Images
               </button>
             )}
          </div>

          {/* Right: Configuration */}
          <div className="p-8 flex flex-col justify-center">
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Layout className="w-5 h-5 text-pink-400" />
                Select Analysis Context
              </h3>
              
              <div className="space-y-3">
                {[
                  { id: AnalysisContext.HERO, icon: ImageIcon, label: "Product Hero Image", desc: "Main listing image (CTR focus)" },
                  { id: AnalysisContext.APLUS, icon: Layout, label: "A+ Content / Lifestyle", desc: "Detail page (Conversion focus)" },
                  { id: AnalysisContext.SEARCH, icon: Search, label: "Search Results", desc: "Compare against competitors" },
                  { id: AnalysisContext.STOREFRONT, icon: Store, label: "Brand Storefront", desc: "Brand equity and navigation" },
                  { id: AnalysisContext.AB_TEST, icon: Scale, label: "A/B Comparison Test", desc: "Compare two images for effectiveness" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                        setContext(opt.id);
                        // Reset files if switching modes to avoid confusion? 
                        // Actually keeping them is fine, just UI changes.
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${context === opt.id ? 'bg-pink-600/20 border-pink-500' : 'bg-gray-700/50 border-gray-700 hover:bg-gray-700 hover:border-gray-500'}`}
                  >
                    <div className={`p-2 rounded-lg ${context === opt.id ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-400 group-hover:text-white'}`}>
                       <opt.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className={`font-semibold ${context === opt.id ? 'text-white' : 'text-gray-200'}`}>{opt.label}</div>
                        <div className="text-xs text-gray-400">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto">
                <Button 
                className="w-full" 
                size="lg" 
                onClick={handleAnalyze} 
                disabled={!context || loading || (isAB ? files.length < 2 : files.length < 1)}
                isLoading={loading}
                >
                {getButtonText()}
                {!loading && (context) && <Wand2 className="ml-2 w-5 h-5" />}
                </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  // Phase 2: Analysis View
  const renderAnalysisPhase = () => {
    if (!result || !previews[0] || !context) return null;

    // Determine which image to show based on active index
    const activePreview = previews[activeImageIndex];
    // Determine which hotspots to show
    const activeHotspots = (activeImageIndex === 1 && result.hotspotsB) ? result.hotspotsB : result.hotspots;

    return (
      <div className="h-[calc(100vh-100px)] w-full max-w-[1600px] mx-auto animate-fade-in flex flex-col lg:flex-row gap-6">
        
        {/* Left: Visualizer */}
        <div className="flex-1 min-h-[500px] bg-gray-800 rounded-2xl p-4 shadow-2xl border border-gray-700 flex flex-col">
           <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 Visual Attention Lab
                 {isAB && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full border border-gray-600">
                        Viewing: {activeImageIndex === 0 ? 'Image A' : 'Image B'}
                    </span>
                 )}
              </h3>
              
              {/* Visualization Controls */}
              <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                 <button 
                    onClick={() => setVizMode('heatmap')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${vizMode === 'heatmap' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                 >
                    <Activity className="w-4 h-4" /> Heatmap
                 </button>
                 <button 
                    onClick={() => setVizMode('fogmap')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${vizMode === 'fogmap' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                 >
                    <Eye className="w-4 h-4" /> Fog Map
                 </button>
                 <button 
                    onClick={() => setVizMode('path')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${vizMode === 'path' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                 >
                    <Fingerprint className="w-4 h-4" /> Path
                 </button>
              </div>
           </div>

           {/* A/B Comparison Toggle (New) */}
           {isAB && (
             <div className="mb-4 flex items-center justify-center gap-4">
                 <button 
                   onClick={() => setActiveImageIndex(0)}
                   className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${activeImageIndex === 0 ? 'bg-pink-600 border-pink-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                 >
                    Image A (Control)
                 </button>
                 <ArrowRightLeft className="w-4 h-4 text-gray-500" />
                 <button 
                   onClick={() => setActiveImageIndex(1)}
                   className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${activeImageIndex === 1 ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                 >
                    Image B (Variant)
                 </button>
             </div>
           )}

           {/* Guide */}
           {!isAB && (
               <div className="mb-4 mx-2 bg-gray-900/80 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-pink-500/10 rounded-full flex-shrink-0">
                      <Info className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="w-full">
                      <h4 className="text-sm font-bold text-white mb-2">{vizGuide.title}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="bg-gray-800/50 p-2 rounded border border-gray-700/50">
                           <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wide block mb-1">Advertiser View</span>
                           <p className="text-xs text-gray-300 leading-relaxed">{vizGuide.advertiser}</p>
                        </div>
                        <div className="bg-gray-800/50 p-2 rounded border border-gray-700/50">
                           <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide block mb-1">Customer View</span>
                           <p className="text-xs text-gray-300 leading-relaxed">{vizGuide.customer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
           )}

           <div className="flex-1 relative bg-black/50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-700/50">
              <HeatmapOverlay 
                imageSrc={activePreview} 
                hotspots={activeHotspots} 
                mode={vizMode}
              />
           </div>
           
        </div>

        {/* Right: Analysis Report */}
        <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col h-full bg-gray-900">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-xl font-bold text-white">Strategic Report</h3>
             <button onClick={handleReset} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
               <RefreshCw className="w-4 h-4" /> New Analysis
             </button>
           </div>
           <AnalysisView result={result} context={context} />
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-8 flex items-center justify-center">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full">
         {step === 1 ? renderInputPhase() : renderAnalysisPhase()}
      </div>
    </div>
  );
};

export default App;