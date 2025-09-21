import { Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  
  const footerLinks = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Accessibility', href: '#' },
  ];

  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">Cabdalla Xuseen Cali</h3>
            <p className="text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">{t('footer.quickLinks')}</h4>
            <nav className="space-y-2">
              <a href="#about" className="block text-muted-foreground hover:text-primary transition-colors duration-300">
                {t('nav.about')}
              </a>
              <a href="#services" className="block text-muted-foreground hover:text-primary transition-colors duration-300">
                {t('nav.services')}
              </a>
              <a href="#portfolio" className="block text-muted-foreground hover:text-primary transition-colors duration-300">
                {t('nav.portfolio')}
              </a>
              <a href="#contact" className="block text-muted-foreground hover:text-primary transition-colors duration-300">
                {t('nav.contact')}
              </a>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">{t('footer.legal')}</h4>
            <nav className="space-y-2">
              {footerLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href} 
                  className="block text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-8"></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-muted-foreground text-center md:text-left">
            © {currentYear} Cabdalla Xuseen Cali. {t('footer.rights')}
          </p>
          
          <div className="flex items-center text-muted-foreground">
            <span>{t('footer.designed')}</span>
            <Heart className="h-4 w-4 mx-1 text-primary animate-pulse" />
            <span>{t('footer.forSomalia')}</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            {t('footer.additionalInfo')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;