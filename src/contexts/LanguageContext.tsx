import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our translation data
interface Translations {
  [key: string]: {
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

// Translation data - only English now
const translations: Translations = {
  // Navigation
  'nav.home': {
    english: 'Home'
  },
  'nav.about': {
    english: 'About'
  },
  'nav.services': {
    english: 'Services'
  },
  'nav.portfolio': {
    english: 'Portfolio'
  },
  'nav.blog': {
    english: 'Blog'
  },
  'nav.videos': {
    english: 'Videos'
  },
  'nav.journey': {
    english: 'Journey'
  },
  'nav.contact': {
    english: 'Contact'
  },
  'nav.letsTalk': {
    english: 'Let\'s Talk'
  },
  
  // Common
  'common.loading': {
    english: 'Loading...'
  },
  'common.error': {
    english: 'An error occurred'
  },
  
  // Blog
  'blog.publishedArticle': {
    english: 'Published Article'
  },
  'blog.readingTime': {
    english: 'min read'
  },
  'blog.shareArticle': {
    english: 'Share Article'
  },
  'blog.comments': {
    english: 'Comments'
  },
  'blog.leaveComment': {
    english: 'Leave a Comment'
  },
  'blog.name': {
    english: 'Name'
  },
  'blog.email': {
    english: 'Email'
  },
  'blog.comment': {
    english: 'Comment'
  },
  'blog.submitComment': {
    english: 'Submit Comment'
  },
  'blog.noComments': {
    english: 'No comments yet'
  },
  'blog.beFirst': {
    english: 'Be the first to comment!'
  },
  'blog.enterName': {
    english: 'Enter your name'
  },
  'blog.enterEmail': {
    english: 'Enter your email'
  },
  'blog.enterComment': {
    english: 'Enter your comment'
  },
  'blog.submitting': {
    english: 'Submitting...'
  },
  'blog.commentSubmitted': {
    english: 'Comment submitted! It will appear after approval.'
  },
  'blog.commentError': {
    english: 'Error submitting comment. Please try again.'
  },
  'blog.articleNotFound': {
    english: 'Article not found'
  },
  'blog.articleNotFoundMessage': {
    english: 'The article you\'re looking for doesn\'t exist or has been removed.'
  },
  'blog.articleLoadError': {
    english: 'We encountered an error while loading the article.'
  },
  'blog.goBack': {
    english: 'Go Back'
  },
  'blog.viewAllArticles': {
    english: 'View All Articles'
  },
  'blog.backToArticles': {
    english: 'Back to Articles'
  },
  'blog.publishedOn': {
    english: 'Published on'
  },
  'blog.byAuthor': {
    english: 'By Cabdalla Xuseen Cali'
  },
  'blog.share': {
    english: 'Share'
  },
  'blog.moreArticles': {
    english: 'More Articles'
  },
  
  // Contact
  'contact.title': {
    english: 'Contact'
  },
  'contact.name': {
    english: 'Name'
  },
  'contact.email': {
    english: 'Email'
  },
  'contact.message': {
    english: 'Message'
  },
  'contact.send': {
    english: 'Send Message'
  },
  
  // Footer
  'footer.description': {
    english: 'Member of Parliament, dedicated to serving Somalia and its people through democratic governance, security reform, and community development.'
  },
  'footer.quickLinks': {
    english: 'Quick Links'
  },
  'footer.legal': {
    english: 'Legal'
  },
  'footer.rights': {
    english: 'All rights reserved'
  },
  'footer.designed': {
    english: 'Designed and built by'
  },
  'footer.forSomalia': {
    english: 'for Somalia\'s future'
  },
  'footer.additionalInfo': {
    english: 'This website serves as a digital portfolio showcasing legislative work and public service achievements. For official parliamentary matters, please contact the Federal Parliament of Somalia directly.'
  }
};

// Language provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('english');

  // Translation function - only English now
  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      // If translation doesn't exist, return the key
      return key;
    }
    return translation.english || key;
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