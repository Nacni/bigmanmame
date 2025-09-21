import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our translation data
interface Translations {
  [key: string]: {
    somali: string;
    english: string;
  };
}

// Define the context type
interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;
  t: (key: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations: Translations = {
  // Navigation
  'nav.home': {
    somali: 'Hogaami',
    english: 'Home'
  },
  'nav.about': {
    somali: 'Ku saabsan',
    english: 'About'
  },
  'nav.services': {
    somali: 'Adeegyada',
    english: 'Services'
  },
  'nav.portfolio': {
    somali: 'Portfolio',
    english: 'Portfolio'
  },
  'nav.blog': {
    somali: 'Blog',
    english: 'Blog'
  },
  'nav.videos': {
    somali: 'Muuqaalo',
    english: 'Videos'
  },
  'nav.journey': {
    somali: 'Safar',
    english: 'Journey'
  },
  'nav.contact': {
    somali: 'La xiriir',
    english: 'Contact'
  },
  'nav.letsTalk': {
    somali: 'Haadhadhin',
    english: 'Let\'s Talk'
  },
  'nav.language': {
    somali: 'Luuqada',
    english: 'Language'
  },
  
  // Common
  'common.loading': {
    somali: 'Raraya...',
    english: 'Loading...'
  },
  'common.error': {
    somali: 'Khalad ayaa dhacay',
    english: 'An error occurred'
  },
  
  // Blog
  'blog.publishedArticle': {
    somali: 'Maqal La Daabacay',
    english: 'Published Article'
  },
  'blog.readingTime': {
    somali: 'daqiiqo akhri',
    english: 'min read'
  },
  'blog.shareArticle': {
    somali: 'La wadaag maqalka',
    english: 'Share Article'
  },
  'blog.comments': {
    somali: 'Faallooyin',
    english: 'Comments'
  },
  'blog.leaveComment': {
    somali: 'Faallo geli',
    english: 'Leave a Comment'
  },
  'blog.name': {
    somali: 'Magac',
    english: 'Name'
  },
  'blog.email': {
    somali: 'Email',
    english: 'Email'
  },
  'blog.comment': {
    somali: 'Faallo',
    english: 'Comment'
  },
  'blog.submitComment': {
    somali: 'Geli faallada',
    english: 'Submit Comment'
  },
  'blog.noComments': {
    somali: 'Wali ma jiraan faallooyin',
    english: 'No comments yet'
  },
  'blog.beFirst': {
    somali: 'Noqo kan ugu horreeya inuu faallo geliyo!',
    english: 'Be the first to comment!'
  },
  'blog.enterName': {
    somali: 'Geli magacaaga',
    english: 'Enter your name'
  },
  'blog.enterEmail': {
    somali: 'Geli emailkaaga',
    english: 'Enter your email'
  },
  'blog.enterComment': {
    somali: 'Geli faalladaada',
    english: 'Enter your comment'
  },
  'blog.submitting': {
    somali: 'Gelinaayo...',
    english: 'Submitting...'
  },
  'blog.commentSubmitted': {
    somali: 'Faallada waa la geliyay! Waxay soo muuqan doontaa ka dib marka la oggolaado.',
    english: 'Comment submitted! It will appear after approval.'
  },
  'blog.commentError': {
    somali: 'Khalad ayaa dhacay marka la gelinayo faallada. Fadlan ku celi.',
    english: 'Error submitting comment. Please try again.'
  },
  'blog.articleNotFound': {
    somali: 'Maqalka lama helin',
    english: 'Article not found'
  },
  'blog.articleNotFoundMessage': {
    somali: 'Maqalka aad raadisay ma jiro ama waa laga saaray.',
    english: 'The article you\'re looking for doesn\'t exist or has been removed.'
  },
  'blog.articleLoadError': {
    somali: 'Waxaanu khalad u dhacay marka la raray maqalka.',
    english: 'We encountered an error while loading the article.'
  },
  'blog.goBack': {
    somali: 'Ku noqo',
    english: 'Go Back'
  },
  'blog.viewAllArticles': {
    somali: 'Eeg Dhammaan Maqalada',
    english: 'View All Articles'
  },
  'blog.backToArticles': {
    somali: 'Ku noqo Maqalada',
    english: 'Back to Articles'
  },
  'blog.publishedOn': {
    somali: 'La daabacay',
    english: 'Published on'
  },
  'blog.byAuthor': {
    somali: 'By Cabdalla Xuseen Cali',
    english: 'By Cabdalla Xuseen Cali'
  },
  'blog.share': {
    somali: 'La wadaag',
    english: 'Share'
  },
  'blog.moreArticles': {
    somali: 'Maqaladoodan',
    english: 'More Articles'
  },
  
  // Contact
  'contact.title': {
    somali: 'La xiriir',
    english: 'Contact'
  },
  'contact.name': {
    somali: 'Magac',
    english: 'Name'
  },
  'contact.email': {
    somali: 'Email',
    english: 'Email'
  },
  'contact.message': {
    somali: 'Fariin',
    english: 'Message'
  },
  'contact.send': {
    somali: 'Dir fariinta',
    english: 'Send Message'
  },
  
  // Footer
  'footer.description': {
    somali: 'Xubnaha Baarlamaanka, ku dede jiray in ay u adeegtaan Soomaaliya iyo dadkiisa iyadoo lagu dabaali doono doorasho demokraadiga, habaynta amniga, iyo horumarinta bulshada.',
    english: 'Member of Parliament, dedicated to serving Somalia and its people through democratic governance, security reform, and community development.'
  },
  'footer.quickLinks': {
    somali: 'Xidhiidho degdeg ah',
    english: 'Quick Links'
  },
  'footer.legal': {
    somali: 'Sharciga',
    english: 'Legal'
  },
  'footer.rights': {
    somali: 'Dhammaan xuquuqda waa meel la kaydiyay',
    english: 'All rights reserved'
  },
  'footer.designed': {
    somali: 'La naqshay iyo la sameeyay',
    english: 'Designed and built by'
  },
  'footer.forSomalia': {
    somali: 'mustaqbalka Soomaaliya',
    english: 'for Somalia\'s future'
  },
  'footer.additionalInfo': {
    somali: 'Websitekan wuxuu u adeegaa sida portfolio dijital ah oo lagu muujinayo shaqada sharciga iyo guulaha adeegga dadweynaha. Waajibka rasmiyada baarlamaanka, fadlan la xiriir Baarlamaanka Federaalka ee Soomaaliya si toos ah.',
    english: 'This website serves as a digital portfolio showcasing legislative work and public service achievements. For official parliamentary matters, please contact the Federal Parliament of Somalia directly.'
  }
};

// Language provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('somali');

  // Load language preference from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && ['somali', 'english'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', currentLanguage);
  }, [currentLanguage]);

  // Translation function
  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      // If translation doesn't exist, return the key
      return key;
    }
    return translation[currentLanguage as keyof typeof translation] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};