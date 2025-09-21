import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our translation data
interface Translations {
  [key: string]: {
    somali: string;
    arabic: string;
    spanish: string;
    swahili: string;
    french: string;
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
    arabic: 'الرئيسية',
    spanish: 'Inicio',
    swahili: 'Nyumbani',
    french: 'Accueil'
  },
  'nav.about': {
    somali: 'Ku saabsan',
    arabic: 'حول',
    spanish: 'Acerca de',
    swahili: 'Kuhusu',
    french: 'À propos'
  },
  'nav.services': {
    somali: 'Adeegyada',
    arabic: 'الخدمات',
    spanish: 'Servicios',
    swahili: 'Huduma',
    french: 'Services'
  },
  'nav.portfolio': {
    somali: 'Portfolio',
    arabic: 'معرض الأعمال',
    spanish: 'Portafolio',
    swahili: 'Portfolio',
    french: 'Portfolio'
  },
  'nav.blog': {
    somali: 'Blog',
    arabic: 'مدونة',
    spanish: 'Blog',
    swahili: 'Blogu',
    french: 'Blog'
  },
  'nav.videos': {
    somali: 'Muuqaalo',
    arabic: 'فيديوهات',
    spanish: 'Videos',
    swahili: 'Video',
    french: 'Vidéos'
  },
  'nav.journey': {
    somali: 'Safar',
    arabic: 'رحلة',
    spanish: 'Viaje',
    swahili: 'Safari',
    french: 'Parcours'
  },
  'nav.contact': {
    somali: 'La xiriir',
    arabic: 'اتصل بنا',
    spanish: 'Contacto',
    swahili: 'Mawasiliano',
    french: 'Contact'
  },
  'nav.letsTalk': {
    somali: 'Haadhadhin',
    arabic: 'لنتحدث',
    spanish: 'Hablemos',
    swahili: 'Zungumza',
    french: 'Parlons'
  },
  'nav.language': {
    somali: 'Luuqada',
    arabic: 'اللغة',
    spanish: 'Idioma',
    swahili: 'Lugha',
    french: 'Langue'
  },
  
  // Common
  'common.loading': {
    somali: 'Raraya...',
    arabic: 'جار التحميل...',
    spanish: 'Cargando...',
    swahili: 'Inapakia...',
    french: 'Chargement...'
  },
  'common.error': {
    somali: 'Khalad ayaa dhacay',
    arabic: 'حدث خطأ',
    spanish: 'Ha ocurrido un error',
    swahili: 'Hitilafu imetokea',
    french: 'Une erreur est survenue'
  },
  
  // Blog
  'blog.publishedArticle': {
    somali: 'Maqal La Daabacay',
    arabic: 'مقال منشور',
    spanish: 'Artículo Publicado',
    swahili: 'Makala Iliyochapishwa',
    french: 'Article Publié'
  },
  'blog.readingTime': {
    somali: 'daqiiqo akhri',
    arabic: 'دقائق قراءة',
    spanish: 'minutos de lectura',
    swahili: 'dakika za kusoma',
    french: 'minutes de lecture'
  },
  'blog.shareArticle': {
    somali: 'La wadaag maqalka',
    arabic: 'مشاركة المقال',
    spanish: 'Compartir Artículo',
    swahili: 'Shiriki Makala',
    french: 'Partager l\'Article'
  },
  'blog.comments': {
    somali: 'Faallooyin',
    arabic: 'تعليقات',
    spanish: 'Comentarios',
    swahili: 'Maoni',
    french: 'Commentaires'
  },
  'blog.leaveComment': {
    somali: 'Faallo geli',
    arabic: 'اترك تعليقًا',
    spanish: 'Dejar un comentario',
    swahili: 'Acha Maoni',
    french: 'Laisser un commentaire'
  },
  'blog.name': {
    somali: 'Magac',
    arabic: 'الاسم',
    spanish: 'Nombre',
    swahili: 'Jina',
    french: 'Nom'
  },
  'blog.email': {
    somali: 'Email',
    arabic: 'البريد الإلكتروني',
    spanish: 'Correo Electrónico',
    swahili: 'Barua Pepe',
    french: 'Email'
  },
  'blog.comment': {
    somali: 'Faallo',
    arabic: 'تعليق',
    spanish: 'Comentario',
    swahili: 'Maoni',
    french: 'Commentaire'
  },
  'blog.submitComment': {
    somali: 'Geli faallada',
    arabic: 'إرسال التعليق',
    spanish: 'Enviar Comentario',
    swahili: 'Tuma Maoni',
    french: 'Soumettre le commentaire'
  },
  'blog.noComments': {
    somali: 'Wali ma jiraan faallooyin',
    arabic: 'لا توجد تعليقات حتى الآن',
    spanish: 'Aún no hay comentarios',
    swahili: 'Hakuna maoni bado',
    french: 'Aucun commentaire pour le moment'
  },
  'blog.beFirst': {
    somali: 'Noqo kan ugu horreeya inuu faallo geliyo!',
    arabic: 'كن أول من يعلق!',
    spanish: '¡Sé el primero en comentar!',
    swahili: 'Kuwa wa kwanza kuacha maoni!',
    french: 'Soyez le premier à commenter !'
  },
  'blog.enterName': {
    somali: 'Geli magacaaga',
    arabic: 'أدخل اسمك',
    spanish: 'Ingresa tu nombre',
    swahili: 'Ingiza jina lako',
    french: 'Entrez votre nom'
  },
  'blog.enterEmail': {
    somali: 'Geli emailkaaga',
    arabic: 'أدخل بريدك الإلكتروني',
    spanish: 'Ingresa tu correo electrónico',
    swahili: 'Ingiza barua pepe yako',
    french: 'Entrez votre email'
  },
  'blog.enterComment': {
    somali: 'Geli faalladaada',
    arabic: 'أدخل تعليقك',
    spanish: 'Ingresa tu comentario',
    swahili: 'Ingiza maoni yako',
    french: 'Entrez votre commentaire'
  },
  'blog.submitting': {
    somali: 'Gelinaayo...',
    arabic: 'جار الإرسال...',
    spanish: 'Enviando...',
    swahili: 'Inatuma...',
    french: 'Envoi en cours...'
  },
  'blog.commentSubmitted': {
    somali: 'Faallada waa la geliyay! Waxay soo muuqan doontaa ka dib marka la oggolaado.',
    arabic: 'تم إرسال التعليق! سيظهر بعد الموافقة عليه.',
    spanish: '¡Comentario enviado! Aparecerá después de ser aprobado.',
    swahili: 'Maoni yametumwa! Yataonekana baada ya kuidhinishwa.',
    french: 'Commentaire soumis ! Il apparaîtra après approbation.'
  },
  'blog.commentError': {
    somali: 'Khalad ayaa dhacay marka la gelinayo faallada. Fadlan ku celi.',
    arabic: 'حدث خطأ أثناء إرسال التعليق. يرجى المحاولة مرة أخرى.',
    spanish: 'Ocurrió un error al enviar el comentario. Por favor, inténtalo de nuevo.',
    swahili: 'Hitilafu imetokea wakati wa kutuma maoni. Tafadhali jaribu tena.',
    french: 'Une erreur est survenue lors de l\'envoi du commentaire. Veuillez réessayer.'
  },
  'blog.articleNotFound': {
    somali: 'Maqalka lama helin',
    arabic: 'المقال غير موجود',
    spanish: 'Artículo no encontrado',
    swahili: 'Makala haipatikani',
    french: 'Article non trouvé'
  },
  'blog.articleNotFoundMessage': {
    somali: 'Maqalka aad raadisay ma jiro ama waa laga saaray.',
    arabic: 'المقال الذي تبحث عنه غير موجود أو تمت إزالته.',
    spanish: 'El artículo que buscas no existe o ha sido eliminado.',
    swahili: 'Makala unayotafuta haipo au imeondolewa.',
    french: 'L\'article que vous recherchez n\'existe pas ou a été supprimé.'
  },
  'blog.articleLoadError': {
    somali: 'Waxaanu khalad u dhacay marka la raray maqalka.',
    arabic: 'واجهنا خطأ أثناء تحميل المقال.',
    spanish: 'Encontramos un error al cargar el artículo.',
    swahili: 'Tulikutana na hitilafu wakati wa kupakia makala.',
    french: 'Nous avons rencontré une erreur lors du chargement de l\'article.'
  },
  'blog.goBack': {
    somali: 'Ku noqo',
    arabic: 'عد للخلف',
    spanish: 'Regresar',
    swahili: 'Rudi Nyuma',
    french: 'Retour'
  },
  'blog.viewAllArticles': {
    somali: 'Eeg Dhammaan Maqalada',
    arabic: 'عرض جميع المقالات',
    spanish: 'Ver Todos los Artículos',
    swahili: 'Tazama Makala Zote',
    french: 'Voir tous les articles'
  },
  'blog.backToArticles': {
    somali: 'Ku noqo Maqalada',
    arabic: 'العودة إلى المقالات',
    spanish: 'Volver a los Artículos',
    swahili: 'Rudi kwa Makala',
    french: 'Retour aux articles'
  },
  'blog.publishedOn': {
    somali: 'La daabacay',
    arabic: 'نُشر في',
    spanish: 'Publicado el',
    swahili: 'Iliyochapishwa tarehe',
    french: 'Publié le'
  },
  'blog.byAuthor': {
    somali: 'By Cabdalla Xuseen Cali',
    arabic: 'بقلم كابدالا حسين كالى',
    spanish: 'Por Cabdalla Xuseen Cali',
    swahili: 'Na Cabdalla Xuseen Cali',
    french: 'Par Cabdalla Xuseen Cali'
  },
  'blog.share': {
    somali: 'La wadaag',
    arabic: 'مشاركة',
    spanish: 'Compartir',
    swahili: 'Shiriki',
    french: 'Partager'
  },
  'blog.moreArticles': {
    somali: 'Maqaladoodan',
    arabic: 'مقالات أكثر',
    spanish: 'Más Artículos',
    swahili: 'Makala Zaidi',
    french: 'Plus d\'articles'
  },
  
  // Contact
  'contact.title': {
    somali: 'La xiriir',
    arabic: 'اتصل بنا',
    spanish: 'Contacto',
    swahili: 'Mawasiliano',
    french: 'Contact'
  },
  'contact.name': {
    somali: 'Magac',
    arabic: 'الاسم',
    spanish: 'Nombre',
    swahili: 'Jina',
    french: 'Nom'
  },
  'contact.email': {
    somali: 'Email',
    arabic: 'البريد الإلكتروني',
    spanish: 'Correo Electrónico',
    swahili: 'Barua Pepe',
    french: 'Email'
  },
  'contact.message': {
    somali: 'Fariin',
    arabic: 'رسالة',
    spanish: 'Mensaje',
    swahili: 'Ujumbe',
    french: 'Message'
  },
  'contact.send': {
    somali: 'Dir fariinta',
    arabic: 'إرسال الرسالة',
    spanish: 'Enviar Mensaje',
    swahili: 'Tuma Ujumbe',
    french: 'Envoyer le message'
  },
  
  // Footer
  'footer.description': {
    somali: 'Xubnaha Baarlamaanka, ku dede jiray in ay u adeegtaan Soomaaliya iyo dadkiisa iyadoo lagu dabaali doono doorasho demokraadiga, habaynta amniga, iyo horumarinta bulshada.',
    arabic: 'عضو في البرلمان، مكرّس لخدمة الصومال وشعبه من خلال الحكم الديمقراطي وإصلاح الأمن وتطوير المجتمع.',
    spanish: 'Miembro del Parlamento, dedicado a servir a Somalia y su pueblo a través de la gobernanza democrática, la reforma de seguridad y el desarrollo comunitario.',
    swahili: 'Mwanachama wa Bunge, mjitolea kwa kuhudumia Somalia na watu wake kupitia utawala wa kidemokrasia, uharibifu wa usalama, na maendeleo ya jamii.',
    french: 'Membre du Parlement, dédié à servir la Somalie et son peuple à travers la gouvernance démocratique, la réforme de la sécurité et le développement communautaire.'
  },
  'footer.quickLinks': {
    somali: 'Xidhiidho degdeg ah',
    arabic: 'روابط سريعة',
    spanish: 'Enlaces Rápidos',
    swahili: 'Viungo vya Haraka',
    french: 'Liens Rapides'
  },
  'footer.legal': {
    somali: 'Sharciga',
    arabic: 'قانوني',
    spanish: 'Legal',
    swahili: 'Kisheria',
    french: 'Légal'
  },
  'footer.rights': {
    somali: 'Dhammaan xuquuqda waa meel la kaydiyay',
    arabic: 'جميع الحقوق محفوظة',
    spanish: 'Todos los derechos reservados',
    swahili: 'Haki zote zimehifadhiwa',
    french: 'Tous droits réservés'
  },
  'footer.designed': {
    somali: 'La naqshay iyo la sameeyay',
    arabic: 'تم التصميم والتطوير بواسطة',
    spanish: 'Diseñado y desarrollado por',
    swahili: 'Imebuniwa na kuundwa na',
    french: 'Conçu et développé par'
  },
  'footer.forSomalia': {
    somali: 'mustaqbalka Soomaaliya',
    arabic: 'لمستقبل الصومال',
    spanish: 'para el futuro de Somalia',
    swahili: 'kwa ajili ya mustakabali wa Somalia',
    french: 'pour l\'avenir de la Somalie'
  },
  'footer.additionalInfo': {
    somali: 'Websitekan wuxuu u adeegaa sida portfolio dijital ah oo lagu muujinayo shaqada sharciga iyo guulaha adeegga dadweynaha. Waajibka rasmiyada baarlamaanka, fadlan la xiriir Baarlamaanka Federaalka ee Soomaaliya si toos ah.',
    arabic: 'هذا الموقع يخدم كمعرض رقمي يعرض أعمال التشريع والإنجازات في الخدمة العامة. للتعامل الرسمي مع البرلمان، يرجى الاتصال ببرلمان الصومال الفيدرالي مباشرة.',
    spanish: 'Este sitio web sirve como un portafolio digital que muestra el trabajo legislativo y los logros en el servicio público. Para asuntos parlamentarios oficiales, por favor contacte al Parlamento Federal de Somalia directamente.',
    swahili: 'Tovuti hii hutumika kama portfolio ya dijitali inayoonyesha kazi za kisheria na mafanikio ya huduma ya umma. Kwa shughuli rasmi za bunge, tafadhali wasiliana na Bunge la Shirikisho la Somalia moja kwa moja.',
    french: 'Ce site Web sert de portfolio numérique présentant le travail législatif et les réalisations en matière de service public. Pour les affaires parlementaires officielles, veuillez contacter directement le Parlement fédéral de Somalie.'
  },

  // Admin Panel
  'admin.dashboard': {
    somali: 'Dashboard',
    arabic: 'لوحة التحكم',
    spanish: 'Panel de Control',
    swahili: 'Dashibodi',
    french: 'Tableau de bord'
  },
  'admin.articles': {
    somali: 'Maqalada',
    arabic: 'المقالات',
    spanish: 'Artículos',
    swahili: 'Makala',
    french: 'Articles'
  },
  'admin.comments': {
    somali: 'Faallooyin',
    arabic: 'تعليقات',
    spanish: 'Comentarios',
    swahili: 'Maoni',
    french: 'Commentaires'
  },
  'admin.media': {
    somali: 'Mida',
    arabic: 'الوسائط',
    spanish: 'Medios',
    swahili: 'Midia',
    french: 'Médias'
  },
  'admin.settings': {
    somali: 'Dejinta',
    arabic: 'الإعدادات',
    spanish: 'Configuración',
    swahili: 'Mipangilio',
    french: 'Paramètres'
  },
  'admin.logout': {
    somali: 'Ka bax',
    arabic: 'تسجيل الخروج',
    spanish: 'Cerrar Sesión',
    swahili: 'Toka',
    french: 'Déconnexion'
  },
  'admin.createArticle': {
    somali: 'Abuur Maqal',
    arabic: 'إنشاء مقال',
    spanish: 'Crear Artículo',
    swahili: 'Tengeneza Makala',
    french: 'Créer un article'
  },
  'admin.editArticle': {
    somali: 'Tafatir Maqal',
    arabic: 'تعديل المقال',
    spanish: 'Editar Artículo',
    swahili: 'Hariri Makala',
    french: 'Modifier l\'article'
  },
  'admin.title': {
    somali: 'Ciwaan',
    arabic: 'العنوان',
    spanish: 'Título',
    swahili: 'Kichwa',
    french: 'Titre'
  },
  'admin.slug': {
    somali: 'Slug',
    arabic: 'الرابط المختصر',
    spanish: 'Slug',
    swahili: 'Kiungo',
    french: 'Slug'
  },
  'admin.excerpt': {
    somali: 'Jumlad',
    arabic: 'مقدمة',
    spanish: 'Extracto',
    swahili: 'Muhtasari',
    french: 'Extrait'
  },
  'admin.content': {
    somali: 'Nuxurka',
    arabic: 'المحتوى',
    spanish: 'Contenido',
    swahili: 'Yaliyomo',
    french: 'Contenu'
  },
  'admin.featuredImage': {
    somali: 'Sawirka Ugu Horreeya',
    arabic: 'الصورة المميزة',
    spanish: 'Imagen Destacada',
    swahili: 'Picha Iliyoangaziwa',
    french: 'Image à la une'
  },
  'admin.status': {
    somali: 'Xaaladda',
    arabic: 'الحالة',
    spanish: 'Estado',
    swahili: 'Hali',
    french: 'Statut'
  },
  'admin.draft': {
    somali: 'Qabyo',
    arabic: 'مسودة',
    spanish: 'Borrador',
    swahili: 'Rasimu',
    french: 'Brouillon'
  },
  'admin.published': {
    somali: 'La Daabacay',
    arabic: 'منشور',
    spanish: 'Publicado',
    swahili: 'Iliyochapishwa',
    french: 'Publié'
  },
  'admin.saveDraft': {
    somali: 'Kaydi Qabyada',
    arabic: 'حفظ المسودة',
    spanish: 'Guardar Borrador',
    swahili: 'Hifadhi Rasimu',
    french: 'Enregistrer le brouillon'
  },
  'admin.publish': {
    somali: 'Daabac',
    arabic: 'نشر',
    spanish: 'Publicar',
    swahili: 'Chapisha',
    french: 'Publier'
  },
  'admin.update': {
    somali: 'Cusboonaysii',
    arabic: 'تحديث',
    spanish: 'Actualizar',
    swahili: 'Sasisha',
    french: 'Mettre à jour'
  },
  'admin.cancel': {
    somali: 'Jooji',
    arabic: 'إلغاء',
    spanish: 'Cancelar',
    swahili: 'Ghairi',
    french: 'Annuler'
  },
  'admin.delete': {
    somali: 'Tirtir',
    arabic: 'حذف',
    spanish: 'Eliminar',
    swahili: 'Futa',
    french: 'Supprimer'
  },
  'admin.confirmDelete': {
    somali: 'Ma hubtaa inaad rabto inaad tirtirto maqalkaan?',
    arabic: 'هل أنت متأكد أنك تريد حذف هذا المقال؟',
    spanish: '¿Estás seguro de que quieres eliminar este artículo?',
    swahili: 'Je, una uhakika unataka kufuta makala hii?',
    french: 'Êtes-vous sûr de vouloir supprimer cet article ?'
  },
  'admin.uploadImage': {
    somali: 'Soo rar sawirka',
    arabic: 'تحميل الصورة',
    spanish: 'Subir Imagen',
    swahili: 'Pakia Picha',
    french: 'Télécharger une image'
  },
  'admin.insertImage': {
    somali: 'Geli Sawirka',
    arabic: 'إدراج الصورة',
    spanish: 'Insertar Imagen',
    swahili: 'Weka Picha',
    french: 'Insérer une image'
  },
  'admin.manageContent': {
    somali: 'Maamul nuxurka boggaaga iyo midaha',
    arabic: 'إدارة محتوى وميديا موقعك',
    spanish: 'Gestiona el contenido y los medios de tu sitio web',
    swahili: 'Dhibiti yaliyomo na midia ya tovuti yako',
    french: 'Gérez le contenu et les médias de votre site Web'
  },
  'admin.articleDetails': {
    somali: 'Faahfaahinta Maqalka',
    arabic: 'تفاصيل المقال',
    spanish: 'Detalles del Artículo',
    swahili: 'Maelezo ya Makala',
    french: 'Détails de l\'article'
  },
  'admin.enterTitle': {
    somali: 'Geli ciwaanka maqalka',
    arabic: 'أدخل عنوان المقال',
    spanish: 'Ingresa el título del artículo',
    swahili: 'Ingiza kichwa cha makala',
    french: 'Entrez le titre de l\'article'
  },
  'admin.enterSlug': {
    somali: 'Geli slug-ka maqalka',
    arabic: 'أدخل الرابط المختصر للمقال',
    spanish: 'Ingresa el slug del artículo',
    swahili: 'Ingiza kiungo cha makala',
    french: 'Entrez le slug de l\'article'
  },
  'admin.enterExcerpt': {
    somali: 'Geli jumlad maqalka',
    arabic: 'أدخل مقدمة المقال',
    spanish: 'Ingresa el extracto del artículo',
    swahili: 'Ingiza muhtasari wa makala',
    french: 'Entrez l\'extrait de l\'article'
  },
  'admin.enterImageUrl': {
    somali: 'Geli URL sawirka',
    arabic: 'أدخل رابط الصورة',
    spanish: 'Ingresa la URL de la imagen',
    swahili: 'Ingiza URL ya picha',
    french: 'Entrez l\'URL de l\'image'
  },
  'admin.selectStatus': {
    somali: 'Dooro xaaladda',
    arabic: 'اختر الحالة',
    spanish: 'Selecciona el estado',
    swahili: 'Chagua hali',
    french: 'Sélectionnez le statut'
  },
  'admin.writeContent': {
    somali: 'Qor nuxurka maqalka halkan...',
    arabic: 'اكتب محتوى المقال هنا...',
    spanish: 'Escribe el contenido del artículo aquí...',
    swahili: 'Andika yaliyomo ya makala hapa...',
    french: 'Écrivez le contenu de l\'article ici...'
  },
  'admin.preview': {
    somali: 'Horudhac',
    arabic: 'معاينة',
    spanish: 'Vista Previa',
    swahili: 'Hakiki',
    french: 'Aperçu'
  },
};

// Language provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('somali');

  // Load language preference from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && ['somali', 'arabic', 'spanish', 'swahili', 'french'].includes(savedLanguage)) {
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