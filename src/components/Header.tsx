import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

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