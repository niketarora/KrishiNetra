import React, { useState } from "react";
import { Page, Card, Badge } from "../shared/ui";
import { Search, Pin, Arrow } from "../shared/icons";

// Mock datasets for Marketplace demo
const SNAPSHOT_CROPS = [
  { name: "Wheat", price: 2580, trend: "+2.4%", status: "High Demand", trendDir: "up" },
  { name: "Rice (Paddy)", price: 3100, trend: "0.0%", status: "Stable", trendDir: "flat" },
  { name: "Onion", price: 1850, trend: "-5.1%", status: "Volatile", trendDir: "down" },
  { name: "Tomato", price: 2200, trend: "+8.7%", status: "High Demand", trendDir: "up" },
];

const MANDI_DATA = [
  { crop: "Wheat", state: "Madhya Pradesh", mandi: "Indore", distance: 45, price: 2580, knRange: "2,580 - 2,720", trend: "+2.4%", trendDir: "up" },
  { crop: "Wheat", state: "Rajasthan", mandi: "Jaipur", distance: 60, price: 2650, knRange: "2,600 - 2,750", trend: "+1.8%", trendDir: "up" },
  { crop: "Rice (Basmati)", state: "Punjab", mandi: "Amritsar", distance: 12, price: 4200, knRange: "4,100 - 4,350", trend: "+0.5%", trendDir: "up" },
  { crop: "Onion", state: "Maharashtra", mandi: "Lasalgaon", distance: 15, price: 1950, knRange: "1,800 - 2,050", trend: "-3.2%", trendDir: "down" },
  { crop: "Tomato", state: "Karnataka", mandi: "Kolar", distance: 28, price: 2100, knRange: "2,000 - 2,250", trend: "+5.4%", trendDir: "up" },
];

const NEARBY_MANDIS = {
  "Wheat": [
    { name: "Indore", distance: "45 km", price: 2610, trend: "+1.2%", best: false },
    { name: "Ujjain", distance: "62 km", price: 2650, trend: "Best Price", best: true },
    { name: "Dewas", distance: "38 km", price: 2550, trend: "-0.5%", best: false },
    { name: "Sehore", distance: "85 km", price: 2580, trend: "Stable", best: false },
  ],
  "Rice (Basmati)": [
    { name: "Amritsar", distance: "12 km", price: 4250, trend: "Best Price", best: true },
    { name: "Tarn Taran", distance: "32 km", price: 4150, trend: "-1.0%", best: false },
    { name: "Gurdaspur", distance: "75 km", price: 4200, trend: "Stable", best: false },
  ],
  "Onion": [
    { name: "Lasalgaon", distance: "15 km", price: 1980, trend: "Best Price", best: true },
    { name: "Pimpalgaon", distance: "28 km", price: 1920, trend: "-1.5%", best: false },
    { name: "Yeola", distance: "42 km", price: 1950, trend: "Stable", best: false },
  ],
  "Tomato": [
    { name: "Kolar", distance: "28 km", price: 2100, trend: "Best Price", best: true },
    { name: "Chikballapur", distance: "35 km", price: 2050, trend: "-0.8%", best: false },
    { name: "Bangalore", distance: "50 km", price: 2080, trend: "Stable", best: false },
  ],
};

const INPUT_CATEGORIES = ["All", "🌱 Seeds", "🧪 Fertilizers", "🌿 Crop Protection", "💧 Irrigation", "🔧 Tools"];

const INPUT_PRODUCTS = [
  { id: 1, category: "🌱 Seeds", name: "High-Yield Wheat Seeds (Lok-1)", size: "10 kg pack", brand: "Mahyco", price: 950, rating: 4.8, description: "Certified premium Lok-1 wheat seeds, highly resistant to rust and drought conditions.", verified: true },
  { id: 2, category: "🧪 Fertilizers", name: "Organic NPK Soil Conditioner", size: "25 kg bag", brand: "IFFCO", price: 620, rating: 4.6, description: "All-natural balanced NPK organic compound for soil health reclamation.", verified: true },
  { id: 3, category: "🌿 Crop Protection", name: "Bio-Neem Pest Repellent", size: "1 L bottle", brand: "AgriShield", price: 450, rating: 4.5, description: "Concentrated organic cold-pressed neem seed extract for broad spectrum insect control.", verified: false },
  { id: 4, category: "💧 Irrigation", name: "Drip Irrigation Lateral Pipe", size: "100m roll", brand: "Jain Irrigation", price: 1450, rating: 4.7, description: "UV-resistant durable drip irrigation laterals suitable for row cropping.", verified: true },
  { id: 5, category: "🔧 Tools", name: "Carbon Steel Weeding Sickle", size: "1 unit", brand: "Falcon Tools", price: 380, rating: 4.4, description: "Ergonomic heavy-duty carbon steel tool designed for weeding and harvesting.", verified: false },
  { id: 6, category: "🌱 Seeds", name: "Hybrid Basmati Paddy Seeds", size: "5 kg pack", brand: "Nuziveedu", price: 890, rating: 4.9, description: "Super fine grain hybrid basmati paddy seed with high elongation ratio.", verified: true },
];

export default function Marketplace({ setView, query, setQuery, lang }) {
  const [mode, setMode] = useState("sell"); // "sell" or "buy"
  const [sellSearch, setSellSearch] = useState("");
  const [buySearch, setBuySearch] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Forms and Modals
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [sellFormData, setSellFormData] = useState({
    crop: "Wheat",
    quantity: "",
    grade: "Grade A",
    location: "Indore",
    price: "",
  });

  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    triggerToast(`Added ${product.name} to cart.`);
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleCheckout = () => {
    setCart([]);
    setIsCartOpen(false);
    alert(lang === "hi" ? "ऑर्डर सफलतापूर्वक भेजा गया! 3 दिनों के भीतर डिलीवरी होगी।" : "Order placed successfully! Expected delivery within 3 days.");
  };

  const handlePublishListing = (e) => {
    e.preventDefault();
    setIsSellModalOpen(false);
    triggerToast(lang === "hi" ? "फसल बिक्री सूची प्रकाशित! सत्यापन प्रगति पर है।" : "Crop listing published! Verification pending.");
  };

  // Filter crops
  const filteredMandiCrops = MANDI_DATA.filter((m) =>
    m.crop.toLowerCase().includes(sellSearch.toLowerCase()) ||
    m.mandi.toLowerCase().includes(sellSearch.toLowerCase())
  );

  // Filter products
  const filteredProducts = INPUT_PRODUCTS.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(buySearch.toLowerCase()) ||
                          p.brand.toLowerCase().includes(buySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCropDetails = MANDI_DATA.find((m) => m.crop.startsWith(selectedCrop)) || MANDI_DATA[0];

  return (
    <Page>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[2000] bg-emerald-800 text-white px-5 py-3 rounded-xl border border-emerald-500 shadow-2xl flex items-center gap-2 animate-fadeUp">
          <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="font-mono text-xs tracking-label text-slate-400 uppercase">
            {lang === "hi" ? "कृषिउत्पाद बाज़ार" : "KrishiNetra Trade Console"}
          </div>
          <h1 className="font-display font-extrabold text-4xl text-ink mt-1">
            {lang === "hi" ? "कृषि बाज़ार" : "Marketplace"}
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            {lang === "hi" ? "स्मार्ट बिक्री, उचित खरीद। उपग्रह और मंडी मूल्य संकलन।" : "Sell smarter, buy better. Satellite insights and mandi aggregates."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm w-fit font-sans">
          <button
            onClick={() => setMode("sell")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === "sell" ? "bg-forest-800 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {lang === "hi" ? "फसल बेचें" : "Sell Crops"}
          </button>
          <button
            onClick={() => setMode("buy")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === "buy" ? "bg-forest-800 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {lang === "hi" ? "कृषि सामग्री खरीदें" : "Buy Farm Inputs"}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE: SELL CROPS */}
      {/* ========================================================================= */}
      {mode === "sell" && (
        <div className="space-y-8">
          {/* Market Snapshot Row */}
          <div>
            <h2 className="font-display font-bold text-lg text-ink mb-4">
              {lang === "hi" ? "बाज़ार मूल्य अवलोकन" : "Market Price Snapshot"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SNAPSHOT_CROPS.map((c) => (
                <div
                  key={c.name}
                  onClick={() => setSelectedCrop(c.name)}
                  className={`cursor-pointer bg-white border rounded-2xl p-5 hover:border-forest-600 transition-all ${
                    selectedCrop === c.name ? "ring-2 ring-forest-700 border-transparent shadow-sm" : "border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-slate-800 font-display">{c.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === "High Demand" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-2xl text-ink">₹{c.price}</span>
                    <span className="text-xs text-slate-400 font-semibold">/ q</span>
                  </div>
                  <div
                    className={`text-xs font-bold mt-2 flex items-center gap-0.5 ${
                      c.trendDir === "up" ? "text-emerald-600" : c.trendDir === "down" ? "text-red-600" : "text-slate-500"
                    }`}
                  >
                    <span>{c.trendDir === "up" ? "↑" : c.trendDir === "down" ? "↓" : "→"}</span>
                    <span>{c.trend}</span>
                    <span className="text-slate-400 font-normal ml-1">vs last week</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sell Split Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Crop Price list and Trend Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search Bar & Mandi List */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="font-display font-bold text-lg text-ink">
                    {lang === "hi" ? "मंडी दर खोज" : "Mandi Rate Explorer"}
                  </h3>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-64">
                    <Search width={16} height={16} className="text-slate-400" />
                    <input
                      placeholder="Search crop or mandi..."
                      value={sellSearch}
                      onChange={(e) => setSellSearch(e.target.value)}
                      className="bg-transparent outline-none text-xs flex-1 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase">
                        <th className="pb-3">{lang === "hi" ? "फसल" : "Crop"}</th>
                        <th className="pb-3">{lang === "hi" ? "राज्य / मंडी" : "State / Mandi"}</th>
                        <th className="pb-3">{lang === "hi" ? "मंडी मूल्य" : "Mandi Price"}</th>
                        <th className="pb-3">{lang === "hi" ? "कृषिनीति संदर्भ सीमा" : "KrishiNetra Reference"}</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {filteredMandiCrops.map((item) => (
                        <tr key={`${item.crop}-${item.mandi}`} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 font-semibold text-ink">{item.crop}</td>
                          <td className="py-3.5">
                            <div className="text-slate-800 font-medium">{item.mandi}</div>
                            <div className="text-xs text-slate-400">{item.state}</div>
                          </td>
                          <td className="py-3.5">
                            <span className="font-semibold text-ink">₹{item.price}</span>
                            <span className="text-slate-400 text-xs">/q</span>
                          </td>
                          <td className="py-3.5">
                            <Badge color="green">₹{item.knRange}</Badge>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => {
                                setSellFormData((prev) => ({ ...prev, crop: item.crop, price: item.price }));
                                setIsSellModalOpen(true);
                              }}
                              className="bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {lang === "hi" ? "फसल बेचें" : "Sell"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Price Trend Chart Simulation */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-label text-slate-400">Analysis</span>
                    <h3 className="font-display font-bold text-lg text-ink">
                      {selectedCrop} {lang === "hi" ? "मूल्य प्रवृत्तियाँ" : "Price Trends"}
                    </h3>
                  </div>
                  <div className="flex gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs font-semibold">
                    <button className="px-2.5 py-1 bg-white shadow-sm rounded text-slate-800">7D</button>
                    <button className="px-2.5 py-1 text-slate-400">30D</button>
                    <button className="px-2.5 py-1 text-slate-400">90D</button>
                  </div>
                </div>

                <div className="h-44 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
                  <svg className="w-48 h-16 text-forest-600/30" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M0 25 Q15 23 30 18 T60 8 T90 12" strokeLinecap="round" />
                  </svg>
                  <p className="font-semibold text-slate-700 text-sm mt-3 relative z-10">
                    {lang === "hi" ? "कीमत ग्राफ (डेमो)" : "Interactive Trend Chart (Placeholder)"}
                  </p>
                  <p className="text-slate-400 text-xs mt-1 relative z-10">
                    {lang === "hi" ? "कृषिनीति उपग्रह डेटा और फसल उपज आधारित पूर्वानुमान।" : "Calculated from satellite indices & local yield models."}
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column: Mandi Comparison & GIS Integrations */}
            <div className="space-y-6">
              {/* Nearby Mandis List */}
              <Card className="p-6">
                <h3 className="font-display font-bold text-base text-ink mb-2 flex items-center gap-2">
                  <Pin width={16} height={16} className="text-forest-600" />
                  {lang === "hi" ? "निकटवर्ती मंडी दरें" : "Nearby Mandis"}
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  {lang === "hi" ? "आसपास की मंडियों में औसत भाव की तुलना।" : "Current modal prices within 100 km radius."}
                </p>

                <div className="space-y-3">
                  {(NEARBY_MANDIS[selectedCrop] || NEARBY_MANDIS["Wheat"]).map((m) => (
                    <div
                      key={m.name}
                      className={`flex justify-between items-center p-3.5 rounded-xl border transition-all ${
                        m.best ? "border-emerald-500 bg-emerald-50/40 shadow-sm" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.distance} away</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-sm">₹{m.price}</div>
                        <div className={`text-[10px] font-bold ${m.best ? "text-emerald-700" : m.trend.startsWith("+") ? "text-emerald-600" : "text-slate-500"}`}>
                          {m.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* GIS Integration Card */}
              <Card className="p-6 bg-forest-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
                <h3 className="font-display font-bold text-base mb-2">
                  {lang === "hi" ? "खेत-मूल्य सहसंबंध" : "Field-to-Market Check"}
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-5">
                  {lang === "hi" ? "कृषिनीति उपग्रह विश्लेषण के अनुसार आपके खेत में धान/गेहूं की अपेक्षित उपज आंकी गई है।" : "KrishiNetra satellite scans predict your upcoming harvest yield. Tap to analyze."}
                </p>
                <button
                  onClick={() => {
                    setQuery("P0001");
                    setView("gis");
                  }}
                  className="w-full py-3 bg-[#34D399] text-[#0C1324] font-bold rounded-xl hover:bg-[#5AF0B3] transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <span>{lang === "hi" ? "मानचित्र पर खेत देखें" : "View expected yield in GIS Map"}</span>
                  <Arrow width={14} height={14} />
                </button>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE: BUY FARM INPUTS */}
      {/* ========================================================================= */}
      {mode === "buy" && (
        <div className="space-y-6 font-sans">
          {/* Search, Categories and Cart Launcher */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            {/* Input Categories Switcher */}
            <div className="flex gap-1 overflow-x-auto py-1">
              {INPUT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === c ? "bg-forest-800 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Right side search + cart icon */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-grow md:w-64">
                <Search width={16} height={16} className="text-slate-400" />
                <input
                  placeholder="Search seeds, fertilizers, tools..."
                  value={buySearch}
                  onChange={(e) => setBuySearch(e.target.value)}
                  className="bg-transparent outline-none text-xs flex-1 placeholder-slate-400"
                />
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-100 rounded-xl p-2.5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    {cart.reduce((sum, item) => sum + item.qty, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <Card key={p.id} className="p-5 flex flex-col group hover:border-forest-600 transition-all hover:-translate-y-0.5 duration-200">
                <div
                  onClick={() => {
                    setSelectedProduct(p);
                    setIsDetailModalOpen(true);
                  }}
                  className="cursor-pointer bg-slate-50 border border-slate-100 rounded-xl h-40 flex items-center justify-center mb-4 relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 flex gap-1">
                    {p.verified && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        ✓ Verified
                      </span>
                    )}
                    <span className="bg-slate-200/80 backdrop-blur-sm text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {p.category.split(" ")[1]}
                    </span>
                  </div>
                  <span className="text-4xl filter saturate-75">{p.category.split(" ")[0]}</span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <div
                    onClick={() => {
                      setSelectedProduct(p);
                      setIsDetailModalOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <h4 className="font-semibold text-slate-800 group-hover:text-forest-700 transition-colors text-sm line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {p.brand} · {p.size}
                    </p>
                  </div>
                  <div className="flex items-center text-amber-500 font-semibold text-xs gap-0.5 whitespace-nowrap">
                    <span>★</span>
                    <span>{p.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed flex-grow">
                  {p.description}
                </p>

                <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100">
                  <span className="font-display font-extrabold text-lg text-ink">₹{p.price}</span>
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Add to Cart</span>
                  </button>
                </div>
              </Card>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                {lang === "hi" ? "इस श्रेणी में कोई उत्पाद उपलब्ध नहीं है।" : "No farm inputs found in this category."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SELL CROP FORM */}
      {/* ========================================================================= */}
      {isSellModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-fadeUp">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-display font-bold text-base text-ink">
                {lang === "hi" ? "नई फसल बिक्री प्रविष्टि" : "Create Crop Listing"}
              </h3>
              <button onClick={() => setIsSellModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishListing} className="p-6 space-y-4 font-sans text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Crop</label>
                <input
                  type="text"
                  readOnly
                  value={sellFormData.crop}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-500 font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Quantity (qtl)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25"
                    value={sellFormData.quantity}
                    onChange={(e) => setSellFormData({ ...sellFormData, quantity: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Quality Grade</label>
                  <select
                    value={sellFormData.grade}
                    onChange={(e) => setSellFormData({ ...sellFormData, grade: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-forest-600 bg-white"
                  >
                    <option>Grade A (Premium)</option>
                    <option>Grade B (Standard)</option>
                    <option>Grade C (Average)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Your Location</label>
                <input
                  type="text"
                  required
                  placeholder="Mandi or District"
                  value={sellFormData.location}
                  onChange={(e) => setSellFormData({ ...sellFormData, location: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-forest-600"
                />
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5">
                <span className="text-[10px] font-mono font-bold tracking-label text-emerald-800 uppercase">KrishiNetra Reference Range</span>
                <div className="font-display font-extrabold text-xl text-emerald-800 mt-1">₹{activeCropDetails.knRange} / q</div>
                <p className="text-[10px] text-emerald-600 mt-1">Estimations derived from satellite soil metrics.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Asking Price (₹/q)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2680"
                  value={sellFormData.price}
                  onChange={(e) => setSellFormData({ ...sellFormData, price: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-forest-600 font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-forest-800 hover:bg-forest-700 text-white font-bold rounded-xl shadow-md transition-colors mt-6"
              >
                {lang === "hi" ? "फसल बिक्री सूची दर्ज करें" : "Publish Listing"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRODUCT DETAIL VIEW */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-fadeUp">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {selectedProduct.category}
              </span>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 font-sans text-sm">
              <div className="bg-slate-50 rounded-xl h-44 flex items-center justify-center border border-slate-100">
                <span className="text-5xl">{selectedProduct.category.split(" ")[0]}</span>
              </div>

              <div>
                <h3 className="font-display font-extrabold text-xl text-ink leading-tight">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Brand: <span className="font-semibold text-slate-700">{selectedProduct.brand}</span> · Pack size: {selectedProduct.size}
                </p>
              </div>

              <div className="flex items-center justify-between py-2 border-y border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 block">Mandi Retail Price</span>
                  <span className="font-display font-extrabold text-2xl text-ink">₹{selectedProduct.price}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Rating</span>
                  <span className="text-amber-500 font-bold text-sm">★ {selectedProduct.rating}</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-xs">
                {selectedProduct.description}
              </p>

              {selectedProduct.verified && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-emerald-700 text-[10px] font-bold">✓ KrishiNetra Verified Seller Partner</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setIsDetailModalOpen(false);
                  }}
                  className="flex-1 py-3 bg-forest-800 hover:bg-forest-700 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setIsDetailModalOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: SHOPPING CART SLIDE-OUT PANEL */}
      {/* ========================================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[4000] flex justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-fadeUp">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-lg text-ink">My Cart</h3>
                <Badge color="forest">{cart.reduce((sum, item) => sum + item.qty, 0)} Items</Badge>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans text-sm">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl items-center">
                  <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-xl">
                    {item.category.split(" ")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 text-xs truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-400">{item.brand}</p>
                    <div className="font-bold text-slate-900 mt-1 text-xs">
                      ₹{item.price} x {item.qty}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold p-1"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <span className="text-4xl mb-2">🛒</span>
                  <p className="text-sm font-semibold">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Explore farm inputs and add them here</p>
                </div>
              )}
            </div>

            {/* Cart Footer / Checkout Summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4 font-sans text-sm">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span>₹{cart.reduce((sum, item) => sum + item.price * item.qty, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span>₹80</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-800 pt-2 border-t border-slate-200">
                    <span>Total Amount</span>
                    <span>₹{cart.reduce((sum, item) => sum + item.price * item.qty, 80)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-forest-800 hover:bg-forest-700 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Page>
  );
}
