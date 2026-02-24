
import React, { useState, useRef, useEffect } from 'react';
import { View, Language, Principle, HandbookItem, SubHeading, AppData } from './types';
import { UI_TRANSLATIONS, INITIAL_DATA } from './constants';
import { askPrakruthiMithra, translateContent, getSpeech } from './services/geminiService';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';

// Official Prakruthi Mithra Logo (Base64)
const APP_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABFGoRRAAAABlBMVEUAbwD///8e9B7sAAAAAnRSTlP/AOW3MEoAAALpSURBVHic7ZuxSgMxFICv0EGK6CByOujmIOfS6uYgODmInIOLmIPgKOfS6uYgODmInIOLmIOfInIuDkUuToKDmINUBAeR00GKiIP0X7zBIdLbe0mbe78fkkAghEAIgRACH6XzF8V57eP0Y7rYv/8Nf9y2S4PzVjH9mP66+N398fB7+X160XlreXHe6p6XjYV8TjO97L4104uO563ueat7Xnbe87Lzne985zvf+c53vvO9Yy6f08vS87zVPS87Lzvvecl7z0veS95L3kveS14yvcxdPqeXped5q3tedl523vOS956XvJe8l7yXvJe8lLyUvJS8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLz8b74AY3/4vV+W6KkAAAAASUVORK5CYII=";

// Audio Utility Functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('te');
  const [currentView, setCurrentView] = useState<View>('auth');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HandbookItem | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string; image?: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | number | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Weather State
  const [weather, setWeather] = useState({ temp: '32°C', humidity: '65%', condition: 'Sunny', icon: '☀️' });
  const [showWeatherForecast, setShowWeatherForecast] = useState(false);

  // PMDS Calculator State
  const [pmdsAcres, setPmdsAcres] = useState<string>('1');
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const [appData, setAppData] = useState<Record<Language, AppData>>(() => {
    const saved = localStorage.getItem('prakruthi_mithra_v2_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        (Object.keys(parsed) as Language[]).forEach(lang => {
          if (!parsed[lang].categoryLabels) {
             parsed[lang].categoryLabels = { ...INITIAL_DATA[lang].categoryLabels };
          }
          if (parsed[lang].videos === undefined) {
             parsed[lang].videos = INITIAL_DATA[lang].videos;
          }
          
          // Deduplicate videos
          const videoIds = new Set();
          parsed[lang].videos = parsed[lang].videos.filter((v: any) => {
            if (videoIds.has(v.id)) return false;
            videoIds.add(v.id);
            return true;
          });

          // Deduplicate handbook items
          Object.keys(parsed[lang].handbook).forEach(slug => {
            const itemIds = new Set();
            parsed[lang].handbook[slug] = parsed[lang].handbook[slug].filter((item: any) => {
              if (itemIds.has(item.id)) return false;
              itemIds.add(item.id);
              return true;
            });
          });
        });
        return parsed;
      } catch (e) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  const [editingItem, setEditingItem] = useState<{ category: string, data: HandbookItem } | null>(null);

  const forecastBaseData = [
    { temp: '32°C', icon: '☀️', cond: 'Sunny' },
    { temp: '33°C', icon: '☀️', cond: 'Sunny' },
    { temp: '31°C', icon: '⛅', cond: 'Partly Cloudy' },
    { temp: '29°C', icon: '🌦️', cond: 'Light Rain' },
    { temp: '28°C', icon: '🌧️', cond: 'Rainy' },
    { temp: '30°C', icon: '⛅', cond: 'Cloudy' },
    { temp: '31°C', icon: '☀️', cond: 'Sunny' },
    { temp: '33°C', icon: '☀️', cond: 'Sunny' },
    { temp: '34°C', icon: '🔥', cond: 'Very Hot' },
    { temp: '32°C', icon: '☀️', cond: 'Sunny' },
  ];

  const pmdsCategories = {
    cereals: { 
      label: { te: "ధాన్యాలు (Cereals)", hi: "अनाज (Cereals)", en: "Cereals" },
      varieties: { te: "సజ్జలు, జొన్నలు, రాగులు, కొర్రలు, ఆరికలు", hi: "बाजरा, ज्वार, रागी, कंगनी, कोदो", en: "Pearl millet, Sorghum, Finger millet, Foxtail millet, Kodo millet" },
      ratio: 0.3 
    },
    pulses: { 
      label: { te: "పప్పు దినుసులు (Pulses)", hi: "दलहन (Pulses)", en: "Pulses" },
      varieties: { te: "కందులు, పెసలు, మినుములు, అలసందలు, చనగలు", hi: "अरहर, मूंग, उड़द, लोबिया, चना", en: "Red gram, Green gram, Black gram, Cowpea, Chickpeas" },
      ratio: 0.3 
    },
    oilseeds: { 
      label: { te: "నూనె గింజలు (Oil Seeds)", hi: "तिलहन (Oil Seeds)", en: "Oil Seeds" },
      varieties: { te: "వేరుశనగ, నువ్వులు, కుసుమలు, ఆముదాలు, ఆవాలు", hi: "मूंगफली, तिल, कुसुम, अरंडी, सरसों", en: "Groundnut, Sesame, Safflower, Castor, Mustard" },
      ratio: 0.2 
    },
    fodder: { 
      label: { te: "పశుగ్రాసం (Fodder)", hi: "चारा (Fodder)", en: "Fodder" },
      varieties: { te: "పిల్లిపెసర, అలసంద, గడ్డి రకాలు", hi: "पिल्लीपैसेरा, लोबिया, घास की किस्में", en: "Pillipesara, Cowpea, Grass varieties" },
      ratio: 0.1 
    },
    vegetables: { 
      label: { te: "కూరగాయలు (Vegetables)", hi: "सब्जियां (Vegetables)", en: "Vegetables" },
      varieties: { te: "బెండ, గోరుచిక్కుడు, సొరకాయ, టమోటా", hi: "भिंडी, ग्वार फली, लौकी, टमाटर", en: "Okra, Cluster beans, Bottle gourd, Tomato" },
      ratio: 0.1 
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const isAdminEmail = currentUser?.email === 'prakruthimithra2026@gmail.com';
      if (currentUser && (currentUser.emailVerified || isAdminEmail)) {
        setUser(currentUser);
        if (currentView === 'auth' || currentView === 'verification-pending') setCurrentView('home');
      } else {
        setUser(null);
        if (currentView !== 'auth' && currentView !== 'verification-pending') setCurrentView('auth');
      }
    });
    return () => unsubscribe();
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('prakruthi_mithra_v2_data', JSON.stringify(appData));
  }, [appData]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => {});
    }
  }, []);

  const t = UI_TRANSLATIONS[language];
  const d = appData[language];

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setCurrentView('verification-pending');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        const isAdminEmail = authEmail === 'prakruthimithra2026@gmail.com';
        if (!userCredential.user.emailVerified && !isAdminEmail) {
          await signOut(auth);
          setCurrentView('verification-pending');
        }
      }
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const navigateTo = (view: View) => {
    stopSpeaking();
    window.scrollTo(0, 0);
    setCurrentView(view);
    setShowWeatherForecast(false);
  };

  const stopSpeaking = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch(e) {}
      audioSourceRef.current = null;
    }
    setIsSpeaking(false);
    setCurrentlyPlayingId(null);
  };

  const handleSpeak = async (text: string, id: string | number) => {
    if (isSpeaking && currentlyPlayingId === id) {
      stopSpeaking();
      return;
    }
    stopSpeaking();
    setIsSpeaking(true);
    setCurrentlyPlayingId(id);
    try {
      const base64Audio = await getSpeech(text);
      if (base64Audio) {
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => { setIsSpeaking(false); setCurrentlyPlayingId(null); };
        audioSourceRef.current = source;
        source.start();
      }
    } catch { stopSpeaking(); }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'prakruthimithra2026@gmail.com' && adminPassword === 'Ravi@1985') {
      setIsAdmin(true);
      navigateTo('admin');
      setAdminEmail(''); setAdminPassword('');
    } else alert("Invalid Admin Credentials");
  };

  const handleBack = () => {
    stopSpeaking();
    if (showWeatherForecast) { setShowWeatherForecast(false); return; }
    if (editingItem) { setEditingItem(null); return; }
    if (currentView === 'handbook-item-detail') { navigateTo('handbook-items'); return; }
    if (currentView === 'handbook-items') { navigateTo('handbook-categories'); return; }
    navigateTo('home');
  };

  const handleResetData = () => {
    if (!confirm("Wipe all custom edits and reset to factory handbook?")) return;
    setAppData(INITIAL_DATA);
    showToast("Handbook Reset");
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const slug = newCategoryName.toLowerCase().replace(/\s+/g, '_');
    if (d.handbook[slug]) {
      alert("Category already exists!");
      return;
    }

    setIsSyncing(true);
    setAppData(prev => {
      const next = { ...prev };
      (Object.keys(next) as Language[]).forEach(lang => {
        next[lang].handbook[slug] = [];
        next[lang].categoryLabels[slug] = newCategoryName;
      });
      return next;
    });

    try {
      const otherLangs = (Object.keys(INITIAL_DATA) as Language[]).filter(l => l !== language);
      const translatedLabels = await Promise.all(otherLangs.map(async (tl) => {
        const res = await translateContent({ id: slug, text: newCategoryName }, language, tl, 'principle' as any);
        return { lang: tl, text: res.text };
      }));

      setAppData(prev => {
        const next = { ...prev };
        translatedLabels.forEach(({ lang, text }) => {
          next[lang].categoryLabels[slug] = text;
        });
        return next;
      });
      showToast("Category Added");
    } catch {
      showToast("Added Locally. Translation failed.");
    } finally {
      setIsSyncing(false);
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (slug: string) => {
    if (!confirm(`Delete entire category "${d.categoryLabels[slug]}" and all its contents?`)) return;
    setAppData(prev => {
      const next = { ...prev };
      (Object.keys(next) as Language[]).forEach(lang => {
        delete next[lang].handbook[slug];
        delete next[lang].categoryLabels[slug];
      });
      return next;
    });
    showToast("Category Deleted");
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;
    const userText = inputMessage;
    const userImg = selectedImage;
    setChatMessages(prev => [...prev, { role: 'user', text: userText || "", image: userImg || undefined }]);
    setInputMessage(''); setSelectedImage(null); setIsLoading(true);
    try {
      let imagePart = undefined;
      if (userImg) {
        const parts = userImg.split(',');
        imagePart = { data: parts[1], mimeType: parts[0].split(':')[1].split(';')[0] };
      }
      const response = await askPrakruthiMithra(userText, language, imagePart);
      setChatMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'bot', text: "Error. Try again." }]);
    } finally { setIsLoading(false); }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSyncing(true);
    const { category, data } = editingItem;
    setAppData((prev: any) => {
      const next = { ...prev };
      const list = [...next[language].handbook[category]];
      const idx = list.findIndex((it: any) => it.id === data.id);
      if (idx > -1) list[idx] = data; else list.push(data);
      next[language].handbook[category] = list;
      return next;
    });
    try {
      const otherLangs = (Object.keys(INITIAL_DATA) as Language[]).filter(l => l !== language);
      const results = await Promise.all(otherLangs.map(async (tl) => {
        const translated = await translateContent(data, language, tl, 'crop' as any);
        return { lang: tl, item: translated };
      }));
      setAppData((prev: any) => {
        const next = { ...prev };
        results.forEach(({ lang, item }) => {
          const list = [...next[lang].handbook[category]];
          const idx = list.findIndex((it: any) => item && it.id === item.id);
          if (idx > -1) list[idx] = item; else if (item) list.push(item);
          next[lang].handbook[category] = list;
        });
        return next;
      });
      showToast("Saved & Synced");
    } catch { showToast("Saved locally. Sync failed."); }
    finally { setIsSyncing(false); setEditingItem(null); }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingItem) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setEditingItem({ ...editingItem, data: { ...editingItem.data, mediaType: type, mediaData: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSharePmds = () => {
    const acres = parseFloat(pmdsAcres) || 0;
    const total = acres * 13;
    let shareText = `${t.shareTitle} (${acres} Acres)\n${t.totalSeedsNeeded}: ${total.toFixed(2)} kg\n\n`;
    
    Object.values(pmdsCategories).forEach(cat => {
      const qty = (total * cat.ratio).toFixed(2);
      shareText += `${cat.label[language]}: ${qty} kg\n(${cat.varieties[language]})\n\n`;
    });

    if (navigator.share) {
      navigator.share({ title: t.shareTitle, text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      showToast("Copied to clipboard!");
    }
  };

  const renderHome = () => {
    const acres = parseFloat(pmdsAcres) || 0;
    const totalSeeds = acres * 13;

    return (
      <div className="p-4 space-y-6 pb-24 animate-in fade-in">
        <section className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <h2 className="text-2xl font-bold mb-1">{t.welcome}</h2>
          <p className="text-green-50 mb-5 opacity-90 text-sm">{t.tagline}</p>
          <button onClick={() => navigateTo('chat')} className="bg-white text-green-700 px-6 py-2.5 rounded-full font-bold shadow-md active:scale-95 transition-all text-sm">{t.askAi}</button>
        </section>

        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-lg font-bold text-green-900">{t.weatherTitle}</h3>
          </div>
          <div 
            onClick={() => setShowWeatherForecast(true)}
            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-green-50 flex items-center justify-between cursor-pointer active:scale-95 transition-all hover:border-green-200"
          >
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-green-800">{weather.temp}</span>
              <span className="text-sm font-medium text-green-600">{weather.condition}</span>
            </div>
            <div className="text-5xl">{weather.icon}</div>
            <div className="flex flex-col items-end text-xs text-gray-500">
              <span>{t.humidity}: {weather.humidity}</span>
              <span className="text-green-600 font-bold mt-1">✓ Good for natural farming</span>
              <span className="text-[10px] text-green-400 mt-1 italic">Click to see 10-day report</span>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-green-50 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-green-900">{t.pmdsCalculator}</h3>
            <button onClick={handleSharePmds} className="p-2 bg-green-50 text-green-700 rounded-full active:scale-90 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-10.628a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5m0 10.628a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-3 items-center">
            <label className="text-xs font-bold text-green-700 whitespace-nowrap">{t.acresLabel}:</label>
            <input 
              type="number" 
              value={pmdsAcres} 
              onChange={(e) => setPmdsAcres(e.target.value)} 
              className="flex-1 p-3 rounded-2xl bg-green-50/30 border border-green-100 outline-none text-sm font-bold text-green-800"
            />
          </div>

          <div className="pt-2 border-t border-green-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-500">{t.totalSeedsNeeded} (12-14kg/acre):</span>
              <span className="text-xl font-bold text-green-700">{totalSeeds.toFixed(1)} kg</span>
            </div>
            
            <div className="space-y-3">
              {Object.entries(pmdsCategories).map(([key, cat]) => (
                <div key={key} className="bg-green-50/20 p-3 rounded-2xl border border-green-50/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-green-800">{cat.label[language]}</span>
                    <span className="text-xs font-bold text-green-700">{(totalSeeds * cat.ratio).toFixed(2)} kg</span>
                  </div>
                  <div className="text-[10px] text-gray-500 italic leading-tight">{cat.varieties[language]}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-orange-50 p-5 rounded-[2.5rem] border border-orange-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-orange-900 flex items-center gap-2"><span>⚠️</span> {t.note}</h3>
            <button onClick={() => handleSpeak(t.noteContent, 'note')} className="p-2 bg-orange-600 text-white rounded-full">{currentlyPlayingId === 'note' ? '🛑' : '🔊'}</button>
          </div>
          <p className="text-sm text-orange-800">{t.noteContent}</p>
        </section>
      </div>
    );
  };

  const renderVideoView = () => {
    const activeVideo = d.videos.find(v => v.id === activeVideoId);
    
    // Helper to ensure youtube links are embeddable
    const getEmbedUrl = (url: string) => {
      let embedUrl = url;
      if (embedUrl.includes('youtube.com/watch?v=')) {
        embedUrl = embedUrl.replace('watch?v=', 'embed/');
      } else if (embedUrl.includes('youtu.be/')) {
        embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
      }
      return embedUrl;
    };

    return (
      <div className="p-4 space-y-6 pb-24 animate-in fade-in h-full flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-green-900">{t.video}</h2>
          {activeVideo && (
            <button 
              onClick={() => setActiveVideoId(null)} 
              className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full"
            >
              {t.back}
            </button>
          )}
        </div>

        {activeVideo ? (
          <div className="flex-1 flex flex-col gap-4">
            <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-green-100 relative">
              <iframe 
                src={getEmbedUrl(activeVideo.url)} 
                className="w-full h-full" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="bg-green-50 p-6 rounded-[2.5rem] border border-green-100">
              <h3 className="font-bold text-green-900 mb-2">{activeVideo.title}</h3>
              <p className="text-sm text-green-800 font-medium">
                {language === 'te' ? 'ప్రకృతి వ్యవసాయం గురించి మరిన్ని వివరాల కోసం ఈ వీడియో చూడండి.' : 
                 language === 'hi' ? 'प्राकृतिक खेती के बारे में अधिक जानकारी के लिए यह वीडियो देखें।' : 
                 'Watch this video to learn more about natural farming practices.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1">
            {d.videos.length > 0 ? d.videos.map((video) => (
              <div 
                key={video.id} 
                onClick={() => setActiveVideoId(video.id)}
                className="bg-white p-4 rounded-[2rem] shadow-sm border border-green-50 flex items-center gap-4 cursor-pointer active:scale-95 transition-all hover:border-green-200"
              >
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                  🎥
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 text-sm line-clamp-2">{video.title}</h3>
                  <span className="text-[10px] text-green-500 font-bold uppercase mt-1 block">Click to Play</span>
                </div>
                <div className="text-green-300">➔</div>
              </div>
            )) : (
              <div className="text-center py-20 text-gray-400 italic">
                No videos available
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-[#fafdfb] min-h-screen relative shadow-2xl flex flex-col h-screen overflow-hidden">
      <header className="sticky top-0 bg-green-700 text-white p-4 shadow-lg z-50 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          {(currentView !== 'home' || showWeatherForecast) && currentView !== 'auth' && (
            <button onClick={handleBack} className="bg-green-800/50 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
          )}
          <h1 className="text-xl font-bold tracking-tight">Prakruthi Mithra</h1>
        </div>
        <div className="flex items-center gap-3">
          {user && <button onClick={() => isAdmin ? navigateTo('admin') : navigateTo('admin-login')} className="p-2 bg-green-800/50 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.744c0 5.051 3.11 9.38 7.443 11.166a11.986 11.986 0 0 0 7.114 0C21.89 19.124 25 14.795 25 9.744c0-1.285-.203-2.523-.598-3.744A11.959 11.959 0 0 1 12 2.714z" /></svg></button>}
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="bg-green-800 text-white text-[10px] font-bold rounded-lg px-2 py-1 outline-none border border-green-600">
            <option value="te">తెలుగు</option>
            <option value="hi">హిन्दी</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>

      {notification && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-green-700 text-white px-6 py-2 rounded-full shadow-2xl font-bold text-xs">{notification}</div>}

      <main className="flex-1 overflow-y-auto bg-transparent">
        {showWeatherForecast && (
          <div className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-10 h-full bg-[#fafdfb] z-40 relative pb-32">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-green-900">{t.forecastTitle}</h2>
              <button onClick={() => setShowWeatherForecast(false)} className="text-2xl text-gray-400">&times;</button>
            </div>
            <div className="space-y-3">
              {forecastBaseData.map((f, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const locale = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-GB';
                const dateString = date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
                
                return (
                  <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-green-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-[10px] font-bold text-green-700">{i + 1}</span>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">{dateString}</div>
                        <div className="text-sm font-bold text-green-800">{f.cond}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{f.icon}</span>
                      <span className="text-xl font-bold text-green-900">{f.temp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!showWeatherForecast && currentView === 'auth' && (
          <div className="p-8 flex flex-col justify-center min-h-[80vh]">
            <div className="text-center mb-8">
              <img src={APP_LOGO} alt="Prakruthi Mithra Logo" className="w-32 h-32 mx-auto mb-4 object-contain animate-in zoom-in-50" />
              <h2 className="text-2xl font-bold text-green-900 text-center">ప్రకృతి మిత్ర</h2>
              <p className="text-sm font-medium text-green-600 text-center">APCNF Guide</p>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4 bg-white p-8 rounded-[2.5rem] shadow-xl">
              <input type="email" placeholder="Email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full p-4 rounded-2xl bg-green-50/30 border border-green-100 outline-none" required />
              <input type="password" placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-green-50/30 border border-green-100 outline-none" required />
              <button type="submit" className="w-full bg-green-700 text-white p-4 rounded-2xl font-bold">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-[10px] font-bold text-green-700 underline">{isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}</button>
            </form>
          </div>
        )}
        {!showWeatherForecast && currentView === 'home' && renderHome()}
        {!showWeatherForecast && currentView === 'video-view' && renderVideoView()}
        {!showWeatherForecast && currentView === 'chat' && (
          <div className="p-4 flex flex-col h-[calc(100vh-140px)]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-[2rem] text-sm shadow-sm ${m.role === 'user' ? 'bg-green-700 text-white rounded-tr-none' : 'bg-white border border-green-100 text-gray-800 rounded-tl-none'}`}>
                    {m.image && <img src={m.image} className="w-full h-40 object-cover rounded-xl mb-3" />}
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-4 rounded-[2rem] text-sm shadow-sm bg-white border border-green-100 text-gray-400 rounded-tl-none italic animate-pulse">
                    {t.thinking}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <div className="relative">
              {/* Image Preview Area */}
              {selectedImage && (
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-2xl shadow-xl border border-green-100 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-green-50">
                    <img src={selectedImage} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setSelectedImage(null)} 
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm"
                    >
                      &times;
                    </button>
                  </div>
                  <span className="text-[10px] text-green-600 font-bold pr-2">Photo Ready</span>
                </div>
              )}

              <div className="bg-white p-2 rounded-full shadow-xl border border-green-50 flex items-center gap-2">
                <button onClick={() => imageInputRef.current?.click()} className="p-3 text-xl hover:bg-green-50 rounded-full transition-colors">📸</button>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const r = new FileReader(); r.onloadend = () => setSelectedImage(r.result as string); r.readAsDataURL(file);
                  }
                }} />
                <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Ask anything..." className="flex-1 px-2 outline-none text-sm" />
                <button onClick={handleSendMessage} className="w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center font-bold active:scale-90 transition-all">➔</button>
              </div>
            </div>
          </div>
        )}
        {!showWeatherForecast && currentView === 'handbook-categories' && (
          <div className="p-4 space-y-4 animate-in fade-in">
            <h2 className="text-2xl font-bold text-green-900 mb-4">{t.handbook}</h2>
            {Object.keys(d.handbook).map((slug) => (
              <div key={slug} onClick={() => { setSelectedCategory(slug); navigateTo('handbook-items'); }} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-green-50 flex justify-between items-center cursor-pointer active:scale-95 transition-all">
                <span className="font-bold text-green-800">{d.categoryLabels[slug] || slug}</span>
                <span className="text-green-400">➔</span>
              </div>
            ))}
          </div>
        )}
        {!showWeatherForecast && currentView === 'handbook-items' && selectedCategory && (
          <div className="p-4 space-y-4 pb-24">
            <h2 className="text-2xl font-bold text-green-900 mb-4">{d.categoryLabels[selectedCategory] || selectedCategory}</h2>
            <div className="grid grid-cols-2 gap-4">
              {d.handbook[selectedCategory].map(item => (
                <div key={item.id} onClick={() => { setSelectedItem(item); navigateTo('handbook-item-detail'); }} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-green-50 cursor-pointer active:scale-95 transition-all">
                  <div className="h-24 bg-gray-100">
                    {item.mediaType === 'image' ? <img src={item.mediaData} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">No Media</div>}
                  </div>
                  <div className="p-3 text-center text-xs font-bold text-green-800 truncate">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!showWeatherForecast && currentView === 'handbook-item-detail' && selectedItem && (
          <div className="p-0 pb-32">
            <div className="h-64 bg-gray-200 relative">
              {selectedItem.mediaType === 'image' && <img src={selectedItem.mediaData} className="w-full h-full object-cover" />}
              {selectedItem.mediaType === 'video' && <video src={selectedItem.mediaData} controls className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6"><h2 className="text-3xl font-bold text-white">{selectedItem.name}</h2></div>
            </div>
            <div className="p-6 space-y-6">
              {selectedItem.subHeadings.map(sh => (
                <div key={sh.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-green-50">
                  <h3 className="font-bold text-green-900 mb-2">{sh.title}</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{sh.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!showWeatherForecast && currentView === 'principles' && (
          <div className="p-4 space-y-4 pb-24 animate-in slide-in-from-bottom-4">
             <h2 className="text-2xl font-bold text-green-900 mb-4 px-1">APCNF Principles</h2>
             {d.principles.map(p => (
               <div key={p.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border-l-4 border-green-600">
                 <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{p.icon}</span><h3 className="font-bold text-green-800">{p.title}</h3></div>
                 <p className="text-gray-600 text-sm leading-relaxed">{p.description}</p>
               </div>
             ))}
          </div>
        )}
        {!showWeatherForecast && currentView === 'admin-login' && (
          <div className="p-8 flex flex-col justify-center min-h-[60vh]">
            <h2 className="text-2xl font-bold text-green-900 mb-6 text-center">Admin Access</h2>
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <input type="email" placeholder="Admin Email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full p-4 rounded-2xl bg-white border border-green-100 outline-none" required />
              <input type="password" placeholder="Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-white border border-green-100 outline-none" required />
              <button type="submit" className="w-full bg-green-700 text-white p-4 rounded-2xl font-bold">Authorize</button>
            </form>
          </div>
        )}
        {!showWeatherForecast && currentView === 'admin' && (
          <div className="p-4 space-y-6 pb-32">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-2xl font-bold text-green-900">{t.adminTitle}</h2>
              <button onClick={() => { setIsAdmin(false); navigateTo('home'); }} className="text-xs text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-full">Logout</button>
            </div>

            {editingItem ? (
              <form onSubmit={handleSaveEdit} className="bg-white p-6 rounded-[2.5rem] border border-green-100 shadow-xl space-y-4">
                <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-green-800">Edit {d.categoryLabels[editingItem.category]}</h3><button onClick={() => setEditingItem(null)}>&times;</button></div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-green-700 uppercase">{t.nameLabel}</label>
                  <input required value={editingItem.data.name} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} className="w-full p-3 rounded-xl bg-green-50/20 border border-green-100 outline-none text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-green-700 uppercase">{t.uploadMedia}</label>
                  <input type="file" ref={mediaInputRef} className="hidden" onChange={handleMediaUpload} />
                  <div onClick={() => mediaInputRef.current?.click()} className="w-full h-32 bg-green-50/20 rounded-xl border-2 border-dashed border-green-100 flex items-center justify-center cursor-pointer overflow-hidden">
                    {editingItem.data.mediaData ? (editingItem.data.mediaType === 'image' ? <img src={editingItem.data.mediaData} className="w-full h-full object-cover" /> : <div className="text-xs text-green-700">Video Selected</div>) : <span className="text-green-400 text-xs">Click to upload Image/Video</span>}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><label className="text-[10px] font-bold text-green-700 uppercase">{t.subHeadings}</label><button type="button" onClick={() => setEditingItem({...editingItem, data: {...editingItem.data, subHeadings: [...editingItem.data.subHeadings, {id: generateId(), title: '', content: ''}]}})} className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full">+{t.addItem}</button></div>
                  {editingItem.data.subHeadings.map((sh, idx) => (
                    <div key={sh.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 relative">
                      <button type="button" onClick={() => {
                        const next = editingItem.data.subHeadings.filter((_, i) => i !== idx);
                        setEditingItem({...editingItem, data: {...editingItem.data, subHeadings: next}});
                      }} className="absolute -top-2 -right-2 bg-red-100 text-red-500 w-5 h-5 rounded-full flex items-center justify-center text-xs">×</button>
                      <input placeholder="Sub-heading Title" value={sh.title} onChange={(e) => {
                        const next = [...editingItem.data.subHeadings]; next[idx].title = e.target.value;
                        setEditingItem({...editingItem, data: {...editingItem.data, subHeadings: next}});
                      }} className="w-full p-2 text-xs font-bold border border-gray-200 rounded-lg outline-none" />
                      <textarea placeholder="Content" value={sh.content} onChange={(e) => {
                        const next = [...editingItem.data.subHeadings]; next[idx].content = e.target.value;
                        setEditingItem({...editingItem, data: {...editingItem.data, subHeadings: next}});
                      }} className="w-full p-2 text-xs h-20 border border-gray-200 rounded-lg outline-none" />
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={isSyncing} className="w-full bg-green-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2">{isSyncing ? 'Syncing...' : 'Save & Sync'}</button>
              </form>
            ) : (
              <div className="space-y-6">
                <button onClick={handleResetData} className="w-full bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold">Reset Handbook</button>
                
            <div className="bg-white p-6 rounded-[2.5rem] border border-green-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-green-700 uppercase">{t.video}</h4>
                  
                  <div className="space-y-3 p-4 bg-green-50/20 rounded-3xl border border-green-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-green-700 uppercase">{t.videoTitle}</label>
                      <input 
                        id="new-video-title"
                        placeholder="e.g. Introduction to APCNF" 
                        className="w-full p-3 rounded-xl bg-white border border-green-100 text-xs outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-green-700 uppercase">{t.videoUrlLabel}</label>
                      <input 
                        id="new-video-url"
                        placeholder="https://youtube.com/..." 
                        className="w-full p-3 rounded-xl bg-white border border-green-100 text-xs outline-none" 
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const titleInput = document.getElementById('new-video-title') as HTMLInputElement;
                        const urlInput = document.getElementById('new-video-url') as HTMLInputElement;
                        const title = titleInput.value.trim();
                        const url = urlInput.value.trim();
                        
                        if (!title || !url) {
                          alert("Please provide both title and URL");
                          return;
                        }

                        setAppData(prev => {
                          const next = { ...prev };
                          const newVideo = { id: generateId(), title, url };
                          (Object.keys(next) as Language[]).forEach(lang => {
                            next[lang].videos = [...next[lang].videos, newVideo];
                          });
                          return next;
                        });
                        
                        titleInput.value = '';
                        urlInput.value = '';
                        showToast("Video Added");
                      }} 
                      className="w-full bg-green-700 text-white p-3 rounded-xl text-xs font-bold active:scale-95 transition-all"
                    >
                      {t.addVideo}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {d.videos.map((video) => (
                      <div key={video.id} className="bg-white p-3 rounded-2xl border border-green-50 shadow-sm flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-green-800 line-clamp-1">{video.title}</span>
                          <span className="text-[8px] text-gray-400 truncate max-w-[150px]">{video.url}</span>
                        </div>
                        <button 
                          onClick={() => {
                            if (!confirm("Delete this video?")) return;
                            setAppData(prev => {
                              const next = { ...prev };
                              (Object.keys(next) as Language[]).forEach(lang => {
                                next[lang].videos = next[lang].videos.filter(v => v.id !== video.id);
                              });
                              return next;
                            });
                            showToast("Video Deleted");
                          }} 
                          className="text-[10px] bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold"
                        >
                          {t.delete}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-green-100 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-green-700 uppercase">{t.addCategory}</h4>
                  <div className="flex gap-2">
                    <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder={t.categoryName} className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs outline-none" />
                    <button onClick={handleAddCategory} disabled={isSyncing} className="bg-green-700 text-white px-4 rounded-xl text-xs font-bold active:scale-95 transition-all">
                      {isSyncing ? '...' : '+'}
                    </button>
                  </div>
                </div>

                {Object.keys(d.handbook).map((slug) => (
                  <div key={slug} className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-xs font-bold text-green-700 uppercase">{d.categoryLabels[slug] || slug}</h4>
                      <div className="flex gap-2">
                        <button onClick={() => handleDeleteCategory(slug)} className="text-[10px] bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold">{t.deleteCategory}</button>
                        <button onClick={() => setEditingItem({category: slug, data: {id: generateId(), name: '', mediaType: 'none', mediaData: '', subHeadings: []}})} className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full">+ {t.addItem}</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {d.handbook[slug].map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm flex justify-between items-center">
                          <span className="text-xs font-bold text-green-800">{item.name}</span>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingItem({category: slug, data: item})} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{t.edit}</button>
                            <button onClick={() => {
                              if (!confirm("Delete?")) return;
                              setAppData(prev => {
                                const next = {...prev};
                                (Object.keys(next) as Language[]).forEach(l => {
                                  next[l].handbook[slug] = next[l].handbook[slug].filter(i => i.id !== item.id);
                                });
                                return next;
                              });
                            }} className="text-[10px] bg-red-50 text-red-600 px-3 py-1 rounded-full">{t.delete}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {user && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-md border-t border-green-50 flex justify-around p-4 safe-bottom shadow-2xl z-50">
          <button onClick={() => navigateTo('home')} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-green-700' : 'text-gray-400'}`}><span className="text-xl">🏠</span><span className="text-[10px] font-bold">{t.home}</span></button>
          <button onClick={() => navigateTo('video-view')} className={`flex flex-col items-center gap-1 ${currentView === 'video-view' ? 'text-green-700' : 'text-gray-400'}`}><span className="text-xl">🎥</span><span className="text-[10px] font-bold">{t.video}</span></button>
          <button onClick={() => navigateTo('chat')} className={`flex flex-col items-center gap-1 ${currentView === 'chat' ? 'text-green-700' : 'text-gray-400'}`}><span className="text-xl">💬</span><span className="text-[10px] font-bold">{t.chat}</span></button>
          <button onClick={() => navigateTo('handbook-categories')} className={`flex flex-col items-center gap-1 ${currentView.includes('handbook') ? 'text-green-700' : 'text-gray-400'}`}><span className="text-xl">📚</span><span className="text-[10px] font-bold">{t.handbook}</span></button>
        </nav>
      )}
    </div>
  );
};

export default App;
