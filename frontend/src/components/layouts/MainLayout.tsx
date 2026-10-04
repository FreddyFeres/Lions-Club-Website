import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
import { Menu, X, User, LogOut, ChevronDown, Settings, Sun, Moon, MapPin, Mail, Phone, Heart } from 'lucide-react';

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <header className={`sticky top-0 z-40 transition-all duration-500 ${isScrolled ? 'glass-nav shadow-soft-sm py-0' : 'glass-nav-transparent py-2'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center flex-1 min-w-0">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <img src="/LOGO OFFICIELLE.jpg" alt="Lions Club Tunis Golfe" className="h-8 w-auto" />
                <span className="font-display font-bold text-xl text-lions-800 dark:text-lions-200 hidden sm:block tracking-tight">
                  Lions Club Tunis Golfe
                </span>
              </Link>
              
              <nav className="hidden 2xl:ml-8 2xl:flex 2xl:items-center 2xl:gap-2">
                <Link to="/" className="nav-link">Accueil</Link>
                <Link to="/about" className="nav-link">À propos</Link>
                <Link to="/organisation" className="nav-link">Organisation</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
                <Link to="/events" className="nav-link">Événements</Link>
                {isAuthenticated && (
                  <Link to="/documents" className="nav-link">Documents</Link>
                )}
                {user?.role !== 'normal_user' && isAuthenticated && (
                  <>
                    <Link to="/meetings" className="nav-link">Réunions</Link>
                    <Link to="/directory" className="nav-link">Membres</Link>
                  </>
                )}
                {(!isAuthenticated || user?.role === 'normal_user') && (
                  <Link to="/join" className="nav-link font-bold text-lions-600 dark:text-lions-400">Devenir Membre</Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-4 ml-2">
                  <NotificationBell />
                  
                  {/* Profile Dropdown */}
                  <div className="relative ml-3">
                    <div>
                      <button 
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lions-500 transition-all hover:ring-2 hover:ring-lions-300"
                      >
                        {user?.avatar ? (
                          <img className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm" src={`/${user.avatar}`} alt="" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-lions-100 flex items-center justify-center text-lions-800 font-bold border-2 border-white shadow-sm">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </div>
                        )}
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    
                    {profileDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)}></div>
                        <div className="origin-top-right absolute right-0 mt-3 w-60 rounded-2xl shadow-soft-lg py-2 bg-white/95 backdrop-blur-xl ring-1 ring-black/5 z-20 overflow-hidden animate-scale-in dark:bg-gray-900 dark:ring-white/10">
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
                            <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-lions-100 text-lions-700 dark:bg-lions-900/40 dark:text-lions-300">
                              {user?.role.replace('_', ' ')}
                            </div>
                          </div>
                          
                          {(user?.role === 'admin' || user?.role === 'board_member') && (
                            <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 flex items-center" onClick={() => setProfileDropdownOpen(false)}>
                              <Settings className="w-4 h-4 mr-2 text-gray-400" />
                              Administration
                            </Link>
                          )}
                          
                          <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 flex items-center" onClick={() => setProfileDropdownOpen(false)}>
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            Mon Profil
                          </Link>
                          {user?.role === 'normal_user' && (
                            <Link to="/join" className="block px-4 py-2 text-sm text-lions-600 hover:bg-lions-50 dark:text-lions-400 dark:hover:bg-gray-700 font-medium" onClick={() => setProfileDropdownOpen(false)}>
                              Devenir Membre du Club
                            </Link>
                          )}
                          <Link to="/my-reservations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setProfileDropdownOpen(false)}>Mes Réservations</Link>
                          
                          {user?.role !== 'normal_user' && (
                            <>
                              <Link to="/my-meetings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setProfileDropdownOpen(false)}>Mes Réunions</Link>
                              <Link to="/service-hours" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setProfileDropdownOpen(false)}>Mes Heures de Service</Link>
                            </>
                          )}
                          
                          <div className="border-t border-gray-100 dark:border-gray-700 mt-1">
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center">
                              <LogOut className="w-4 h-4 mr-2" />
                              Déconnexion
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm">Connexion</Link>
                  <Link to="/register" className="btn-primary py-2 px-4 text-sm">S'inscrire</Link>
                </div>
              )}
              
              {/* Mobile menu button */}
              <div className="flex items-center 2xl:hidden ml-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                >
                  {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                </button>
              </div>

              <Link to="/donate" className="hidden md:flex btn-primary py-1.5 px-4 text-sm whitespace-nowrap ml-2">
                ❤️ Faire un Don
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="2xl:hidden bg-white dark:bg-gray-800 shadow-xl absolute w-full animate-slide-up origin-top border-b border-gray-200 dark:border-gray-700">
            <div className="pt-2 pb-3 space-y-1 px-4">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-lions-600 hover:bg-lions-50 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
              <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-lions-600 hover:bg-lions-50 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>À propos</Link>
              <Link to="/organisation" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-lions-600 hover:bg-lions-50 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>Organisation</Link>
              <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-lions-600 hover:bg-lions-50 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <Link to="/events" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-lions-600 hover:bg-lions-50 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>Événements</Link>
              {isAuthenticated && (
                <Link to="/documents" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-lions-600 hover:bg-lions-50 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>Documents</Link>
              )}
              {user?.role !== 'normal_user' && isAuthenticated && (
                <>
                  <Link to="/meetings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-lions-600 hover:bg-lions-50 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>Réunions</Link>
                  <Link to="/directory" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-lions-600 hover:bg-lions-50 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>Membres</Link>
                </>
              )}
              <Link to="/donate" className="block px-3 py-2 rounded-md text-base font-medium text-lions-600 hover:bg-lions-50 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>Faire un Don ❤️</Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-gray-950 text-white pt-20 pb-8 mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            {/* Brand Col */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 mb-5">
                <img src="/LOGO OFFICIELLE.jpg" alt="Logo" className="h-10 w-auto rounded-lg" />
                <div>
                  <span className="block font-display font-bold text-lg leading-tight">Lions Club</span>
                  <span className="block text-sm text-gray-400">Tunis Golfe</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-xs">
                Servir, Inspirer, Transformer. Depuis 2022, au cœur d'Ariana, au service de la communauté tunisienne.
              </p>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/profile.php?id=100079142253327" target="_blank" rel="noopener noreferrer"
                  className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-lions-600 hover:text-white hover:border-lions-500 transition-all duration-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                <a href="https://www.instagram.com/lionsclubtunisgolfe" target="_blank" rel="noopener noreferrer"
                  className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-lions-600 hover:text-white hover:border-lions-500 transition-all duration-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-5">Navigation</h3>
              <ul className="space-y-3">
                {[['À propos', '/about'], ['Événements', '/events'], ['Faire un Don', '/donate'], ['Notre Équipe', '/directory'], ['Devenir Membre', '/join']].map(([label, href]) => (
                  <li key={href}>
                    <Link to={href} className="text-gray-400 hover:text-white text-sm transition-colors duration-150">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* District */}
            <div className="md:col-span-3">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-5">Notre Club</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>🦁 Lions Clubs International</li>
                <li>📍 District 414 – Tunisie</li>
                <li>📅 Fondé en 2022</li>
                <li>✅ 50+ Membres actifs</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-3">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-5">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-lions-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-400">Ariana, Tunis, Tunisie</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-lions-400 shrink-0" />
                  <a href="mailto:Lionsclubtunisgolfe@gmail.com" className="text-sm text-gray-400 hover:text-white transition-colors break-all">Lionsclubtunisgolfe@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Lions Club Tunis Golfe (District 414). Tous droits réservés.
            </p>
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                Fait avec <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse" /> pour servir.
              </p>
              <p className="text-xs text-gray-500">
                Developed by <Link to="/contact" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">Feres Fatmi</Link> AKA <span className="text-white font-semibold">Freddy</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
