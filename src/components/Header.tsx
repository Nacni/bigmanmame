import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const location = useLocation();
  const { currentLanguage, setCurrentLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark/light mode
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Set language
  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    setIsLanguageMenuOpen(false);
  };

  const navLinks = [
    { label: 'nav.home', href: '/' },
    { label: 'nav.about', href: '/about' },
    { label: 'nav.services', href: '/services' },
    { label: 'nav.portfolio', href: '/portfolio' },
    { label: 'nav.blog', href: '/blog' },
    { label: 'nav.videos', href: '/videos' },
    { label: 'nav.journey', href: '/journey' },
    { label: 'nav.contact', href: '/contact' },
  ];

  const languages = [
    { code: 'somali', name: 'Somali', native: 'Soomaali' },
    { code: 'arabic', name: 'Arabic', native: 'العربية' },
    { code: 'spanish', name: 'Spanish', native: 'Español' },
    { code: 'swahili', name: 'Swahili', native: 'Kiswahili' },
    { code: 'french', name: 'French', native: 'Français' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Get current language name
  const currentLanguageName = languages.find(lang => lang.code === currentLanguage)?.native || 'Soomaali';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-neon' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-primary animate-glow">
          Cabdalla Xuseen Cali
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`transition-colors duration-300 font-medium text-lg ${
                isActive(link.href) 
                  ? 'text-primary' 
                  : 'text-foreground hover:text-primary'
              }`}
            >
              {t(link.label)}
            </Link>
          ))}
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              <Globe size={20} />
              <span>{currentLanguageName}</span>
            </button>
            
            {isLanguageMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => setLanguage(language.code)}
                    className={`block w-full text-left px-4 py-2 text-base ${
                      currentLanguage === language.code
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {language.native}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-foreground hover:text-primary transition-colors duration-300"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          
          <Button 
            variant="default" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all duration-300"
            asChild
          >
            <Link to="/contact">{t('nav.letsTalk')}</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4 lg:hidden">
          <button
            onClick={toggleTheme}
            className="text-foreground hover:text-primary transition-colors duration-300"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button
            className="text-foreground hover:text-primary transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`block w-full text-left transition-colors duration-300 font-medium py-2 text-lg ${
                  isActive(link.href) 
                    ? 'text-primary' 
                    : 'text-foreground hover:text-primary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t(link.label)}
              </Link>
            ))}
            
            {/* Mobile Language Selector */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">{t('nav.language')}</span>
                <button
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors duration-300"
                >
                  <Globe size={16} />
                  <span>{currentLanguageName}</span>
                </button>
              </div>
              
              {isLanguageMenuOpen && (
                <div className="mt-2 space-y-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => setLanguage(language.code)}
                      className={`block w-full text-left px-3 py-2 text-base ${
                        currentLanguage === language.code
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {language.native}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              variant="default" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow mt-4"
              asChild
            >
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>{t('nav.letsTalk')}</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;