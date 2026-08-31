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
  Clock
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; // API Key disediakan oleh environment

// --- DATA DICTIONARIES ---

const FONCE_PRODUCT_DETAILS: any = {
  "Wild Garden": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Wild Garden" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Winter Bloom": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Winter Bloom" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Roses Vanille": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Roses Vanille" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Jardin De Fleurs": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Jardin De Fleurs" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Tuberose Absolu": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Tuberose Absolu" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Teased": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Teased" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Serenitea": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Serenitea" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Morning Tea": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Morning Tea" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Vanilla & Salt": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Vanilla & Salt" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Tabac Vanille": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Tabac Vanille" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Santal": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Santal" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Cloud Bath": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Cloud Bath" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible internal.`,
  "Tuberose De Noir": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Tuberose De Noir" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "La Nuit": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "La Nuit" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Casanova": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Casanova" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Bois De Cannabis": `A smooth glossy clear thick-glass perfume bottle with a heavy base, filled with pale yellow translucent liquid. Topped with a glossy black plastic cylindrical cap. The bottle body features minimalist black printed typography: "foncé A TIMELESS SCENT" logo on the left, separated by a central vertical line from the bold text "Bois De Cannabis" "EXTRAIT DE PARFUM" on the right. A transparent internal pump tube is visible inside.`,
  "Masquerade": `Elegant glossy black glass cylinder perfume bottle, shiny metallic gold cylinder cap, gold text "foncé" on the top, large gold text "Masquerade" in the middle, small gold text "Eau De Parfum" and "Privee Collection" on the bottom, the surface texture of the bottle is smooth and reflective.`,
  "Darlingtonia": `Glossy transparent pale green glass perfume bottle, glossy white plastic cap, shiny gold spray collar, transparent pump tube, transparent pale green liquid inside. Glossy white printed text on bottle: "foncé" logo top center, large text "Darlingtonia" and medium text "EXTRAIT DE PARFUM" in center, "Special Collection" and "50 ml" at bottom.`,
  "Undergreen": `The glass bottle is a deep dark green with black gradation at the bottom. The black glossy plastic cap. Inside the glass bottle, the pump hose is barely visible. On the front of the bottle, there is a direct white print with a matte texture containing: the "foncé" logo at the top, large typography in the center that says "Undergreen", typography below that says "Extrait De Parfum", and small typography at the bottom that says "Special Collection 50 ml".`,
  "Bouquet Profusion": `A smooth glossy clear thick-glass perfume bottle with a heavy base, gold spray collar, topped with a glossy white plastic cylindrical cap. The bottle is filled with a thick yellow liquid. White printed text on the glass front reads: top logo "foncé", large center text "Bouquet Profusion", medium text "Extrait De Parfum" below it, and small text "Special Collection" at the bottom. A curved transparent spray tube is visible inside the liquid.`,
  "Fleur De Cola": `The glass bottle is a dark red with black gradation on the top. The black plastic cap is glossy. Inside the glass bottle, the pump hose is barely visible. On the front of the bottle there is a direct print with a matte texture containing: the "foncé" logo on the top, large typography in the center that says "Fleur De Cola", typography below that says "Extrait De Parfum", and small typography at the bottom that says "Special Collection 50 ml".`,
  "Émeraude": `A smooth glossy clear thick-glass perfume bottle with a heavy flat base, filled with a translucent emerald green gradient liquid that transitions into a deep amber-brown tone toward the bottom. The bottle features rounded shoulders with a clean minimalist cylindrical silhouette. Topped with a tall glossy white plastic cylindrical cap. A thin transparent internal pump tube is visible inside. The front surface features centered gold metallic typography: the brand name foncé, followed by a small letter x and the JFC JAKARTA FRAGRANCE CLUB logo, above the product name ÉMERAUDE in large elegant serif lettering, with Extrait De Parfum underneath and Special Collection 50 ml near the lower edge.`,
  "Grand Gala": `A smooth glossy clear thick-glass perfume bottle with a heavy flat base, filled with a translucent smoked black gradient liquid that transitions into a darker tone toward the bottom. The bottle features rounded shoulders with a clean minimalist cylindrical silhouette. Topped with a tall glossy black plastic cylindrical cap. A thin transparent internal pump tube is visible inside. The front surface features centered gold metallic typography: the brand name foncé, followed by a small letter x and the JFC JAKARTA FRAGRANCE CLUB logo, above the product name GRAND GALA in large elegant serif lettering, with Extrait De Parfum underneath and Special Collection 50 ml near the lower edge.`
};

const PREDIRE_PRODUCT_DETAILS: any = {
  "Orange Poivree": `A cylindrical perfume bottle. It features a deep black cylindrical cap with a smooth surface and a glossy finish. The bottle is made of transparent cylindrical glass with a thick orange-colored base and thick orange glass walls. Inside, the perfume liquid is a clear transparent orange, complete with a clear spray tube curving down to the base. Solid white text is directly printed on the glass bottle: “Predire” at the top, “Orange Poivree” in the center, and “50ml Extrait De Perfume” at the bottom, all in a clean minimalist font.`,
  "Delish Library": `A cylindrical perfume bottle. It features a deep black cylindrical cap with a smooth surface and a glossy finish. The bottle is made of matte white cylindrical glass with a thick base and thick glass walls. Solid black text is directly printed on the glass bottle: “Predire” at the top, “Delish Library” in the center, and “50ml Extrait De Perfume” at the bottom, all in a clean minimalist font.`,
  "Honey Of The Valley": `A cylindrical perfume bottle. It features a deep black cylindrical cap with a smooth surface and a glossy finish. The bottle is made of honey-yellow cylindrical glass with a thick honey-yellow base and thick glass walls. Inside, the perfume liquid is a clear transparent honey yellow, complete with a clear spray tube curving down to the base. Solid white text is directly printed on the glass bottle: “Predire” at the top, “Honey Of The Valley” in the center, and “50ml Extrait De Perfume” at the bottom, all in a clean minimalist font.`,
  "Forbidden Iris": `A cylindrical perfume bottle. It features a deep black cylindrical cap with a smooth surface and a glossy finish. The bottle is made of transparent cylindrical glass with a thick base and thick glass walls in a bright bluish-purple tone. Inside, the perfume liquid is a clear transparent blue, complete with a clear spray tube curving down to the base. Solid white text is directly printed on the glass bottle: “Predire” at the top, “Forbidden Iris” in the center, and “50ml Extrait De Perfume” at the bottom, all in a clean minimalist font.`,
  "Caribbean Sunset": `A cylindrical perfume bottle. It features a deep black cylindrical cap with a smooth surface and a glossy finish. The bottle is made of transparent cylindrical glass with a thick dark brown base and thick dark brown glass walls. Inside, the perfume liquid is brown, complete with a clear spray tube curving down to the base. Solid white text is directly printed on the glass bottle: “Predire” at the top, “Caribbean Sunset” in the center, and “50ml Extrait De Perfume” at the bottom, all in a clean minimalist font.`,
  "Or Noir Absolu": `A cylindrical perfume bottle. It features a deep black cylindrical cap with a smooth surface and a glossy finish. The bottle is made of fully glossy black cylindrical glass. Solid white text is directly printed on the glass bottle: “Predire” at the top, “Or Noir Absolu” in the center, and “50ml Extrait De Perfume” at the bottom, all in a clean minimalist font.`
};

const FEEL_ONE_ADULT_PRODUCTS: any = {
  "Sexy Lady": `A glossy transparent glass perfume bottle, square-shaped with rounded corners, featuring an embossed dotted texture on the right and left sides, and a transparent pump tube mechanism inside. The bottle has a glossy whitish-pink plastic spherical cap and contains a transparent pink liquid. A glossy whitish-pink label is printed directly onto the glass, featuring a lip icon graphic, with the main typography "Sexy Lady" in the center, followed by smaller text below reading "extrait de parfum", "℮ 35 ml 1.2 fl.oz", and "vaporisateur natural spray" at the very bottom.`,
  "The Gentleman": `A glossy transparent glass perfume bottle, square-shaped with rounded corners, featuring an embossed dotted texture on the right and left sides, and a transparent pump tube mechanism inside. The bottle has a glossy black plastic spherical cap and contains a transparent yellow liquid. A glossy black label is printed directly onto the glass, with the main typography "THE GENTLEMAN" in the center, followed by smaller text below reading "extrait de parfum", "℮ 35 ml 1.2 fl.oz", and "vaporisateur natural spray" at the very bottom.`,
  "Independent Woman": `A glossy transparent glass perfume bottle, square-shaped with rounded corners, featuring an embossed dotted texture on the right and left sides, and a transparent pump tube mechanism inside. The bottle has a glossy black plastic spherical cap and contains a transparent bright yellow liquid. A glossy black label is printed directly onto the glass, with the main typography "INDEPENDENT WOMAN" in the center, followed by smaller text below reading "extrait de parfum", "℮ 35 ml 1.2 fl.oz", and "vaporisateur natural spray" at the very bottom.`,
  "Moonlight": `A glossy transparent glass perfume bottle, square-shaped with rounded corners, featuring an embossed dotted texture on the right and left sides, and a transparent pump tube mechanism inside. The bottle has a glossy black plastic spherical cap and contains a transparent pale yellow liquid. A glossy black label is printed directly onto the glass, with the main typography "MOONLIGHT" in the center, followed by smaller text below reading "extrait de parfum", "℮ 35 ml 1.2 fl.oz", and "vaporisateur natural spray" at the very bottom.`,
  "Oud Rose": `A glossy transparent glass perfume bottle, square-shaped with rounded corners, featuring an embossed dotted texture on the right and left sides, and a transparent pump tube mechanism inside. The bottle has a glossy black plastic spherical cap and contains a transparent deep red liquid. A glossy gold label is printed directly onto the glass, with the main typography "OUD ROSE" in the center, followed by smaller text below reading "extrait de parfum", "℮ 35 ml 1.2 fl.oz", and "vaporisateur natural spray" at the very bottom.`,
  "Arabian Night": `A glossy transparent glass perfume bottle, square-shaped with rounded corners, featuring an embossed dotted texture on the right and left sides, and a transparent pump tube mechanism inside. The bottle has a glossy black plastic spherical cap and contains a transparent amber liquid. A glossy gold label is printed directly onto the glass, with the main typography "ARABIAN NIGHT" in the center, followed by smaller text below reading "extrait de parfum", "℮ 35 ml 1.2 fl.oz", and "vaporisateur natural spray" at the very bottom.`,
  "Heartbeat": `A glossy transparent glass perfume bottle, square-shaped with rounded corners, featuring an embossed dotted texture on the right and left sides, and a transparent pump tube mechanism inside. The bottle has a glossy cornflower blue plastic spherical cap and contains a transparent light blue liquid. A glossy white label is printed directly onto the glass, featuring an electrocardiogram graphic, with the main typography "HEARTBEAT" in the center, followed by smaller text below reading "extrait de parfum", "℮ 35 ml 1.2 fl.oz", and "vaporisateur natural spray" at the very bottom.`
};

const FEEL_ONE_KIDS_PRODUCTS: any = {
  "Bunny Cloud": `A bottle of perfume with a perfect glossy white plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear pink liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Bunny Cloud, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Butterfly Bloom": `A bottle of perfume with a perfect glossy pink plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear pink liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Butterfly Bloom, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Cuddle Puppy": `A bottle of perfume with a perfect glossy white plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear yellowish liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Cuddle Puppy, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Dino Roar": `A bottle of perfume with a perfect glossy black plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear light green liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Dino Roar, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Lion Buddy": `A bottle of perfume with a perfect glossy black plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear light yellow liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Lion Buddy, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Little Doctor": `A bottle of perfume with a perfect glossy pink plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear light pink liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Little Doctor, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Magic Unicorn": `A bottle of perfume with a perfect glossy white plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear light purple liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Magic Unicorn, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Mini Elephant": `A bottle of perfume with a perfect glossy blue plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear blue liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Mini Elephant, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Police Hero": `A bottle of perfume with a perfect glossy black plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear light blue liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Police Hero, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Safari Giraffe": `A bottle of perfume with a perfect glossy black plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear yellow liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Safari Giraffe, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Sea Mermaid": `A bottle of perfume with a perfect glossy white plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear sea blue liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Sea Mermaid, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Sky Pilot": `A bottle of perfume with a perfect glossy white plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear light blue liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Sky Pilot, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Space Kid": `A bottle of perfume with a perfect glossy white plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear light blue liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Space Kid, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`,
  "Teddy Hug": `A bottle of perfume with a perfect glossy black plastic ball cap. A glossy transparent glass cylindrical bottle with a thick glass base contains a clear yellow liquid, displaying the transparent pump mechanism inside. On the bottle body, there is a label with a cartoon illustration of Teddy Hug, small text at the bottom "EAU DE PARFUM ℮ 35 ml 1.18 fl.oz.", and a small circular monogram logo.`
};

const FEEL_ONE_PRODUCT_DETAILS = {
  ...FEEL_ONE_ADULT_PRODUCTS,
  ...FEEL_ONE_KIDS_PRODUCTS
};

const LOCK_OPTIONS = [
  "Lighting", "Camera Angle", "Composition", 
  "Environment", "Color Tone", "Product Position", 
  "Framing", "Mood"
];

const BRANDS: any = {
  FONCE: {
    name: "Foncé",
    details: FONCE_PRODUCT_DETAILS,
    storageKey: "fonce_prompt_history",
    specRule: "Bottle geometry, shape, thickness, heavy base, and glass finish. Cap shape, material, finish, and exact color. Liquid translucency, exact color tone, gradient transitions, and internal pump tube visibility. ALL typography, text quotes, font styling (e.g., serif, bold), and logo placements verbatim as provided. Spray collar material/color and special collection markings."
  },
  PREDIRE: {
    name: "Predire",
    details: PREDIRE_PRODUCT_DETAILS,
    storageKey: "predire_prompt_history",
    specRule: "Bottle geometry, shape, thickness, heavy base, and glass finish. Cap shape, material, finish, and exact color. Liquid translucency, exact color tone, gradient transitions, and internal pump tube visibility. ALL typography, text quotes, font styling (e.g., serif, bold), and logo placements verbatim as provided. Spray collar material/color and special collection markings."
  },
  FEEL_ONE: {
    name: "Feel One",
    details: FEEL_ONE_PRODUCT_DETAILS,
    storageKey: "feelone_prompt_history",
    specRule: "Bottle geometry & glass shape (e.g. square-shaped with rounded corners & embossed dotted texture for ADULT series, or glossy transparent cylindrical bottle with thick glass base for KIDS series). Cap shape & finish (e.g. spherical cap / ball cap with exact plastic color and gloss). Liquid translucency, exact liquid color, and internal transparent pump mechanism. ALL typography, quotes, cartoon illustrations / graphics, and monogram logos verbatim as provided. Bottom markings and size designations ('eau de parfum / extrait de parfum', '35 ml', etc.).",
    hasCategories: true, // Flag khusus untuk Feel One agar merender filter kategori
    adultProducts: FEEL_ONE_ADULT_PRODUCTS,
    kidsProducts: FEEL_ONE_KIDS_PRODUCTS
  }
};

const getSystemPrompt = (brandName: string, specRule: string) => `
MASTER PROMPT
PHOTOGRAPHY REFERENCE ANALYZER & FULL PRODUCT SPECIFICATION INJECTION ENGINE
════════════════════════════════════════════════════════════════

ROLE:
You are a Professional Brand Art Director, Commercial Photographer, Visual Analyst, and Photography Prompt Architect.
Your task is to analyze the user's MAIN REFERENCE IMAGE, extract its photographic DNA (lighting, angle, composition, environment, color grading, camera feel), and replace the original reference product with the FULL, UNABRIDGED SPECIFICATIONS of ALL selected products from the ${brandName} PRODUCT LIBRARY.

CRITICAL MANDATES FOR PRODUCT SPECIFICATION (ZERO SUMMARIZATION):
1. MANDATORY FULL PHYSICAL SPECIFICATIONS:
   - When one or more products are provided, you MUST include the FULL, DETAILED physical identity of EVERY SINGLE selected product into the SUBJECT section of the prompt.
   - DO NOT summarize, DO NOT shorten, DO NOT generalize, DO NOT condense, and DO NOT replace product specifications with just names.
   - For EACH selected product, you MUST describe:
     * ${specRule}

2. MULTI-PRODUCT SCENE COMPOSITION:
   - If multiple products are selected (e.g., 2 or more), arrange ALL of them together in the scene (e.g., side-by-side lineup, staggered luxury arrangement, or layered foreground/midground composition consistent with the reference framing).
   - Write out the complete physical description of Product 1, followed by the complete physical description of Product 2, Product 3, etc., clearly positioned within the subject clause.

3. PRESERVE PHOTOGRAPHY BLUEPRINT:
   - Preserve the reference image's camera angle, lighting setup, framing, background/environment, color palette, surface finish, and visual mood.
   - Obey all LOCK parameters strictly.
   - Incorporate Additional Instructions without overriding product identities or locks.

4. ZERO COMMENTARY:
   - Output ONLY the single final photography prompt. No greetings, no explanations, no markdown blocks.
   - The final prompt MUST end with a period.

FINAL PROMPT FORMAT:
[Shot Type] of [Subject: Full Unabridged Product Identity & Exact Specifications for ALL selected products arranged together], [Pose + Framing + Composition], in/against [Environment + Background], color palette – [Dominant + Accent + Shadow Tone + Highlight Tone], [Surface Finish], [Creative Direction], Atmosphere – [Mood], [Symbolism - if relevant], hyperrealistic detail, ultra sharp focus, [Lighting + Aesthetic], shot on [Camera + Lens + Technical].
`;

// --- COMPONENT DINAMIS TAB UTAMA ---
function PromptGeneratorTab({ brandConfig, isActive, onGeneratingStateChange }: any) {
  const { name: brandName, details: productDetailsMap, storageKey, specRule, hasCategories, adultProducts, kidsProducts } = brandConfig;
  const brandProducts = Object.keys(productDetailsMap);

  const [mainImage, setMainImage] = useState<any>(null);
  const [charImage, setCharImage] = useState<any>(null);
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingChar, setIsDraggingChar] = useState(false);
  
  // State for products and filtering (khusus Feel One)
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL'); // 'ALL' | 'ADULT' | 'KIDS'

  const [lockedParams, setLockedParams] = useState<any[]>([]);
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
    } catch (e) {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedHistoryId, setCopiedHistoryId] = useState<any>(null);

  // Beritahu parent component jika tab ini sedang generating
  useEffect(() => {
    if (onGeneratingStateChange) {
      onGeneratingStateChange(isGenerating);
    }
  }, [isGenerating, onGeneratingStateChange]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (e) {
      console.error("Gagal menyimpan riwayat", e);
    }
  }, [history, storageKey]);

  // Mouse position state for smooth brush glow
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [smoothPos, setSmoothPos] = useState({ x: -1000, y: -1000 });

  const mainInputRef = useRef<any>(null);
  const charInputRef = useRef<any>(null);
  const requestRef = useRef<any>(null);

  useEffect(() => {
    if (!isActive) return;
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const animateGlow = () => {
      setSmoothPos((prev) => {
        const factor = 0.12;
        return {
          x: prev.x + (cursorPos.x - prev.x) * factor,
          y: prev.y + (cursorPos.y - prev.y) * factor,
        };
      });
      requestRef.current = requestAnimationFrame(animateGlow);
    };

    requestRef.current = requestAnimationFrame(animateGlow);
    return () => cancelAnimationFrame(requestRef.current);
  }, [cursorPos, isActive]);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      const statuses = [
        "Menganalisa DNA visual...", 
        `Menginjeksi detail produk ${brandName}...`, 
        "Menerapkan parameter kunci...", 
        "Menyusun prompt fotografi..."
      ];
      let idx = 0;
      setGenerationStatus(statuses[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % statuses.length;
        setGenerationStatus(statuses[idx]);
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [isGenerating, brandName]);

  const processImageFile = (file: any, setImageFn: any) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Harap unggah file gambar yang valid.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFn({
        file: file,
        dataUrl: reader.result,
        mimeType: file.type,
        base64: (reader.result as string).split(',')[1]
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: any, setImageFn: any) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, setImageFn);
    }
  };

  const handleDragOver = (e: any, setDragState: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(true);
  };

  const handleDragLeave = (e: any, setDragState: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);
  };

  const handleDrop = (e: any, setImageFn: any, setDragState: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file, setImageFn);
    }
  };

  const toggleSelection = (item: any, list: any[], setList: any) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleCopy = () => {
    if (!outputPrompt) return;
    const textArea = document.createElement("textarea");
    textArea.value = outputPrompt;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error("Gagal menyalin teks", e);
    }
    document.body.removeChild(textArea);
  };

  const callGeminiWithBackoff = async (payload: any, maxRetries = 5) => {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          return data;
        }

        if (attempt === maxRetries) {
          throw new Error(data.error?.message || 'Terjadi gangguan saat memproses gambar.');
        }
      } catch (err) {
        if (attempt === maxRetries) {
          throw err;
        }
      }
      await new Promise(resolve => setTimeout(resolve, delays[attempt] || 1000));
    }
  };

  const generatePrompt = async () => {
    if (!mainImage) {
      setError("Main Reference Image wajib diunggah.");
      return;
    }

    setIsGenerating(true);
    setError('');
    setOutputPrompt('');

    try {
      const productCount = selectedProducts.length;
      const productLibraryText = productCount > 0 
        ? selectedProducts.map((name, i) => `--- PRODUCT ${i + 1} OF ${productCount}: ${name} ---\nFULL PRODUCT SPECIFICATION (MUST BE FULLY WRITTEN IN THE PROMPT SUBJECT):\n${productDetailsMap[name] || name}`).join('\n\n')
        : 'None specified.';

      const userInstructionText = `
[MANDATORY PRODUCT COUNT: ${productCount}]
[USER PRODUCT LIBRARY - EVERY SPECIFICATION BELOW MUST BE FULLY AND EXHAUSTIVELY INCLUDED IN THE FINAL PROMPT SUBJECT WITHOUT SUMMARIZATION]:
${productLibraryText}

[ADDITIONAL TEXT / PROMPT]
${additionalText.trim() || 'None'}

[LOCK PARAMETERS - HIGHEST PRIORITY]
${lockedParams.length > 0 ? lockedParams.map(p => `Lock ${p.toLowerCase()}`).join(', ') : 'None'}
      `;

      const promptRequestText = productCount > 0
        ? `Analyze the attached MAIN REFERENCE IMAGE based on the system instructions.
CRITICAL ENFORCEMENT: Exactly ${productCount} product(s) are selected (${selectedProducts.join(', ')}). 
You MUST embed the FULL, COMPLETE, and UNABRIDGED physical specification of EACH selected product into the SUBJECT section of your output prompt. DO NOT summarize or omit any detail.`
        : `Analyze the attached MAIN REFERENCE IMAGE based on the system instructions and construct the photography prompt.`;

      const contents: any[] = [
        {
          role: "user",
          parts: [
            { text: promptRequestText },
            { inlineData: { mimeType: mainImage.mimeType, data: mainImage.base64 } }
          ]
        }
      ];

      if (charImage) {
        contents[0].parts.push({ text: "Also consider this CHARACTER REFERENCE IMAGE:" });
        contents[0].parts.push({ inlineData: { mimeType: charImage.mimeType, data: charImage.base64 } });
      }

      contents[0].parts.push({ text: userInstructionText });

      const payload = {
        contents,
        systemInstruction: {
          parts: [{ text: getSystemPrompt(brandName, specRule) }]
        }
      };

      const data = await callGeminiWithBackoff(payload);

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        const cleanText = generatedText.replace(/```[a-z]*\n?/gi, '').trim();
        setOutputPrompt(cleanText);

        const newHistoryEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString([], { day: 'numeric', month: 'short' }),
          prompt: cleanText,
          products: [...selectedProducts],
          locks: [...lockedParams],
          mainImageThumb: mainImage.dataUrl,
          additionalText: additionalText.trim()
        };
        setHistory(prev => [newHistoryEntry, ...prev]);
      } else {
        throw new Error('AI tidak memberikan respon teks.');
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyHistoryPrompt = (item: any) => {
    const textArea = document.createElement("textarea");
    textArea.value = item.prompt;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedHistoryId(item.id);
      setTimeout(() => setCopiedHistoryId(null), 2000);
    } catch (e) {
      console.error("Gagal menyalin riwayat", e);
    }
    document.body.removeChild(textArea);
  };

  const restoreHistoryItem = (item: any) => {
    setOutputPrompt(item.prompt);
    if (item.products && item.products.length > 0) {
      setSelectedProducts(item.products);
    }
    if (item.locks) {
      setLockedParams(item.locks);
    }
    if (item.additionalText) {
      setAdditionalText(item.additionalText);
    }
    setIsHistoryOpen(false);
  };

  return (
    <div className={isActive ? 'contents' : 'hidden'}>
      {/* Smooth Brush Glow Pointer Layer */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(600px circle at ${smoothPos.x}px ${smoothPos.y}px, rgba(255, 255, 255, 0.085), transparent 80%)`,
        }}
      />
      {/* Secondary Ambient Accent Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(350px circle at ${smoothPos.x}px ${smoothPos.y}px, rgba(255, 255, 255, 0.05), transparent 70%)`,
        }}
      />

      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-40 mt-16 md:mt-14">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="group relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-xl border border-white/20 text-white text-xs font-semibold tracking-wide transition-all duration-300 shadow-lg hover:border-white/40"
          title="Buka Riwayat Prompt"
        >
          <History className="text-zinc-300 group-hover:text-white transition-colors" size="{15}"/>
          <span className="hidden sm:inline">History</span>
          {history.length > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-white text-black rounded-full shadow-sm">
              {history.length}
            </span>
          )}
        </button>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center py-8 px-4 md:px-6 w-full max-w-4xl mx-auto relative z-10 pt-24 md:pt-28">
        
        {/* Minimalist Header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-widest uppercase mb-3 shadow-sm">
            <span>{brandName}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Analyze Prompt
          </h1>
        </div>

        {/* Frosted Glass Main Card */}
        <div className="w-full bg-white/25 backdrop-blur-2xl p-6 md:p-9 rounded-[32px] card-shadow-frosted border border-white/30 relative">
          
          {/* Smooth Disappearing Error Alert */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${error ? 'max-h-24 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
            <div className="bg-red-500/20 text-red-200 p-3.5 rounded-2xl flex items-center gap-3 border border-red-400/30 text-xs font-semibold backdrop-blur-md">
              <AlertCircle className="shrink-0 text-red-400" size="{16}"/>
              <span>{error}</span>
            </div>
          </div>

          <div className="space-y-7">
            {/* Image Upload Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Main Reference */}
              <div className="flex flex-col items-center">
                <div className="text-center mb-2.5">
                  <div className="text-xs font-bold text-white tracking-wide uppercase">
                    Main Reference <span className="text-red-400 font-bold">*</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-medium mt-0.5">Visual Blueprint</div>
                </div>
                
                <div 
                  onClick={() => !mainImage && mainInputRef.current?.click()}
                  onDragOver={(e) => handleDragOver(e, setIsDraggingMain)}
                  onDragLeave={(e) => handleDragLeave(e, setIsDraggingMain)}
                  onDrop={(e) => handleDrop(e, setMainImage, setIsDraggingMain)}
                  className={`w-full relative group rounded-[22px] transition-all duration-300 flex flex-col items-center justify-center h-48 cursor-pointer border overflow-hidden
                    ${isDraggingMain 
                      ? 'border-white bg-white/20 scale-[1.01]' 
                      : mainImage 
                        ? 'border-white/20 bg-black/30' 
                        : 'border-dashed border-white/30 bg-black/20 hover:bg-white/10 hover:border-white/60'}`}
                >
                  {mainImage ? (
                    <>
                      <img src={mainImage.dataUrl} alt="Main Blueprint" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setMainImage(null); }} 
                          className="bg-white text-zinc-900 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-md"
                          title="Hapus gambar"
                        >
                          <X size="{16}"/>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white mb-2.5 group-hover:scale-105 transition-all shadow-sm">
                        <UploadCloud size="{18}"/>
                      </div>
                      <p className="text-xs font-bold text-white">Unggah Gambar Utama</p>
                      <p className="text-[10px] text-zinc-300 mt-0.5">Drag & drop atau klik (Maks. 5MB)</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={mainInputRef} onChange={(e) => handleImageUpload(e, setMainImage)} className="hidden" />
                </div>
              </div>

              {/* Character Reference */}
              <div className="flex flex-col items-center">
                <div className="text-center mb-2.5">
                  <div className="text-xs font-bold text-white tracking-wide uppercase">
                    Character Reference
                  </div>
                  <div className="text-[11px] text-zinc-300 font-medium mt-0.5">Opsional</div>
                </div>
                
                <div 
                  onClick={() => !charImage && charInputRef.current?.click()}
                  onDragOver={(e) => handleDragOver(e, setIsDraggingChar)}
                  onDragLeave={(e) => handleDragLeave(e, setIsDraggingChar)}
                  onDrop={(e) => handleDrop(e, setCharImage, setIsDraggingChar)}
                  className={`w-full relative group rounded-[22px] transition-all duration-300 flex flex-col items-center justify-center h-48 cursor-pointer border overflow-hidden
                    ${isDraggingChar 
                      ? 'border-white bg-white/20 scale-[1.01]' 
                      : charImage 
                        ? 'border-white/20 bg-black/30' 
                        : 'border-dashed border-white/30 bg-black/20 hover:bg-white/10 hover:border-white/60'}`}
                >
                  {charImage ? (
                    <>
                      <img src={charImage.dataUrl} alt="Character Reference" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCharImage(null); }} 
                          className="bg-white text-zinc-900 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-md"
                          title="Hapus gambar"
                        >
                          <X size="{16}"/>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-zinc-200 mb-2.5 group-hover:scale-105 transition-all shadow-sm">
                        <ImageIcon size="{18}"/>
                      </div>
                      <p className="text-xs font-bold text-zinc-100">Model / Karakter</p>
                      <p className="text-[10px] text-zinc-300 mt-0.5">Drag & drop atau klik (Opsional)</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={charInputRef} onChange={(e) => handleImageUpload(e, setCharImage)} className="hidden" />
                </div>
              </div>
            </div>

            {/* Product Library Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-white tracking-wide uppercase">
                  Select Product Library
                </label>
                {selectedProducts.length > 0 && (
                  <span className="text-[11px] font-bold text-black bg-white px-2.5 py-0.5 rounded-full shadow-xs">
                    {selectedProducts.length} dipilih
                  </span>
                )}
              </div>

              {/* Tampilkan filter kategori JIKA flag hasCategories = true (kasus Feel One) */}
              {hasCategories && (
                <div className="flex items-center gap-1.5 p-1 bg-black/35 rounded-xl border border-white/15 backdrop-blur-md mb-3">
                  {[
                    { id: 'ALL', label: 'All Series' },
                    { id: 'ADULT', label: 'Adult' },
                    { id: 'KIDS', label: 'Kids' }
                  ].map((tab) => {
                    const isActive = activeCategoryTab === tab.id;
                    const adultCount = selectedProducts.filter(p => Object.keys(adultProducts).includes(p)).length;
                    const kidsCount = selectedProducts.filter(p => Object.keys(kidsProducts).includes(p)).length;
                    const badge = tab.id === 'ADULT' ? adultCount : tab.id === 'KIDS' ? kidsCount : selectedProducts.length;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveCategoryTab(tab.id)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5
                          ${isActive 
                            ? 'bg-white text-black shadow-sm' 
                            : 'text-zinc-400 hover:text-white hover:bg-white/10'
                          }`}
                      >
                        <span>{tab.label}</span>
                        {badge > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive ? 'bg-black text-white' : 'bg-white/20 text-white'
                          }`}>
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Rendering list produk berdasarkan kategori aktif atau semua (jika bukan Feel One) */}
              <div className="max-h-48 overflow-y-auto custom-scroll p-1 space-y-3 bg-black/20 rounded-2xl border border-white/10 p-2.5">
                {hasCategories ? (
                  <>
                    {/* Bagian Adult Series */}
                    {(activeCategoryTab === 'ALL' || activeCategoryTab === 'ADULT') && (
                      <div>
                        {activeCategoryTab === 'ALL' && (
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 inline-block"></span>
                            ADULT SERIES
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {Object.keys(adultProducts).map((prod) => {
                            const isSelected = selectedProducts.includes(prod);
                            return (
                              <button
                                key={prod}
                                type="button"
                                onClick={() => toggleSelection(prod, selectedProducts, setSelectedProducts)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                                  ${isSelected 
                                    ? 'bg-white text-black border-white shadow-sm font-bold scale-[1.02]' 
                                    : 'bg-black/30 text-zinc-200 border-white/20 hover:border-white/50 hover:bg-white/15'
                                  }`}
                              >
                                {prod}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Bagian Kids Series */}
                    {(activeCategoryTab === 'ALL' || activeCategoryTab === 'KIDS') && (
                      <div>
                        {activeCategoryTab === 'ALL' && (
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 mt-3 px-1 flex items-center gap-1.5 border-t border-white/10 pt-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block"></span>
                            KIDS SERIES
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {Object.keys(kidsProducts).map((prod) => {
                            const isSelected = selectedProducts.includes(prod);
                            return (
                              <button
                                key={prod}
                                type="button"
                                onClick={() => toggleSelection(prod, selectedProducts, setSelectedProducts)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                                  ${isSelected 
                                    ? 'bg-white text-black border-white shadow-sm font-bold scale-[1.02]' 
                                    : 'bg-black/30 text-zinc-200 border-white/20 hover:border-white/50 hover:bg-white/15'
                                  }`}
                              >
                                {prod}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Rendering normal untuk brand tanpa kategori (Fonce, Predire)
                  <div className="flex flex-wrap gap-1.5">
                    {brandProducts.map((prod) => {
                      const isSelected = selectedProducts.includes(prod);
                      return (
                        <button
                          key={prod}
                          type="button"
                          onClick={() => toggleSelection(prod, selectedProducts, setSelectedProducts)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                            ${isSelected 
                              ? 'bg-white text-black border-white shadow-sm font-bold scale-[1.02]' 
                              : 'bg-black/25 text-zinc-200 border-white/20 hover:border-white/50 hover:bg-white/15 shadow-2xs'
                            }`}
                        >
                          {prod}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Smooth Disappearing & Appearing Lock Parameters */}
            <div 
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                selectedProducts.length > 0 ? 'max-h-48 opacity-100 pt-1' : 'max-h-0 opacity-0 pt-0'
              }`}
            >
              <div className="p-4 rounded-2xl bg-black/25 border border-white/20 backdrop-blur-md shadow-2xs">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Lock className="text-zinc-200" size="{13}"/>
                  <span className="text-xs font-bold text-white tracking-wide uppercase">
                    Lock Parameters
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-300 ml-auto">
                    Prioritas Tertinggi
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {LOCK_OPTIONS.map((lock) => {
                    const isLocked = lockedParams.includes(lock);
                    return (
                      <button
                        key={lock}
                        type="button"
                        onClick={() => toggleSelection(lock, lockedParams, setLockedParams)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 border flex items-center gap-1.5
                          ${isLocked 
                            ? 'bg-white text-black border-white shadow-xs font-bold' 
                            : 'bg-white/10 text-zinc-200 border-white/20 hover:border-white/40 hover:bg-white/20 shadow-2xs'
                          }`}
                      >
                        {isLocked && <Check className="stroke-[3]" size="{11}"/>}
                        {lock}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Minimalist Textarea */}
            <div>
              <label className="block text-xs font-bold text-white tracking-wide uppercase mb-2">
                Additional Instructions
              </label>
              <textarea 
                value={additionalText}
                onChange={(e) => setAdditionalText(e.target.value)}
                placeholder="Tambahkan arahan kreatif, perubahan sudut, atau detail pencahayaan..."
                className="w-full bg-black/25 border border-white/25 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/60 focus:bg-black/35 transition-all resize-none h-20 leading-relaxed font-medium backdrop-blur-md shadow-inner"
              />
            </div>

            {/* Sleek Minimalist Generate Button */}
            <div className="flex justify-center pt-1">
              <button
                onClick={generatePrompt}
                disabled={!mainImage || isGenerating}
                className={`min-w-[180px] px-8 py-2.5 md:py-3 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200
                  ${!mainImage || isGenerating
                    ? 'bg-white/10 text-zinc-400 cursor-not-allowed border border-white/10'
                    : 'bg-white text-black hover:bg-zinc-200 active:scale-[0.99] shadow-lg border border-white font-bold'
                  }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin text-black" size="{14}"/>
                    <span className="tracking-wider uppercase text-black font-bold">Process</span>
                  </>
                ) : (
                  <span>Generate</span>
                )}
              </button>
            </div>
          </div>

          {/* Generated Output */}
          <div 
            className={`transition-all duration-600 ease-in-out overflow-hidden ${
              outputPrompt && !isGenerating ? 'max-h-[600px] opacity-100 mt-8 pt-6 border-t border-white/20' : 'max-h-0 opacity-0 mt-0 pt-0'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Generated Prompt
              </span>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border
                  ${isCopied 
                    ? 'bg-emerald-500 text-white border-emerald-500' 
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30 shadow-xs'}`}
              >
                {isCopied ? <Check size="{12}"/> : <Copy size="{12}"/>}
                <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/25 shadow-2xl">
              <p className="font-mono text-xs text-zinc-100 leading-relaxed whitespace-pre-wrap selection:bg-white/30 selection:text-white">
                {outputPrompt}
              </p>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="mt-8 text-white/40 text-[11px] font-medium tracking-wider uppercase">
          Automated Visual Intelligence &bull; {brandName}
        </div>
      </main>

      {/* History Slide-out Drawer */}
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isHistoryOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsHistoryOpen(false)}
      />

      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-[#09090b]/90 backdrop-blur-2xl border-l border-white/20 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isHistoryOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <History size="{16}"/>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Prompt History</h2>
              <p className="text-[11px] text-zinc-400 font-medium">{history.length} prompt tersimpan</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                title="Hapus Semua Riwayat"
              >
                <Trash2 size="{16}"/>
              </button>
            )}
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Tutup Panel"
            >
              <X size="{18}"/>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scroll">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-zinc-500">
                <Clock size="{24}"/>
              </div>
              <p className="text-xs font-semibold text-zinc-300">Belum Ada Riwayat</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-[220px]">
                Hasil prompt untuk {brandName} akan otomatis tersimpan di panel ini.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                className="group relative bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 rounded-2xl p-3.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {item.mainImageThumb && (
                      <img 
                        src={item.mainImageThumb} 
                        alt="Thumbnail" 
                        className="w-7 h-7 rounded-lg object-cover border border-white/20 shrink-0" 
                      />
                    )}
                    <span className="text-[10px] font-semibold text-zinc-400">
                      {item.date} &bull; {item.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-90">
                    <button
                      onClick={() => copyHistoryPrompt(item)}
                      className={`p-1.5 rounded-lg border text-[10px] font-semibold transition-all flex items-center gap-1 ${
                        copiedHistoryId === item.id 
                          ? 'bg-emerald-500 text-white border-emerald-500' 
                          : 'bg-white/10 text-zinc-200 border-white/15 hover:bg-white/20'
                      }`}
                      title="Salin Prompt"
                    >
                      {copiedHistoryId === item.id ? <Check size="{12}"/> : <Copy size="{12}"/>}
                    </button>
                    <button
                      onClick={() => restoreHistoryItem(item)}
                      className="p-1.5 bg-white/10 text-zinc-200 hover:text-white hover:bg-white/20 border border-white/15 rounded-lg transition-all"
                      title="Terapkan ke Layar Utama"
                    >
                      <RotateCcw size="{12}"/>
                    </button>
                    <button
                      onClick={() => setHistory(prev => prev.filter(i => i.id !== item.id))}
                      className="p-1.5 bg-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-500/15 border border-white/10 rounded-lg transition-all"
                      title="Hapus Item"
                    >
                      <Trash2 size="{12}"/>
                    </button>
                  </div>
                </div>

                {item.products && item.products.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.products.map((p: any, idx: any) => (
                      <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                <p className="font-mono text-[11px] text-zinc-300 line-clamp-3 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/10">
                  {item.prompt}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN UTAMA (APP) ---
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('FONCE');
  const [generatingTabs, setGeneratingTabs] = useState<any>({});

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=JetBrains+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      * {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      body {
        background-color: #050505;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      .font-mono {
        font-family: 'JetBrains Mono', monospace !important;
      }
      .card-shadow-frosted {
        box-shadow: 0 30px 80px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.25), inset 0 1px 2px 0 rgba(255, 255, 255, 0.35);
      }
      .custom-scroll::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      .custom-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scroll::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 99px;
      }
      .custom-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.35);
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
      document.head.removeChild(link);
    };
  }, []);

  const tabs = [
    { id: 'FONCE', label: 'Foncé' },
    { id: 'PREDIRE', label: 'Predire' },
    { id: 'FEEL_ONE', label: 'Feel One' }
  ];

  const handleTabGeneratingChange = (tabId: any, isGenerating: any) => {
    setGeneratingTabs((prev: any) => ({
      ...prev,
      [tabId]: isGenerating
    }));
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col antialiased selection:bg-white selection:text-black overflow-hidden"
      style={{
        backgroundColor: '#050505',
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        backgroundPosition: 'center top'
      }}
    >
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto hide-scrollbar w-full max-w-4xl justify-start md:justify-center px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isTabGenerating = !!generatingTabs[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border flex items-center gap-2
                  ${isActive 
                    ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-[1.02]' 
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                  }`}
              >
                {isTabGenerating && (
                  <Loader2 size={12} className={`animate-spin ${isActive ? 'text-black' : 'text-amber-400'}`} />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mounting Semua Tab */}
      {tabs.map((tab) => (
        <PromptGeneratorTab
          key={tab.id}
          brandConfig={BRANDS[tab.id]}
          isActive={activeTab === tab.id}
          onGeneratingStateChange={(isGen: any) => handleTabGeneratingChange(tab.id, isGen)}
        />
      ))}
      
    </div>
  );
}
