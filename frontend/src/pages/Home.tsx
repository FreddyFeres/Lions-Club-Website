import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Users, Heart, ArrowRight, ShieldCheck, Clock,
  Eye, Globe, Handshake, Leaf, GraduationCap, Stethoscope,
  ChevronDown, Play, Pause, VolumeX, Volume2
} from 'lucide-react';
import api from '../services/api';
import dayjs from 'dayjs';
import DashboardCards from '../components/home/DashboardCards';
import FocusCausesGrid from '../components/home/FocusCausesGrid';
import ClubHierarchy from '../components/home/ClubHierarchy';

export default function Home() {
  const [stats, setStats] = useState({ clubTotalHours: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    
    // Slight delay to ensure DOM is ready
    setTimeout(() => {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        observer.observe(el);
      });
    }, 100);
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [hoursRes, eventsRes] = await Promise.all([
          api.get('/service-hours/leaderboard'),
          api.get('/events?filter=upcoming&limit=3')
        ]);
        setStats({ clubTotalHours: hoursRes.data.clubTotalHours });
        setUpcomingEvents(eventsRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHomeData();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) { videoRef.current.pause(); } else { videoRef.current.play(); }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── VIDEO HERO ─────────────────────────────────────────────────── */}
      <section className="relative w-full h-screen min-h-[640px] overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover scale-105"
          src="/axes/Club-Cover.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-lions-950/60 to-transparent" />

        <div className="relative z-10 text-left px-6 sm:px-10 lg:px-16 max-w-6xl mx-auto w-full">
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold tracking-[0.2em] mb-8 animate-fade-in uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse-slow"></span>
            District 414 • Lions Clubs International
          </span>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black text-white mb-6 leading-[0.95] animate-slide-up drop-shadow-2xl tracking-tight">
            Lions Club<br />
            <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">Tunis Golfe</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 mb-10 font-light animate-fade-up max-w-xl leading-relaxed" style={{ animationDelay: '0.15s' }}>
            <em className="text-white/90 font-medium not-italic">“We Serve”</em> — Servir, Inspirer, Transformer.<br />Depuis 2022, au cœur d’Ariana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <Link to="/events" className="btn-primary text-base px-8 py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 text-gray-900 hover:from-gold-400 hover:to-gold-300 border-none shadow-glow-gold font-bold">
              Rejoindre nos actions <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/donate" className="btn-secondary text-base px-8 py-3.5 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm dark:bg-white/10 dark:text-white dark:border-white/20">
              Soutenir le club <Heart className="w-4 h-4 fill-red-400 text-red-400" />
            </Link>
          </div>
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-24 right-6 z-20 flex gap-2">
          <button onClick={togglePlay} className="p-2.5 rounded-xl bg-black/40 text-white border border-white/15 hover:bg-black/60 backdrop-blur-sm transition-all" title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={toggleMute} className="p-2.5 rounded-xl bg-black/40 text-white border border-white/15 hover:bg-black/60 backdrop-blur-sm transition-all" title={isMuted ? 'Son' : 'Muet'}>
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-white/40 text-xs tracking-widest uppercase">Défiler</span>
          <ChevronDown className="w-5 h-5 text-white/40" />
        </div>

        {/* Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="bg-black/60 backdrop-blur-xl border-t border-white/5">
            <div className="max-w-6xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10">
              {[
                { value: '3 033 h', label: 'Heures de Service', Icon: Clock },
                { value: '2022', label: 'Année de Fondation', Icon: ShieldCheck },
                { value: '50+', label: 'Membres Actifs', Icon: Users },
                { value: 'D.414', label: 'District International', Icon: Globe },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center px-4 py-2">
                  <span className="text-2xl sm:text-3xl font-black text-gold-400 font-display">{s.value}</span>
                  <span className="text-xs text-white/50 flex items-center gap-1 mt-0.5 font-medium tracking-wide">
                    <s.Icon className="w-3 h-3" /> {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── À PROPOS DU CLUB ─────────────────────────────────────────────── */}
      <section className="relative py-28 bg-white dark:bg-gray-950 reveal-on-scroll overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-50 dark:opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-label"><ShieldCheck className="w-3.5 h-3.5" /> Notre Impact</span>
            <h2 className="text-4xl lg:text-5xl font-display font-black text-gray-900 dark:text-white mt-2 mb-4 text-balance">
              Lions Club Tunis Golfe — <span className="gradient-text">Plus de 3000h de service</span>
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Fondé en <strong className="text-gray-700 dark:text-gray-200">2022</strong> et basé à <strong className="text-gray-700 dark:text-gray-200">Ariana, Tunisie</strong>, le Lions Club Tunis Golfe est l'un des clubs les plus actifs du <strong className="text-gray-700 dark:text-gray-200">District 414</strong>.
              Avec plus de <strong className="text-gray-700 dark:text-gray-200">50 membres engagés</strong>, nous agissons activement sur les 8 causes mondiales : la Faim, l'Environnement, le Cancer infantile, la Vue, la Jeunesse, le Diabète, les Secours en cas de catastrophe et l'Aide Humanitaire.
            </p>
          </div>

          <DashboardCards />
          
          <FocusCausesGrid />
        </div>
      </section>

      <ClubHierarchy />

      {/* ── MISSION & VALEURS ─────────────────────────────────────────────── */}
      <section className="relative py-24 bg-gray-950 text-white reveal-on-scroll overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-lions-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label"><Heart className="w-3.5 h-3.5" /> Notre Raison d’Être</span>
            <h2 className="text-4xl lg:text-5xl font-display font-black text-white mt-2">Mission &amp; Valeurs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { Icon: Eye, title: 'Notre Vision', text: "Être les leaders dans la création et la promotion des opportunités d'action humanitaire permettant à la société de prospérer à travers le monde." },
              { Icon: Heart, title: 'Notre Mission', text: "Donner aux bénévoles les moyens de servir leur communauté, de répondre aux besoins humanitaires, de favoriser la paix et d'encourager la compréhension internationale." },
              { Icon: Globe, title: 'Lions International', text: "Avec 1,4 million de membres dans plus de 200 pays et territoires, nous formons le plus grand réseau de clubs de service au monde." },
            ].map((item, i) => (
              <div key={i} className="group relative bg-white/5 border border-white/8 rounded-3xl p-8 hover:bg-white/10 hover:border-white/15 transition-all duration-300">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-lions-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold-400/15 border border-gold-400/20 mb-5">
                    <item.Icon className="w-6 h-6 text-gold-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCHAINS ÉVÉNEMENTS ──────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 reveal-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="section-label"><Calendar className="w-3.5 h-3.5" /> Agenda</span>
              <h2 className="text-3xl lg:text-4xl font-display font-black text-gray-900 dark:text-white mt-2">Prochains Événements</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Rejoignez-nous lors de nos prochaines actions caritatives.</p>
            </div>
            <Link to="/events" className="hidden sm:flex btn-secondary text-sm">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event: any) => (
                <div key={event.id} className="card flex flex-col group overflow-hidden">
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {event.imagePath ? (
                      <img src={`/${event.imagePath}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lions-50 to-lions-100 dark:from-lions-950 dark:to-lions-900">
                        <Calendar className="w-10 h-10 text-lions-400" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-center rounded-xl px-3 py-1.5 shadow-soft-md">
                      <p className="text-xs font-bold text-lions-600 dark:text-lions-400 uppercase leading-none">{dayjs(event.startDate).format('MMM')}</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white leading-none mt-0.5">{dayjs(event.startDate).format('DD')}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                <Calendar className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Aucun événement à venir</h3>
                <p className="text-sm text-gray-400">Revenez bientôt pour découvrir nos nouvelles actions.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA REJOINDRE ─────────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden reveal-on-scroll">
        {/* Layered gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-lions-700 via-lions-800 to-lions-950" />
        <div className="absolute inset-0 bg-hero-pattern opacity-5" />
        {/* Glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-lions-500/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gold-500/15 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label justify-center text-gold-400">Passez à l'action</span>
          <h2 className="text-4xl lg:text-5xl font-display font-black text-white mb-6 mt-2 text-balance">
            Prêt à faire la différence ?
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Rejoignez une famille de bénévoles engagés. Créez votre compte pour participer à nos événements, suivre vos heures de service et contribuer à notre communauté.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="btn-primary bg-gold-500 text-gray-900 hover:bg-gold-400 border-none px-10 py-4 text-base font-bold shadow-glow-gold">
              Créer un compte gratuit
            </Link>
            <Link to="/donate" className="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 px-10 py-4 text-base backdrop-blur-sm">
              Faire un don <Heart className="w-4 h-4 fill-red-400 text-red-400" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
