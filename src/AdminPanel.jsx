import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { translations, cars as initialCars } from './data';
import {
  LayoutDashboard,
  Car,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  LogOut,
  Image as ImageIcon,
  DollarSign,
  ChevronRight,
  Upload,
  Clock,
  Percent,
  Languages
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('cars');
  const [cars, setCars] = useState(() => {
    const saved = localStorage.getItem('cars');
    return saved ? JSON.parse(saved) : initialCars;
  });
  const [editingCar, setEditingCar] = useState(null);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'kz');
  const [settingsLogo, setSettingsLogo] = useState(localStorage.getItem('logo') || null);
  const [colorVariants, setColorVariants] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState(localStorage.getItem('whatsappNumber') || '+7 707 123 45 67');
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  
  const t = translations[lang];
  const isEdit = !!editingCar;
  const saveCars = (list) => {
    setCars(list);
    localStorage.setItem('cars', JSON.stringify(list));
  };

  const toggleLang = () => {
    const newLang = lang === 'kz' ? 'ru' : 'kz';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const { register, handleSubmit, reset } = useForm();

  const syncCar = async (method, id, body) => {
    try {
      const url = id ? `${API_URL}/api/cars/${id}` : `${API_URL}/api/cars`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        return null;
      }
      if (res.status === 204) {
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  };

  const syncSettings = async (payload) => {
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/cars`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCars(data);
          localStorage.setItem('cars', JSON.stringify(data));
        }
      })
      .catch(() => {
      });

    fetch(`${API_URL}/api/settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || typeof data !== 'object') return;
        if (Object.prototype.hasOwnProperty.call(data, 'logo')) {
          setSettingsLogo(data.logo);
          if (data.logo) {
            localStorage.setItem('logo', data.logo);
          }
        }
        if (Object.prototype.hasOwnProperty.call(data, 'whatsappNumber')) {
          setWhatsappNumber(data.whatsappNumber);
          if (data.whatsappNumber) {
            localStorage.setItem('whatsappNumber', data.whatsappNumber);
          }
        }
      })
      .catch(() => {
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/';
  };

  const handleFiles = (files) => {
    const fileList = Array.from(files);
    fileList.forEach(file => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result;
          setPreviewImages(prev => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleLogoFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettingsLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = () => {
    if (settingsLogo) {
      localStorage.setItem('logo', settingsLogo);
    }
    localStorage.setItem('whatsappNumber', whatsappNumber);
    syncSettings({
      logo: settingsLogo,
      whatsappNumber,
    });
    alert(t.admin.save);
  };

  const addColorVariant = () => {
    setColorVariants((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        hex: '#ffffff',
        image: '',
      },
    ]);
  };

  const updateColorVariant = (id, field, value) => {
    setColorVariants((prev) =>
      prev.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    );
  };

  const removeColorVariant = (id) => {
    setColorVariants((prev) => prev.filter((variant) => variant.id !== id));
  };

  const handleColorImage = (id, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setColorVariants((prev) =>
          prev.map((variant) =>
            variant.id === id ? { ...variant, image: base64 } : variant
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const deleteCar = (id) => {
    if (window.confirm(t.admin.confirm_delete)) {
      saveCars(cars.filter(c => c.id !== id));
      syncCar('DELETE', id);
    }
  };

  const onSubmit = async (data) => {
    const financePayload = {
      installment: [
        { months: Number(data.inst_m1), price: Number(data.inst_p1) },
        { months: Number(data.inst_m2), price: Number(data.inst_p2) },
        { months: Number(data.inst_m3), price: Number(data.inst_p3) }
      ],
      credit: [
        { months: Number(data.cred_m1), price: Number(data.cred_p1) },
        { months: Number(data.cred_m2), price: Number(data.cred_p2) },
        { months: Number(data.cred_m3), price: Number(data.cred_p3) }
      ]
    };

    const baseUpdates = {
      price: Number(data.price),
      image: previewImages[0] || '',
      gallery: previewImages,
      finance: financePayload,
      colorVariants
    };

    const carData = isEdit ? baseUpdates : {
      ...data,
      ...baseUpdates
    };

    if (editingCar) {
      const updatedCar = { ...editingCar, ...carData };
      const payload = { ...updatedCar };
      delete payload.id;
      const serverCar = await syncCar('PUT', editingCar.id, payload);
      const finalCar = serverCar || updatedCar;
      saveCars(cars.map((c) => (c.id === editingCar.id ? finalCar : c)));
      setEditingCar(null);
    } else {
      const payload = { ...carData };
      const serverCar = await syncCar('POST', null, payload);
      const createdCar = serverCar || {
        ...carData,
        id: (cars.length ? Math.max(...cars.map((c) => c.id || 0)) : 0) + 1,
      };
      saveCars([createdCar, ...cars]);
      setIsAddingCar(false);
    }
    setPreviewImages([]);
    setColorVariants([]);
    reset();
  };

  const startEdit = (car) => {
    setEditingCar(car);
    setIsAddingCar(true);
    setPreviewImages(car.gallery || [car.image]);
    setColorVariants(car.colorVariants || []);
    
    // Reset form with car data
    reset({
      brand: car.brand,
      model: car.model,
      price: car.price,
      'engine.ru': car.engine?.ru,
      'engine.kz': car.engine?.kz,
      'transmission.ru': car.transmission?.ru,
      'transmission.kz': car.transmission?.kz,
      inst_m1: car.finance?.installment?.[0]?.months || 12,
      inst_p1: car.finance?.installment?.[0]?.price || car.price,
      inst_m2: car.finance?.installment?.[1]?.months || 18,
      inst_p2: car.finance?.installment?.[1]?.price || car.price,
      inst_m3: car.finance?.installment?.[2]?.months || 24,
      inst_p3: car.finance?.installment?.[2]?.price || car.price,
      cred_m1: car.finance?.credit?.[0]?.months || 36,
      cred_p1: car.finance?.credit?.[0]?.price || car.price,
      cred_m2: car.finance?.credit?.[1]?.months || 60,
      cred_p2: car.finance?.credit?.[1]?.price || car.price,
      cred_m3: car.finance?.credit?.[2]?.months || 84,
      cred_p3: car.finance?.credit?.[2]?.price || car.price,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-tech selection:bg-brand-gold selection:text-black">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-[#111] border-r border-white/5 flex flex-col z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center rotate-3">
              <LayoutDashboard className="text-black w-6 h-6 -rotate-3" />
            </div>
            <div>
              <h1 className="font-bold tracking-tighter text-xl">BBR<span className="text-brand-gold">.ADMIN</span></h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">{t.admin.title}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('cars')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'cars' ? 'bg-brand-gold text-black font-bold' : 'hover:bg-white/5 text-white/50'}`}
            >
              <Car size={20} />
              <span>{t.admin.fleet}</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'settings' ? 'bg-brand-gold text-black font-bold' : 'hover:bg-white/5 text-white/50'}`}
            >
              <Settings size={20} />
              <span>{t.admin.settings}</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-8">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all duration-300"
          >
            <LogOut size={20} />
            <span>{t.admin.logout}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {activeTab === 'cars' ? t.admin.fleet : t.admin.settings}
            </h2>
            <p className="text-sm text-white/40">BBR.RULIT {t.admin.title.toLowerCase()}</p>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:border-brand-gold transition-all group"
            >
              <Languages size={14} className="text-brand-gold group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-[10px] font-tech font-bold uppercase tracking-widest text-white">{lang === 'kz' ? 'RU' : 'KZ'}</span>
            </button>

            {activeTab === 'cars' && (
              <button 
                onClick={() => {
                  setIsAddingCar(true);
                  setEditingCar(null);
                  reset();
                }}
                className="flex items-center gap-2 bg-brand-gold text-black px-6 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Plus size={20} />
                {t.admin.add_car}
              </button>
            )}
          </div>
        </header>

        <main className="p-10">
          {activeTab === 'cars' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div key={car.id} className="group bg-[#111] rounded-2xl overflow-hidden border border-white/5 hover:border-brand-gold/30 transition-all duration-500">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={car.image} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => startEdit(car)}
                        className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-brand-gold hover:text-black transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteCar(car.id)}
                        className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{car.model}</h3>
                        <p className="text-brand-gold text-xs font-bold tracking-widest uppercase mt-1">{car.brand}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-brand-gold font-bold text-lg">
                          {car.price.toLocaleString()} <span className="text-[10px] opacity-50">₸</span>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs text-white/40 font-medium">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span>{t.car.engine.split('.')[0]}</span>
                        <span className="text-white/80">{car.engine[lang]}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span>{t.car.drive.split('.')[0]}</span>
                        <span className="text-white/80">{car.transmission[lang]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-[#111] rounded-3xl p-10 border border-white/5">
              <h3 className="text-xl font-bold mb-8">{t.admin.settings}</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-white/30 uppercase tracking-widest mb-3">{t.admin.salon_name}</label>
                  <input type="text" defaultValue="BBR.RULIT" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/30 uppercase tracking-widest mb-3">{t.admin.whatsapp_number}</label>
                  <input 
                    type="text" 
                    value={whatsappNumber} 
                    onChange={(e) => setWhatsappNumber(e.target.value)} 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold transition-all outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Логотип</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                      {settingsLogo ? (
                        <img src={settingsLogo} className="w-full h-full object-cover" alt="Logo Preview" />
                      ) : (
                        <ImageIcon className="text-white/20" size={32} />
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => logoInputRef.current.click()}
                      className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-gold hover:text-brand-gold transition-all"
                    >
                      <Upload size={18} />
                      Загрузить логотип
                    </button>
                    <input 
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLogoFile(e.target.files[0])}
                    />
                  </div>
                </div>
                <button onClick={saveSettings} className="bg-brand-gold text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-all">{t.admin.save}</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Car Modal */}
      {isAddingCar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#111] rounded-3xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-bold">{editingCar ? t.admin.edit_car : t.admin.add_car}</h3>
              <button onClick={() => setIsAddingCar(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{t.admin.brand}</label>
                      <input {...register('brand')} placeholder="BYD" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-all" required={!isEdit} disabled={isEdit} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{t.admin.model}</label>
                      <input {...register('model')} placeholder="Han EV" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-all" required={!isEdit} disabled={isEdit} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{t.admin.price} (₸)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
                      <input {...register('price')} type="number" className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-brand-gold outline-none transition-all font-bold text-brand-gold" required />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-6">
                    {/* Installment Rows */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Percent className="w-3 h-3" />
                        {t.car.finance.installment.title}
                      </label>
                      <div className="space-y-3">
                        {[1, 2, 3].map((num) => (
                          <div key={`inst-${num}`} className="grid grid-cols-2 gap-3">
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-3.5 h-3.5" />
                              <input {...register(`inst_m${num}`)} type="number" placeholder={t.admin.month} className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-brand-gold outline-none transition-all" />
                            </div>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-3.5 h-3.5" />
                              <input {...register(`inst_p${num}`)} type="number" placeholder={t.admin.price_val} className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-brand-gold outline-none transition-all text-brand-gold font-bold" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Credit Rows */}
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Percent className="w-3 h-3" />
                        {t.car.finance.credit.title}
                      </label>
                      <div className="space-y-3">
                        {[1, 2, 3].map((num) => (
                          <div key={`cred-${num}`} className="grid grid-cols-2 gap-3">
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-3.5 h-3.5" />
                              <input {...register(`cred_m${num}`)} type="number" placeholder={t.admin.month} className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-brand-gold outline-none transition-all" />
                            </div>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-3.5 h-3.5" />
                              <input {...register(`cred_p${num}`)} type="number" placeholder={t.admin.price_val} className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-brand-gold outline-none transition-all text-white/80 font-bold" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {!isEdit && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{t.admin.engine_ru}</label>
                        <input {...register('engine.ru')} placeholder="1.5 Turbo" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{t.admin.engine_kz}</label>
                        <input {...register('engine.kz')} placeholder="1.5 Turbo" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-all" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Media */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{t.admin.upload_image}</label>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {previewImages.map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 group">
                          <img src={img} className="w-full h-full object-cover" alt={`Preview ${index}`} />
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImages(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      
                      <div 
                        onDragEnter={onDrag}
                        onDragLeave={onDrag}
                        onDragOver={onDrag}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current.click()}
                        className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden
                          ${dragActive ? 'border-brand-gold bg-brand-gold/5' : 'border-white/10 hover:border-brand-gold/50 bg-black'}`}
                      >
                        <div className="text-center p-4">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-2 mx-auto group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5 text-white/20 group-hover:text-brand-gold transition-colors" />
                          </div>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t.admin.add_car}</p>
                        </div>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*"
                          multiple
                          className="hidden" 
                          onChange={(e) => handleFiles(e.target.files)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        Цветовые варианты
                      </span>
                      <button
                        type="button"
                        onClick={addColorVariant}
                        className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Plus size={14} />
                        Добавить цвет
                      </button>
                    </div>

                    <div className="space-y-4">
                      {colorVariants.map((variant) => (
                        <div
                          key={variant.id}
                          className="border border-white/10 rounded-2xl p-4 flex flex-col gap-3 bg-black/40"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded-full border border-white/10"
                              style={{ backgroundColor: variant.hex || '#ffffff' }}
                            />
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) =>
                                updateColorVariant(variant.id, 'name', e.target.value)
                              }
                              placeholder="Название цвета"
                              className="flex-1 bg-transparent border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-brand-gold outline-none transition-all"
                            />
                            <input
                              type="color"
                              value={variant.hex}
                              onChange={(e) =>
                                updateColorVariant(variant.id, 'hex', e.target.value)
                              }
                              className="w-10 h-10 rounded-full border border-white/10 bg-transparent cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => removeColorVariant(variant.id)}
                              className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 items-center">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest">
                              Превью автомобиля
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-12 rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                                {variant.image ? (
                                  <img
                                    src={variant.image}
                                    alt={variant.name || 'color image'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="text-white/20" size={18} />
                                )}
                              </div>
                              <label className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 border border-white/10 rounded-xl cursor-pointer hover:border-brand-gold hover:text-brand-gold transition-colors">
                                Загрузить
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleColorImage(variant.id, e.target.files[0])
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    {!isEdit && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{t.admin.drive_ru}</label>
                          <input {...register('transmission.ru')} placeholder="AWD" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{t.admin.drive_kz}</label>
                          <input {...register('transmission.kz')} placeholder="AWD" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-all" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddingCar(false);
                    setPreviewImages([]);
                  }} 
                  className="px-8 py-3 rounded-full font-bold border border-white/10 hover:bg-white/5 transition-all text-sm"
                >
                  {t.admin.cancel}
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-gold text-black px-10 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-sm shadow-lg shadow-brand-gold/10"
                >
                  <Save size={18} />
                  {editingCar ? t.admin.save : t.admin.add_car}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
