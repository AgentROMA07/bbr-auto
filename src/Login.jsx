import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldCheck, Languages } from 'lucide-react';
import { translations } from './data';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'kz');
  const navigate = useNavigate();
  const t = translations[lang];

  const toggleLang = () => {
    const newLang = lang === 'kz' ? 'ru' : 'kz';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (login === 'admin' && password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/admin');
    } else {
      setError(t.admin.login.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-tech">
      {/* Back to Home Button */}
      <div className="fixed top-8 left-8 flex items-center gap-4 z-50">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-white/40 hover:text-brand-gold transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-gold/10 transition-all">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t.admin.login.back}</span>
        </button>

        <div className="h-6 w-[1px] bg-white/10" />

        <button 
          onClick={toggleLang}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-brand-gold transition-all group"
        >
          <Languages size={14} className="text-brand-gold group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-[10px] font-tech font-bold uppercase tracking-widest text-white">{lang === 'kz' ? 'RU' : 'KZ'}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-gold/10 border border-brand-gold/20 rounded-3xl mb-6 rotate-3">
            <ShieldCheck className="text-brand-gold w-10 h-10 -rotate-3" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white mb-2">BBR<span className="text-brand-gold">.AUTH</span></h1>
          <p className="text-white/40 text-sm uppercase tracking-[0.2em] font-bold">{t.admin.login.secure_terminal}</p>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 ml-1">{t.admin.login.user}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
                <input 
                  type="text" 
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-brand-gold transition-all outline-none font-medium"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 ml-1">{t.admin.login.pass}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-brand-gold transition-all outline-none font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center animate-shake">
                {error}
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-brand-gold text-black py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              {t.admin.login.submit}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
              {t.admin.login.access_code}: <span className="text-brand-gold/40">admin / admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
