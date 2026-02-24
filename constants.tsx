
import { Principle, Language, Translations, AppData } from './types';

export const UI_TRANSLATIONS: Record<Language, Translations> = {
  te: {
    home: "హోమ్",
    chat: "సలహాదారు",
    handbook: "హ్యాండ్‌బుక్",
    principles: "సూత్రాలు",
    back: "వెనుకకు",
    welcome: "శుభోదయం రైతు సోదరా!",
    tagline: "APCNF ప్రకృతి వ్యవసాయంతో భూమిని రక్షించండి, ఆరోగ్యాన్ని కాపాడండి.",
    askAi: "AI తో మాట్లాడండి",
    viewAll: "అన్నీ చూడండి",
    note: "ముఖ్య గమనిక",
    noteContent: "రసాయన ఎరువుల వాడకం వల్ల నేల సారం తగ్గిపోవడమే కాకుండా, మన ఆరోగ్యానికి కూడా ముప్పు. ప్రకృతి వ్యవసాయం ద్వారా తక్కువ పెట్టుబడితో ఎక్కువ లాభం పొందవచ్చు.",
    popularItems: "ప్రముఖ విషయాలు",
    adminTitle: "అడ్మిన్ ప్యానెల్",
    edit: "సవరించు",
    save: "సేవ్",
    cancel: "రద్దు",
    delete: "తొలగించు",
    addItem: "కొత్తది జోడించు",
    content: "విషయ సూచిక",
    adminPanel: "అడ్మిన్",
    subHeadings: "ఉప శీర్షికలు",
    addSubHeading: "ఉప శీర్షికను జోడించు",
    crops: "పంటలు",
    concoctions: "కషాయాలు",
    pestControl: "పురుగుల & తెగుళ్ల నివారణ",
    successStories: "విజయ గాథలు",
    mediaType: "మీడియా రకం",
    uploadMedia: "మీడియా అప్‌లోడ్",
    nameLabel: "పేరు",
    addCategory: "కొత్త కేటగిరీని జోడించు",
    categoryName: "కేటగిరీ పేరు",
    deleteCategory: "కేటగిరీని తొలగించు",
    weatherTitle: "రోజువారీ వాతావరణ సమాచారం",
    temperature: "ఉష్ణోగ్రత",
    humidity: "తేమ",
    condition: "వాతావరణం",
    forecastTitle: "రాబోయే 10 రోజుల వాతావరణం",
    pmdsCalculator: "PMDS విత్తన క్యాలిక్యులేటర్",
    acresLabel: "ఎకరాల సంఖ్య",
    calculate: "లెక్కించు",
    totalSeedsNeeded: "మొత్తం విత్తనాలు",
    seedVariety: "పంట వర్గం",
    quantity: "పరిమాణం (కిలోలు)",
    shareTitle: "PMDS విత్తన చార్ట్",
    shareBody: "నా PMDS విత్తన క్యాలిక్యులేషన్ వివరాలు ఇక్కడ ఉన్నాయి:",
    thinking: "ఆలోచిస్తున్నాను...",
    video: "వీడియోలు",
    videoUrlLabel: "వీడియో లింక్ (YouTube/Direct)",
    addVideo: "వీడియోను జోడించు",
    videoTitle: "వీడియో శీర్షిక"
  },
  hi: {
    home: "होम",
    chat: "सलाहकार",
    handbook: "हैंडबुक",
    principles: "सिद्धांत",
    back: "पीछे",
    welcome: "नमस्ते किसान भाई!",
    tagline: "APCNF प्राकृतिक खेती के साथ मिट्टी की रक्षा करें और स्वास्थ्य बचाएं।",
    askAi: "AI से बात करें",
    viewAll: "सभी देखें",
    note: "महत्वपूर्ण नोट",
    noteContent: "रासायनिक उर्वरकों का उपयोग मिट्टी की उर्वरता को कम करता है। प्राकृतिक खेती से अधिक लाभ प्राप्त किया जा सकता है।",
    popularItems: "लोकप्रिय विषय",
    adminTitle: "एडमिन पैनल",
    edit: "संपादित करें",
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    addItem: "नया जोड़ें",
    content: "सामग्री",
    adminPanel: "एडमिन",
    subHeadings: "उप-शीर्षक",
    addSubHeading: "उप-शीर्षक जोड़ें",
    crops: "फसलें",
    concoctions: "कषाय",
    pestControl: "कीट एवं रोग नियंत्रण",
    successStories: "सफलता की कहानियां",
    mediaType: "मीडिया प्रकार",
    uploadMedia: "मीडिया अपलोड करें",
    nameLabel: "नाम",
    addCategory: "नई श्रेणी जोड़ें",
    categoryName: "श्रेणी का नाम",
    deleteCategory: "श्रेणी हटाएं",
    weatherTitle: "दैनिक मौसम की जानकारी",
    temperature: "तापमान",
    humidity: "नमी",
    condition: "स्थिति",
    forecastTitle: "अगले 10 दिनों का मौसम",
    pmdsCalculator: "PMDS बीज कैलकुलेटर",
    acresLabel: "एकड़ की संख्या",
    calculate: "गणना करें",
    totalSeedsNeeded: "कुल आवश्यक बीज",
    seedVariety: "फसल श्रेणी",
    quantity: "मात्रा (किलोग्राम)",
    shareTitle: "PMDS बीज चार्ट",
    shareBody: "मेरा PMDS बीज गणना विवरण यहाँ है:",
    thinking: "सोच रहा हूँ...",
    video: "वीडियो",
    videoUrlLabel: "वीडियो लिंक (YouTube/Direct)",
    addVideo: "वीडियो जोड़ें",
    videoTitle: "वीडियो शीर्षक"
  },
  en: {
    home: "Home",
    chat: "Assistant",
    handbook: "Handbook",
    principles: "Principles",
    back: "Back",
    welcome: "Welcome Farmer!",
    tagline: "Protect the earth and health with APCNF Natural Farming.",
    askAi: "Talk to AI",
    viewAll: "View All",
    note: "Important Note",
    noteContent: "Chemical fertilizers reduce soil fertility. Natural farming offers higher profits with lower investment.",
    popularItems: "Popular Topics",
    adminTitle: "Admin Panel",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    addItem: "Add New",
    content: "Content",
    adminPanel: "Admin",
    subHeadings: "Sub-headings",
    addSubHeading: "Add Sub-heading",
    crops: "Crops",
    concoctions: "Concoctions",
    pestControl: "Pest & Disease Control",
    successStories: "Success Stories",
    mediaType: "Media Type",
    uploadMedia: "Upload Media",
    nameLabel: "Name",
    addCategory: "Add New Category",
    categoryName: "Category Name",
    deleteCategory: "Delete Category",
    weatherTitle: "Daily Weather Information",
    temperature: "Temperature",
    humidity: "Humidity",
    condition: "Condition",
    forecastTitle: "10-Day Weather Forecast",
    pmdsCalculator: "PMDS Seed Calculator",
    acresLabel: "Number of Acres",
    calculate: "Calculate",
    totalSeedsNeeded: "Total Seeds Needed",
    seedVariety: "Crop Category",
    quantity: "Quantity (kg)",
    shareTitle: "PMDS Seed Chart",
    shareBody: "My PMDS seed calculation details are here:",
    thinking: "Thinking...",
    video: "Videos",
    videoUrlLabel: "Video Link (YouTube/Direct)",
    addVideo: "Add Video",
    videoTitle: "Video Title"
  }
};

export const INITIAL_DATA: Record<Language, AppData> = {
  te: {
    principles: [
      { id: 1, title: "జీవామృతం", description: "నేల ఆరోగ్యాన్ని పెంపొందించే సూక్ష్మజీవుల మిశ్రమం.", icon: "🧪" },
      { id: 2, title: "బీజామృతం", description: "విత్తన శుద్ధి కోసం ప్రకృతి సిద్ధమైన ద్రావణం.", icon: "🌱" }
    ],
    categoryLabels: {
      crops: "పంటలు",
      concoctions: "కషాయాలు",
      pest_control: "పురుగుల & తెగుళ్ల నివారణ",
      success_stories: "విజయ గాథలు"
    },
    videos: [
      { id: "v1", title: "ప్రకృతి వ్యవసాయం పరిచయం", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
    ],
    handbook: {
      crops: [
        { id: "c1", name: "వరి", mediaType: "image", mediaData: "https://images.unsplash.com/photo-1536633342598-3f3996773347?auto=format&fit=crop&q=80&w=400", subHeadings: [{ id: "s1", title: "పరిచయం", content: "వరి ఒక ప్రధాన ఆహార పంట." }] }
      ],
      concoctions: [
        { id: "k1", name: "అజ్ఞాస్త్రం", mediaType: "none", mediaData: "", subHeadings: [{ id: "s2", title: "ఉపయోగాలు", content: "కాండం తొలుచు పురుగు నివారణకు." }] }
      ],
      pest_control: [],
      success_stories: []
    }
  },
  hi: {
    principles: [
      { id: 1, title: "जीवामृत", description: "मिट्टी के स्वास्थ्य के लिए सूक्ष्मजीव मिश्रण।", icon: "🧪" }
    ],
    categoryLabels: {
      crops: "फसलें",
      concoctions: "कषाय",
      pest_control: "कीट एवं रोग नियंत्रण",
      success_stories: "सफलता की कहानियां"
    },
    videos: [
      { id: "v1", title: "प्राकृतिक खेती का परिचय", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
    ],
    handbook: {
      crops: [],
      concoctions: [],
      pest_control: [],
      success_stories: []
    }
  },
  en: {
    principles: [
      { id: 1, title: "Jeevamrutham", description: "Microbial culture for soil health.", icon: "🧪" }
    ],
    categoryLabels: {
      crops: "Crops",
      concoctions: "Concoctions",
      pest_control: "Pest & Disease Control",
      success_stories: "Success Stories"
    },
    videos: [
      { id: "v1", title: "Introduction to Natural Farming", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
    ],
    handbook: {
      crops: [],
      concoctions: [],
      pest_control: [],
      success_stories: []
    }
  }
};
