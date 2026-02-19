import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Zap, 
  Compass, 
  Layers, 
  Activity, 
  Shield, 
  Instagram, 
  MessageCircle,
  ArrowUpRight,
  Globe,
  Terminal,
  Hexagon,
  Languages,
  Car,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Percent
} from 'lucide-react';
import { cars, translations } from './data';

const TechBadge = ({ children, variant = 'gold' }) => {
  const isGold = variant === 'gold';
  return (
    <div className={`flex items-center gap-2 ${isGold ? 'bg-brand-gold/10 border-brand-gold/20' : 'bg-brand-gold/10 border-brand-gold/20'} border px-3 py-1 rounded-full w-fit`}>
      <div className={`w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse`} />
      <span className={`text-[10px] font-tech font-bold uppercase tracking-widest text-brand-gold`}>{children}</span>
    </div>
  );
};

const CarCard = ({ car, lang, t, onShowDetails, whatsappDigits }) => {
  const colors = (car.colors && car.colors.length ? car.colors : ['#ffffff', '#000000', '#737373']).slice(0, 3);
  const [activeColor, setActiveColor] = useState(colors[0]);
  const images = (car.gallery && car.gallery.length ? car.gallery : [car.image]).slice(0, colors.length);

  const getImageForColor = () => {
    const index = colors.indexOf(activeColor);
    const safeIndex = index === -1 ? 0 : index;
    return images[safeIndex] || images[0];
  };

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      <div className="relative bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:border-brand-gold/30">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img 
            src={getImageForColor()} 
            alt={car.model} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          <div className="absolute top-4 left-4">
            <TechBadge variant="gold">{car.brand}</TechBadge>
          </div>
          <div className="absolute bottom-4 left-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tracking-tight group-hover:text-brand-gold transition-colors">
                {car.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
              </span>
              <span className="text-xl font-bold text-brand-gold"> ₸</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6 space-y-4">
            <h3 className="text-xl font-tech font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">{car.model}</h3>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-3">
                {[
                  { label: '2024', icon: <Layers size={12} /> },
                  { label: car.engine[lang].split(' ')[0], icon: <Cpu size={12} /> },
                  { label: 'NEW', icon: <Activity size={12} /> }
                ].map((tag, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-white/40 font-tech uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                    <span className="text-brand-gold/60">{tag.icon}</span>
                    {tag.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-brand-gold/15 border border-brand-gold/40">
              <span className="text-[8px] font-tech font-bold uppercase tracking-widest text-brand-gold">
                {lang === 'kz' ? 'Түстер' : 'Цвета'}
              </span>
              <div className="flex items-center gap-1.5">
                {colors.map((color, idx) => {
                  const isActive = color === activeColor;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveColor(color);
                      }}
                      className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${isActive ? 'border-brand-gold scale-110' : 'border-white/40 opacity-80 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => onShowDetails(car)}
              className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-tech font-bold text-[10px] uppercase tracking-[0.2em] text-white hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all duration-500"
            >
              {t.car.more}
            </button>
            <a 
              href={`https://wa.me/${whatsappDigits}?text=Здравствуйте! Меня интересует ${car.model}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#25D366] text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all duration-500 shadow-lg"
            >
              <MessageCircle size={24} fill="currentColor" />
            </a>
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

const CarModal = ({ car, lang, t, onClose, whatsappDigits }) => {
  const [activeImg, setActiveImg] = useState(0);
  const colors = (car.colors && car.colors.length ? car.colors : ['#ffffff', '#000000', '#737373']).slice(0, 3);

  const formatFinanceValue = (value) => {
    if (!value) return "";
    if (lang === "kz") {
      return value.replace(/^От/i, "Бастап");
    }
    return value;
  };

  return (
    <Motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <Motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-6xl bg-brand-dark border border-brand-gold/20 rounded-3xl md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[95vh] md:max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-8 h-8 md:w-10 md:h-10 bg-black/50 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-brand-gold hover:text-black transition-all"
        >
          <X size={16} md:size={20} />
        </button>

        {/* Gallery Section */}
        <div className="h-[300px] sm:h-[400px] lg:h-auto lg:w-2/3 relative bg-black flex flex-col">
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <Motion.img 
                key={activeImg}
                src={car.gallery[activeImg]} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {car.gallery.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImg((prev) => (prev === 0 ? car.gallery.length - 1 : prev - 1))}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-black/50 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-brand-gold hover:text-black transition-all"
                >
                  <ChevronLeft size={18} md:size={24} />
                </button>
                <button 
                  onClick={() => setActiveImg((prev) => (prev === car.gallery.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-black/50 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-brand-gold hover:text-black transition-all"
                >
                  <ChevronRight size={18} md:size={24} />
                </button>
              </>
            )}
          </div>
          
          <div className="p-2 md:p-4 flex gap-2 overflow-x-auto bg-brand-dark/50 border-t border-white/5">
            {car.gallery.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImg(idx)}
                className={`relative w-16 md:w-20 aspect-video rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${idx === activeImg ? 'border-brand-gold' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="lg:w-1/3 p-6 md:p-8 lg:p-12 overflow-y-auto">
          <TechBadge variant="gold">{car.brand}</TechBadge>
          <h2 className="text-2xl md:text-4xl font-tech font-bold text-white mt-4 md:mt-6 mb-6 md:mb-8">{car.model}</h2>
          
          <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
            <div className="flex justify-between items-center py-3 md:py-4 border-b border-white/5">
              <span className="text-[8px] md:text-[10px] font-tech text-gray-500 uppercase tracking-widest">{t.car.engine}</span>
              <span className="text-xs md:text-sm text-white font-tech">{car.engine[lang]}</span>
            </div>
            <div className="flex justify-between items-center py-3 md:py-4 border-b border-white/5">
              <span className="text-[8px] md:text-[10px] font-tech text-gray-500 uppercase tracking-widest">{t.car.drive}</span>
              <span className="text-xs md:text-sm text-white font-tech">{car.transmission[lang]}</span>
            </div>
            <div className="flex justify-between items-center py-3 md:py-4 border-b border-white/5">
              <span className="text-[8px] md:text-[10px] font-tech text-gray-500 uppercase tracking-widest">{t.car.dim}</span>
              <span className="text-xs md:text-sm text-white font-tech">{car.dimensions}</span>
            </div>
            <div className="flex justify-between items-center py-3 md:py-4 border-b border-white/5">
              <span className="text-[8px] md:text-[10px] font-tech text-gray-500 uppercase tracking-widest">{t.car.security}</span>
              <span className="text-xs md:text-sm text-white font-tech">{car.clearance[lang]}</span>
            </div>
          </div>

          <div className="bg-brand-gold/5 border border-brand-gold/10 p-4 md:p-6 rounded-2xl mb-4 md:mb-6">
            <p className="text-xs md:text-sm text-gray-300 leading-relaxed italic">{car.options[lang]}</p>
          </div>

          {colors.length > 0 && (
            <div className="mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-brand-gold/15 border border-brand-gold/40">
                <span className="text-[8px] md:text-[10px] font-tech font-bold uppercase tracking-widest text-brand-gold">
                  {lang === 'kz' ? 'Түстер' : 'Цвета'}
                </span>
                <div className="flex items-center gap-1.5">
                  {colors.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImg(idx)}
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border transition-all duration-300 ${
                        idx === activeImg ? 'border-brand-gold scale-110' : 'border-white/40 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Finance Section */}
          <div className="mb-8 md:mb-12 space-y-4 md:space-y-6">
            {car.finance?.installment && (
              <div>
                <h4 className="text-[8px] md:text-[10px] font-tech text-brand-gold uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-brand-gold/20"></div>
                  {t.car.finance.installment.title}
                  <div className="h-[1px] flex-1 bg-brand-gold/20"></div>
                </h4>
                <div className="bg-white/5 border border-brand-gold/20 p-3 md:p-4 rounded-2xl flex items-center justify-center">
                  <span className="text-xs md:text-sm font-tech font-bold text-white">
                    {formatFinanceValue(car.finance.installment)}
                  </span>
                </div>
              </div>
            )}

            {car.finance?.credit && (
              <div>
                <h4 className="text-[8px] md:text-[10px] font-tech text-white/40 uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                  {t.car.finance.credit.title}
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                </h4>
                <div className="bg-white/5 border border-white/15 p-3 md:p-4 rounded-2xl flex items-center justify-center">
                  <span className="text-xs md:text-sm font-tech font-bold text-white">
                    {formatFinanceValue(car.finance.credit)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[12px] md:text-[14px] text-brand-gold font-tech uppercase mb-2 tracking-widest font-bold">{t.car.value}</p>
              <p className="text-2xl md:text-3xl font-tech font-bold text-white">
                {car.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} 
                <span className="text-[10px] md:text-xs text-brand-gold opacity-50 uppercase tracking-widest ml-2">{t.car.million}</span>
              </p>
            </div>
          </div>

          <a 
            href={`https://wa.me/${whatsappDigits}?text=Здравствуйте! Меня интересует ${car.model}`}
            target="_blank"
            className="flex items-center justify-center gap-4 bg-[#D4B982] text-[#000000] w-full py-5 md:py-6 font-tech font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-white transition-all rounded-full shadow-[0_0_30px_rgba(212,185,130,0.3)] mb-4 lg:mb-0"
          >
            {t.footer.cta_wa} <Zap size={14} md:size={16} fill="black" />
          </a>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

function App() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'kz');
  const [selectedCar, setSelectedCar] = useState(null);
  const [inventory] = useState(cars);
  const [logo] = useState(localStorage.getItem('logo') || '/logo.jpg');
  const [whatsappNumber] = useState(localStorage.getItem('whatsappNumber') || '+7 776 556 5757');
  const rawWhatsappDigits = whatsappNumber.replace(/\D/g, '').replace(/^8/, '7');
  const whatsappDigits = rawWhatsappDigits || '77765565757';
  const t = translations[lang];

  const toggleLang = () => {
    const newLang = lang === 'kz' ? 'ru' : 'kz';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-gold selection:text-black relative">
      {/* Глобальный фон с сеткой и свечением */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 tech-grid opacity-20" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-gold/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-gold/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <AnimatePresence>
        {selectedCar && (
          <CarModal 
            car={selectedCar} 
            lang={lang} 
            t={t} 
            whatsappDigits={whatsappDigits}
            onClose={() => setSelectedCar(null)} 
          />
        )}
      </AnimatePresence>
      <header className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center glass rounded-full px-4 md:px-8 py-3 md:py-4 border border-brand-gold/10">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-black flex items-center justify-center rounded-full border border-brand-gold/30 shadow-[0_0_15px_rgba(197,160,89,0.2)] overflow-hidden">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Car size={16} className="text-brand-gold" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm md:text-xl font-tech font-bold tracking-tighter text-white leading-tight">BBR<span className="text-brand-gold">.RULIT</span></span>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-10">
            {[
              { id: 'catalog', label: t.nav.catalog },
              { id: 'advantages', label: t.nav.intelligence },
              { id: 'location', label: t.nav.network }
            ].map((item) => (
              <a 
                key={item.id} 
                href={`#${item.id}`} 
                className="text-[10px] font-tech uppercase font-bold tracking-[0.3em] px-4 py-2 rounded-full hover:bg-brand-gold/10 hover:text-brand-gold transition-all duration-300 opacity-80 hover:opacity-100"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 glass px-4 py-2 rounded-full border-brand-gold/40 hover:border-brand-gold transition-all group shadow-lg"
            >
              <Languages size={14} className="text-brand-gold group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-[10px] font-tech font-bold uppercase tracking-widest text-white">{lang === 'kz' ? 'RU' : 'KZ'}</span>
            </button>
            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />
            <div className="flex gap-2">
              <a href="https://instagram.com/bbr_rulit" target="_blank" className="p-2 glass rounded-full text-white hover:text-brand-gold transition-colors border-white/20 hover:border-brand-gold/50 shadow-lg">
                <Instagram size={18} />
              </a>
              <a href={`https://wa.me/${whatsappDigits}`} target="_blank" className="p-2 bg-[#D4B982] text-[#000000] rounded-full hover:bg-white transition-colors shadow-[0_0_15px_rgba(212,185,130,0.3)]">
                <MessageCircle size={18} fill="black" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Фоновое изображение Changan */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1621243804936-775306a8f2e3?auto=format&fit=crop&q=80&w=2000" 
            alt="Changan Background" 
            className="w-full h-full object-cover opacity-40 grayscale-[0.5]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-brand-dark" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-transparent to-brand-dark opacity-60" />
        </div>

        

        <div className="scanline" />
        
        {/* Анимированные свечения */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-brand-gold/10 rounded-full blur-[100px] md:blur-[150px] animate-pulse" />
        </div>
        
        <div className="relative z-10 w-full px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-tech font-bold tracking-tight mb-6">
              {t.hero.heading}
            </h1>
            <p className="text-white/70 font-tech text-sm md:text-base mb-10">
              {t.hero.features}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#catalog" 
                className="flex items-center gap-3 bg-[#D4B982] text-black px-8 py-4 rounded-full font-tech font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_25px_rgba(212,185,130,0.3)]"
              >
                {t.hero.cta} <ArrowUpRight size={16} />
              </a>
              <a 
                href={`https://wa.me/${whatsappDigits}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 glass px-8 py-4 rounded-full border border-white/10 font-tech font-bold text-[10px] md:text-xs uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-all"
              >
                {t.footer.cta_wa}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Бегущая строка */}
      <div className="py-10 bg-brand-gold/[0.02] border-y border-brand-gold/10 overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-marquee py-4 md:py-8">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="flex items-center gap-12 md:gap-24 mx-6 md:mx-12">
              <span className="text-4xl md:text-7xl font-tech font-black text-white/5 tracking-tighter hover:text-brand-gold/20 transition-colors cursor-default">CHANGAN</span>
              <span className="text-4xl md:text-7xl font-tech font-black text-white/5 tracking-tighter hover:text-brand-gold/20 transition-colors cursor-default">BYD</span>
            </div>
          ))}
        </div>
      </div>



      <section id="catalog" className="py-20 md:py-40 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 md:mb-24 gap-8">
          <div className="relative text-center md:text-left">
            <div className="hidden md:block absolute -left-8 top-0 bottom-0 w-[2px] bg-brand-gold" />
            <h2 className="text-3xl md:text-5xl font-tech font-bold tracking-tight mb-4">{t.catalog.title} <span className="text-brand-gold italic">{t.catalog.subtitle}</span></h2>
            <p className="text-gray-500 text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-bold">{t.catalog.protocol}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {inventory.map(car => (
            <CarCard 
              key={car.id} 
              car={car} 
              lang={lang} 
              t={t} 
              onShowDetails={setSelectedCar} 
              whatsappDigits={whatsappDigits}
            />
          ))}
        </div>
      </section>

      {/* Наши преимущества */}
      <section id="advantages" className="py-20 md:py-32 bg-black/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-tech font-bold text-center">
              {t.advantages.title} <br />
              <span className="text-brand-gold">{t.advantages.subtitle}</span>
            </h2>
            <div className="w-24 h-[1px] bg-brand-gold mt-6 opacity-50" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.advantages.items.map((item, idx) => (
              <Motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="glass p-8 md:p-12 rounded-[2rem] border-brand-gold/10 hover:border-brand-gold/30 transition-all group"
              >
                <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-gold/20 transition-colors">
                  {idx === 0 && <MapPin className="text-brand-gold" size={32} />}
                  {idx === 1 && <Percent className="text-brand-gold" size={32} />}
                  {idx === 2 && <Shield className="text-brand-gold" size={32} />}
                </div>
                <h3 className="text-xl md:text-2xl font-tech font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400 font-tech text-sm leading-relaxed">
                  {item.desc}
                </p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer id="location" className="relative bg-brand-dark border-t border-brand-gold/10 pt-20 md:pt-40 pb-12 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-[300px] md:h-[500px] bg-brand-gold/5 blur-[80px] md:blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 mb-20 md:mb-40">
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <TechBadge variant="gold">{t.footer.handshake}</TechBadge>
              </div>
              <h3 className="text-4xl md:text-6xl font-tech font-bold mt-8 mb-8 md:mb-10 leading-[1.1] md:leading-none tracking-tighter">
                {t.footer.title_1} <br /><span className="text-brand-gold">{t.footer.title_2}</span>
              </h3>
              <p className="text-gray-400 font-tech text-xs md:text-sm leading-relaxed mb-10 md:mb-12 max-w-md mx-auto lg:mx-0">
                {t.footer.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
                <a 
                  href={`https://wa.me/${whatsappDigits}`} 
                  className="w-full sm:w-auto flex items-center justify-center gap-4 bg-[#D4B982] text-[#000000] px-12 py-5 md:py-6 font-tech font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-white transition-all rounded-full shadow-[0_0_30px_rgba(212,185,130,0.3)]"
                >
                  {t.footer.cta_wa} <Zap size={14} md:size={16} fill="black" />
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-12 lg:border-l border-brand-gold/10 lg:pl-12 pt-12 lg:pt-0 border-t lg:border-t-0 border-brand-gold/10">
              <div className="w-full">
                  <p className="text-[8px] md:text-[10px] font-tech font-bold text-brand-gold tracking-[0.4em] mb-6 md:mb-8 uppercase text-center sm:text-left">{t.footer.coords}</p>
                  <div className="w-full h-[350px] md:h-[450px] rounded-3xl overflow-hidden glass border border-brand-gold/20 transition-all duration-700 group relative">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2948.342123456789!2d69.587668!3d42.357086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDIxJzI1LjUiTiA2OcKwMzUnMTUuNiJF!5e0!3m2!1sru!2skz!4v1707830000000!5m2!1sru!2skz" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen="" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      className="opacity-100 transition-opacity duration-700"
                    ></iframe>
                    <a 
                      href="https://2gis.kz/shymkent/firm/70000001111066312?m=69.587668%2C42.357086%2F16"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-6 right-6 bg-brand-gold text-black px-6 py-3 rounded-full font-tech font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-white transition-all transform hover:scale-105"
                    >
                      2GIS-ТЕ АШУ
                    </a>
                  </div>
                </div>
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8">
                <div>
                  <p className="text-[8px] md:text-[10px] font-tech font-bold text-brand-gold tracking-[0.4em] mb-6 md:mb-8 uppercase text-center sm:text-left">{t.footer.links}</p>
                  <ul className="space-y-4 md:space-y-6 text-[8px] md:text-[10px] font-tech text-gray-400 tracking-widest uppercase flex flex-col items-center sm:items-start">
                    <li className="flex items-center gap-3 hover:text-brand-gold transition-colors cursor-pointer"><Terminal size={12} /> +7 776 556 5757</li>
                    <li className="flex items-center gap-3 hover:text-brand-gold transition-colors cursor-pointer"><Hexagon size={12} /> info@bbr.tech</li>
                    <li className="flex items-center gap-3 hover:text-brand-gold transition-colors cursor-pointer"><Instagram size={12} /> @bbr_rulit</li>
                  </ul>
                </div>
                <div className="flex flex-col items-center sm:items-end">
                  <p className="text-[8px] md:text-[10px] font-tech font-bold text-brand-gold tracking-[0.4em] mb-6 md:mb-8 uppercase text-center sm:text-right">{lang === 'kz' ? 'БІЗДІҢ МЕКЕН-ЖАЙ' : 'НАШ АДРЕС'}</p>
                  <ul className="space-y-4 md:space-y-6 text-[8px] md:text-[10px] font-tech text-gray-400 tracking-widest uppercase flex flex-col items-center sm:items-end text-center sm:text-right">
                    <li className="flex items-center gap-3"><Globe size={12} className="text-brand-gold" /> {lang === 'kz' ? 'Шымкент, Малкаров көшесі, 99' : 'Шымкент, ул. Малкарова, 99'}</li>
                    <li className="flex items-center gap-3"><Activity size={12} className="text-brand-gold" /> {lang === 'kz' ? 'Жеткізу желісі' : 'Сеть доставки'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-brand-gold/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 pb-8 md:pb-0">
            <p className="text-[9px] font-tech uppercase tracking-[0.3em] text-gray-600 font-bold">
              {t.footer.status} © 2026 BBR.TECH FUTURE MOBILITY
            </p>
            <div className="flex items-center gap-8">
              <div className="flex gap-10 text-[9px] font-tech uppercase tracking-[0.3em] text-gray-600 font-bold">
                <span className="hover:text-brand-gold cursor-pointer transition-colors">Logistics_Core</span>
                <span className="hover:text-brand-gold cursor-pointer transition-colors">Import_API</span>
                <span className="hover:text-brand-gold cursor-pointer transition-colors">Support_Term</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
