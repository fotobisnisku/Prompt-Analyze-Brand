import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, Lock, Check, Copy, AlertCircle, Loader2, History, Trash2, RotateCcw, Clock } from 'lucide-react';

const FONCE_PRODUCT_DETAILS = {
  "Wild Garden": `A smooth glossy clear thick-glass perfume bottle...` // (Data tetap utuh dari milik Anda, dipersingkat di panduan ini agar Anda bisa memasukkan ulang data Anda)
};
const PREDIRE_PRODUCT_DETAILS = {
  "Orange Poivree": `A cylindrical perfume bottle...`
};
const FEEL_ONE_ADULT_PRODUCTS = {
  "Sexy Lady": `A glossy transparent glass perfume bottle...`
};
const FEEL_ONE_KIDS_PRODUCTS = {
  "Bunny Cloud": `A bottle of perfume with a perfect glossy white...`
};

const FEEL_ONE_PRODUCT_DETAILS = { ...FEEL_ONE_ADULT_PRODUCTS, ...FEEL_ONE_KIDS_PRODUCTS };
const LOCK_OPTIONS = ["Lighting", "Camera Angle", "Composition", "Environment", "Color Tone", "Product Position", "Framing", "Mood"];

const BRANDS = {
  FONCE: { name: "Foncé", details: FONCE_PRODUCT_DETAILS, storageKey: "fonce_prompt_history", specRule: "Bottle geometry..." },
  PREDIRE: { name: "Predire", details: PREDIRE_PRODUCT_DETAILS, storageKey: "predire_prompt_history", specRule: "Bottle geometry..." },
  FEEL_ONE: { name: "Feel One", details: FEEL_ONE_PRODUCT_DETAILS, storageKey: "feelone_prompt_history", specRule: "Bottle geometry...", hasCategories: true, adultProducts: FEEL_ONE_ADULT_PRODUCTS, kidsProducts: FEEL_ONE_KIDS_PRODUCTS }
};

const getSystemPrompt = (brandName: string, specRule: string) => `MASTER PROMPT...`; // System prompt Anda

function PromptGeneratorTab({ brandConfig, isActive, onGeneratingStateChange }: any) {
  const { name: brandName, details: productDetailsMap, storageKey, specRule, hasCategories, adultProducts, kidsProducts } = brandConfig;
  const brandProducts = Object.keys(productDetailsMap);

  const [mainImage, setMainImage] = useState<any>(null);
  const [charImage, setCharImage] = useState<any>(null);
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingChar, setIsDraggingChar] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL');
  const [lockedParams, setLockedParams] = useState<string[]>([]);
  const [additionalText, setAdditionalText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [outputPrompt, setOutputPrompt] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const [history, setHistory] = useState<any[]>(() => {
    try { const saved = localStorage.getItem(storageKey); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedHistoryId, setCopiedHistoryId] = useState(null);

  useEffect(() => {
    if (onGeneratingStateChange) onGeneratingStateChange(isGenerating);
  }, [isGenerating, onGeneratingStateChange]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(history)); } catch (e) {}
  }, [history, storageKey]);

  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [smoothPos, setSmoothPos] = useState({ x: -1000, y: -1000 });
  const mainInputRef = useRef<HTMLInputElement>(null);
  const charInputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;
    const handleMouseMove = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const animateGlow = () => {
      setSmoothPos((prev) => {
        const factor = 0.12; return { x: prev.x + (cursorPos.x - prev.x) * factor, y: prev.y + (cursorPos.y - prev.y) * factor };
      });
      requestRef.current = requestAnimationFrame(animateGlow);
    };
    requestRef.current = requestAnimationFrame(animateGlow);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [cursorPos, isActive]);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      const statuses = ["Menganalisa DNA visual...", `Menginjeksi detail produk ${brandName}...`, "Menerapkan parameter kunci...", "Menyusun prompt fotografi..."];
      let idx = 0;
      setGenerationStatus(statuses[0]);
      interval = setInterval(() => { idx = (idx + 1) % statuses.length; setGenerationStatus(statuses[idx]); }, 2200);
    }
    return () => clearInterval(interval);
  }, [isGenerating, brandName]);

  const callKieAIWithBackoff = async (messagesPayload: any, maxRetries = 3) => {
    const activeApiKey = localStorage.getItem('KIE_API_KEY') || import.meta.env.VITE_KIE_FALLBACK_KEY;
    const activeModel = localStorage.getItem('KIE_MODEL') || 'kie-vision-model';
    if (!activeApiKey) throw new Error("API Key KIE AI belum diatur.");

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.kie.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeApiKey}` },
          body: JSON.stringify({ model: activeModel, messages: messagesPayload, temperature: 0.7 })
        });
        const data = await response.json();
        if (response.ok) return data;
        if (attempt === maxRetries) throw new Error(data.error?.message || 'Error API');
      } catch (err) {
        if (attempt === maxRetries) throw err;
      }
      await new Promise(resolve => setTimeout(resolve, [1000, 2000, 4000][attempt] || 1000));
    }
  };

  const generatePrompt = async () => { /* Logika sama seperti milik Anda */ };
  
  // Return render UI, semua `size="{12}"` dsb telah saya ganti menjadi `size={12}` pada kode sebelumnya.
  return <div className={isActive ? 'contents' : 'hidden'}> {/* UI Anda di sini */} </div>;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('FONCE');
  const [generatingTabs, setGeneratingTabs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=JetBrains+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
    const style = document.createElement('style');
    style.innerHTML = `body { background-color: #050505; color: white; }`; // Style minimalis untuk ringkas
    document.head.appendChild(style);
  }, []);

  const tabs = [{ id: 'FONCE', label: 'Foncé' }, { id: 'PREDIRE', label: 'Predire' }, { id: 'FEEL_ONE', label: 'Feel One' }];

  return (
    <div className="min-h-screen relative flex flex-col bg-[#050505]">
      <nav className="fixed top-0 z-50 flex justify-center py-4 px-4 w-full bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-2 ${activeTab === tab.id ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-400 border-white/10'}`}>
              {generatingTabs[tab.id] && <Loader2 className={`animate-spin ${activeTab === tab.id ? 'text-black' : 'text-amber-400'}`} size={12} />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
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