import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  X, 
  Lock, 
  Check, 
  Copy, 
  AlertCircle, 
  Loader2, 
  History, 
  Trash2, 
  RotateCcw, 
  Clock,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

// Data detail produk per brand
const FONCE_PRODUCT_DETAILS: Record<string, string> = {
  "Wild Garden": "A smooth glossy clear thick-glass perfume bottle with emerald green liquid, luxury minimalist golden typography, elegant aesthetic.",
  "Ocean Breeze": "A frosted ocean-blue glass perfume bottle with silver minimalist cap and crisp clean modern lines.",
  "Velvet Rose": "A deep crimson tinted glass perfume bottle with velvet matte finish and dark gold accents."
};

const PREDIRE_PRODUCT_DETAILS: Record<string, string> = {
  "Orange Poivree": "A cylindrical perfume bottle with amber glass, black matte textured cap, and premium editorial look.",
  "Midnight Oud": "An opaque obsidian black bottle with sharp architectural facets and luxury metallic label."
};

const FEEL_ONE_ADULT_PRODUCTS: Record<string, string> = {
  "Sexy Lady": "A glossy transparent glass perfume bottle with sensual curves, rose gold atomizer, and soft ambient glow.",
  "Urban Gent": "A heavy square glass bottle with smoked gradient and brushed titanium details."
};

const FEEL_ONE_KIDS_PRODUCTS: Record<string, string> = {
  "Bunny Cloud": "A playful pastel-toned bottle with smooth matte silicone protective sleeve and soft rounded cap.",
  "Candy Pop": "A bright translucent playful bottle with vibrant cheerful colors and bubbly aesthetic."
};

const FEEL_ONE_PRODUCT_DETAILS = { ...FEEL_ONE_ADULT_PRODUCTS, ...FEEL_ONE_KIDS_PRODUCTS };
const LOCK_OPTIONS = ["Lighting", "Camera Angle", "Composition", "Environment", "Color Tone", "Product Position", "Framing", "Mood"];

const BRANDS = {
  FONCE: { 
    name: "Foncé", 
    details: FONCE_PRODUCT_DETAILS, 
    storageKey: "fonce_prompt_history", 
    specRule: "Luxury minimalist editorial visual, clean studio setup, cinematic lighting, ultra-detailed glass reflections.",
    hasCategories: false
  },
  PREDIRE: { 
    name: "Predire", 
    details: PREDIRE_PRODUCT_DETAILS, 
    storageKey: "predire_prompt_history", 
    specRule: "High-end fashion editorial photography, bold contrast, premium textures, sophisticated luxury atmosphere.",
    hasCategories: false
  },
  FEEL_ONE: { 
    name: "Feel One", 
    details: FEEL_ONE_PRODUCT_DETAILS, 
    storageKey: "feelone_prompt_history", 
    specRule: "Contemporary lifestyle and dynamic mood, crisp daylight or expressive studio lights.",
    hasCategories: true, 
    adultProducts: FEEL_ONE_ADULT_PRODUCTS, 
    kidsProducts: FEEL_ONE_KIDS_PRODUCTS 
  }
};

function PromptGeneratorTab({ brandConfig, isActive, onGeneratingStateChange }: any) {
  const { name: brandName, details: productDetailsMap, storageKey, specRule, hasCategories, adultProducts, kidsProducts } = brandConfig;
  
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [charImage, setCharImage] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'ALL' | 'ADULT' | 'KIDS'>('ALL');
  const [lockedParams, setLockedParams] = useState<string[]>([]);
  const [additionalText, setAdditionalText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [outputPrompt, setOutputPrompt] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const [history, setHistory] = useState<any[]>(() => {
    try { 
      const saved = localStorage.getItem(storageKey); 
      return saved ? JSON.parse(saved) : []; 
    } catch (e) { return []; }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const charInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onGeneratingStateChange) onGeneratingStateChange(isGenerating);
  }, [isGenerating, onGeneratingStateChange]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(history)); } catch (e) {}
  }, [history, storageKey]);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      const statuses = [
        "Menganalisa DNA visual gambar...", 
        `Menginjeksi spesifikasi detail produk ${brandName}...`, 
        "Mengunci parameter fotografi...", 
        "Menyusun visual intelligence prompt final..."
      ];
      let idx = 0;
      setGenerationStatus(statuses[0]);
      interval = setInterval(() => { 
        idx = (idx + 1) % statuses.length; 
        setGenerationStatus(statuses[idx]); 
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, brandName]);

  const handleImageUpload = (file: File, type: 'main' | 'char') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'main') setMainImage(reader.result as string);
      else setCharImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleProduct = (prod: string) => {
    setSelectedProducts(prev => 
      prev.includes(prod) ? prev.filter(p => p !== prod) : [...prev, prod]
    );
  };

  const toggleLockParam = (param: string) => {
    setLockedParams(prev => 
      prev.includes(param) ? prev.filter(p => p !== param) : [...prev, param]
    );
  };

  const getDisplayedProducts = () => {
    if (!hasCategories || activeCategoryTab === 'ALL') return Object.keys(productDetailsMap);
    if (activeCategoryTab === 'ADULT') return Object.keys(adultProducts || {});
    return Object.keys(kidsProducts || {});
  };

  const generatePrompt = async () => {
    if (selectedProducts.length === 0 && !mainImage && !additionalText) {
      setError("Silakan pilih minimal satu produk, upload gambar referensi, atau isi instruksi tambahan.");
      return;
    }

    setIsGenerating(true);
    setError('');
    setOutputPrompt('');

    try {
      const selectedDetails = selectedProducts
        .map(p => `• Product "${p}": ${productDetailsMap[p] || 'Standard luxury edition'}`)
        .join('\n');

      const lockedText = lockedParams.length > 0 
        ? `Preserve and lock the following attributes: ${lockedParams.join(', ')}.` 
        : '';

      const apiKey = localStorage.getItem('KIE_API_KEY') || (import.meta.env.VITE_KIE_FALLBACK_KEY as string);
      
      // Jika API Key tersedia, lakukan request AI
      if (apiKey) {
        const messages: any[] = [
          {
            role: "system",
            content: `You are an expert Visual AI Prompt Engineer for ${brandName}. Style Spec: ${specRule}. Generate hyper-detailed photography Midjourney/StableDiffusion prompts.`
          },
          {
            role: "user",
            content: `Create a commercial photography prompt for brand "${brandName}".
Product specifications:
${selectedDetails || 'Standard Brand Line'}

Locked attributes: ${lockedText || 'None'}
Additional creative direction: ${additionalText || 'High-end studio campaign'}`
          }
        ];

        const res = await fetch('https://api.kie.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({ model: 'kie-vision-model', messages, temperature: 0.7 })
        });

        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        const data = await res.json();
        const generated = data.choices?.[0]?.message?.content || "Gagal menghasilkan output teks.";
        setOutputPrompt(generated);
        saveToHistory(generated);
      } else {
        // Fallback local prompt builder jika API Key belum dipasang
        await new Promise(r => setTimeout(r, 2500)); // Simulasi proses AI
        const fallbackResult = `/imagine prompt: Professional 8k commercial photography for ${brandName} perfume, featuring ${selectedProducts.join(' and ') || 'luxury bottle'}. ${selectedDetails ? '\n\n' + selectedDetails : ''} ${lockedText ? '\n\n' + lockedText : ''} ${additionalText ? `\n\nCreative Note: ${additionalText}` : ''} \n\nStyle: ${specRule}, shot on Hasselblad H6D-100c, 100mm f/2.8 macro lens, soft studio lighting, caustic reflections, ultra-realistic, volumetric light, editorial color grade --ar 16:9 --v 6.0 --style raw`;
        setOutputPrompt(fallbackResult);
        saveToHistory(fallbackResult);
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memproses prompt visual.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToHistory = (promptText: string) => {
    const newItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      products: [...selectedProducts],
      prompt: promptText
    };
    setHistory(prev => [newItem, ...prev.slice(0, 19)]);
  };

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedHistoryId(id);
      setTimeout(() => setCopiedHistoryId(null), 2000);
    } else {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!isActive) return null;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI: FORM KONTROL */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Brand */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Brand Workspace</span>
                <h2 className="text-2xl font-black text-white mt-1">{brandName} Visual Engine</h2>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl text-xs font-semibold text-white transition-all"
              >
                <History size={15} />
                <span>Riwayat ({history.length})</span>
              </button>
            </div>
          </div>

          {/* Upload Referensi */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <UploadCloud size={16} className="text-zinc-400" />
              Upload Referensi Gambar
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Main Ref */}
              <div 
                onClick={() => mainInputRef.current?.click()}
                className="border border-dashed border-white/20 hover:border-white/40 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] cursor-pointer bg-black/20 hover:bg-black/40 transition-all relative overflow-hidden group"
              >
                {mainImage ? (
                  <>
                    <img src={mainImage} alt="Main Ref" className="absolute inset-0 w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMainImage(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-full text-white"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <ImageIcon size={28} className="mx-auto text-zinc-500 group-hover:text-white transition-colors mb-2" />
                    <span className="text-xs font-semibold text-zinc-300">Gambar Produk / Mood</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input ref={mainInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'main')} />
              </div>

              {/* Character Ref */}
              <div 
                onClick={() => charInputRef.current?.click()}
                className="border border-dashed border-white/20 hover:border-white/40 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] cursor-pointer bg-black/20 hover:bg-black/40 transition-all relative overflow-hidden group"
              >
                {charImage ? (
                  <>
                    <img src={charImage} alt="Char Ref" className="absolute inset-0 w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCharImage(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-full text-white"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <ImageIcon size={28} className="mx-auto text-zinc-500 group-hover:text-white transition-colors mb-2" />
                    <span className="text-xs font-semibold text-zinc-300">Model / Karakter (Opsional)</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input ref={charInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'char')} />
              </div>
            </div>
          </div>

          {/* Pemilihan Produk */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Layers size={16} className="text-zinc-400" />
                Katalog Produk {brandName}
              </h3>
              
              {hasCategories && (
                <div className="flex bg-black/40 border border-white/10 rounded-full p-1 gap-1">
                  {(['ALL', 'ADULT', 'KIDS'] as const).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategoryTab(cat)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${activeCategoryTab === cat ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {getDisplayedProducts().map(prod => {
                const isSelected = selectedProducts.includes(prod);
                return (
                  <button
                    key={prod}
                    onClick={() => toggleProduct(prod)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                      isSelected 
                        ? 'bg-white text-black border-white shadow-lg' 
                        : 'bg-white/5 text-zinc-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {isSelected && <Check size={13} className="text-black" />}
                    <span>{prod}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parameter Kunci */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Lock size={16} className="text-zinc-400" />
              Lock Visual Parameter
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {LOCK_OPTIONS.map(param => {
                const isLocked = lockedParams.includes(param);
                return (
                  <button
                    key={param}
                    onClick={() => toggleLockParam(param)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isLocked 
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' 
                        : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Lock size={11} className={isLocked ? "text-amber-300" : "text-zinc-500"} />
                    <span>{param}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Tambahan */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-zinc-300 block">
              Instruksi / Catatan Kreatif Tambahan
            </label>
            <textarea 
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
              placeholder="Contoh: Tambahkan pantulan air di meja marmer hitam, pencahayaan golden hour dari sebelah kiri..."
              rows={3}
              className="w-full bg-black/40 border border-white/15 rounded-2xl p-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/50 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-200 p-4 rounded-2xl flex items-center gap-3 border border-red-400/30 text-xs font-semibold">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Tombol Generate */}
          <button
            onClick={generatePrompt}
            disabled={isGenerating}
            className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
              isGenerating 
                ? 'bg-white/10 text-zinc-400 cursor-not-allowed border border-white/10' 
                : 'bg-white text-black hover:bg-zinc-200 active:scale-[0.99] border border-white'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin text-zinc-400" size={18} />
                <span>{generationStatus || 'Memproses Visual...'}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze & Generate Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* KOLOM KANAN: OUTPUT HASIL & RIWAYAT */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Box Output Prompt */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl sticky top-24 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-white">Generated Prompt</span>
              </div>
              {outputPrompt && (
                <button
                  onClick={() => copyToClipboard(outputPrompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all shadow-md"
                >
                  {isCopied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                  <span>{isCopied ? 'Tersalin!' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-4 font-mono text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap selection:bg-white selection:text-black">
              {outputPrompt ? (
                outputPrompt
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 px-6">
                  <Sparkles size={36} className="mb-3 stroke-[1.5] text-zinc-700" />
                  <p className="font-sans font-medium text-xs">Prompt visual AI yang dihasilkan akan muncul di sini secara otomatis.</p>
                </div>
              )}
            </div>
          </div>

          {/* Drawer / List Riwayat */}
          {isHistoryOpen && (
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <History size={15} /> Riwayat Tersimpan
                </span>
                <button 
                  onClick={() => setHistory([])}
                  className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 size={13} /> Hapus Semua
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">Belum ada riwayat prompt tersimpan.</p>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="p-3.5 bg-black/40 border border-white/10 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span className="flex items-center gap-1"><Clock size={11} /> {item.date}</span>
                        <button 
                          onClick={() => copyToClipboard(item.prompt, item.id)} 
                          className="text-zinc-300 hover:text-white flex items-center gap-1 font-semibold"
                        >
                          {copiedHistoryId === item.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          <span>{copiedHistoryId === item.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-zinc-300 line-clamp-3 font-mono text-[11px]">{item.prompt}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('FONCE');
  const [generatingTabs, setGeneratingTabs] = useState<Record<string, boolean>>({});

  const tabs = [
    { id: 'FONCE', label: 'Foncé' }, 
    { id: 'PREDIRE', label: 'Predire' }, 
    { id: 'FEEL_ONE', label: 'Feel One' }
  ];

  return (
    <div className="min-h-screen relative flex flex-col bg-[#050505] text-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 z-50 flex justify-center py-4 px-4 w-full bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-5 py-2.5 rounded-full text-xs font-bold border flex items-center gap-2 transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-black border-white shadow-lg' 
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {generatingTabs[tab.id] && <Loader2 className={`animate-spin ${activeTab === tab.id ? 'text-black' : 'text-amber-400'}`} size={12} />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Konten */}
      {tabs.map((tab) => (
        <PromptGeneratorTab 
          key={tab.id} 
          brandConfig={BRANDS[tab.id as keyof typeof BRANDS]} 
          isActive={activeTab === tab.id} 
          onGeneratingStateChange={(isGen: boolean) => setGeneratingTabs(prev => ({...prev, [tab.id]: isGen}))}
        />
      ))}
    </div>
  );
}
