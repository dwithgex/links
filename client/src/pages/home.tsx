import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Tracking de visita mejorado con debug
    const trackVisit = async () => {
      try {
        console.log("🔄 Iniciando tracking de visita...");
        const response = await apiRequest("POST", "/api/track/visit", {
          referrer: document.referrer || null,
          userAgent: navigator.userAgent || null,
        });
        console.log("✅ Visita registrada correctamente:", response);
        
      } catch (error) {
        console.error("❌ Error al registrar visita:", error);
      }
    };

    trackVisit();
  }, []);

    const handleLinkClick = async (url: string, platform: string) => {
    try {
      console.log(`🔄 Tracking click en ${platform}...`);
      
      // Registrar el click
      await apiRequest("POST", "/api/track/click", {
        platform,
        url,
        timestamp: new Date().toISOString(),
      });
      
      // También registrar una visita adicional cuando hacen clic hacia redes sociales
      // Esto cuenta las interacciones que llevan al apartado de redes
      await apiRequest("POST", "/api/track/visit", {
        referrer: `click-${platform}`, // Identificamos que es una visita por click
        userAgent: navigator.userAgent || null,
      });
      
      console.log(`✅ Click en ${platform} registrado correctamente`);
      
    } catch (error) {
      console.error(`❌ Error al registrar click en ${platform}:`, error);
    }
    
    // Abrir enlace
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-0 md:py-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 md:px-6 relative z-10">
        {/* Profile Content Card */}
        <div 
          className={`glass-card rounded-2xl p-6 md:p-8 relative transition-all duration-600 delay-200 shadow-xl ${isVisible ? 'opacity-100 slide-up' : 'opacity-0'}`}
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div 
              className="w-36 h-36 md:w-40 md:h-40 rounded-full border-4 border-background shadow-2xl relative group cursor-pointer overflow-hidden"
              data-testid="avatar-withgex"
            >
              <img 
                src={import.meta.env.PROD ? "/withgex/hasbulla-army-v2-orig-500x500mm.jpg" : "/hasbulla-army-v2-orig-500x500mm.jpg"}
                alt="WithGex Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10"></div>
            </div>
          </div>

          {/* Profile Info */}
          <div 
            className={`text-center mb-10 transition-all duration-600 delay-300 ${isVisible ? 'opacity-100 slide-up' : 'opacity-0'}`}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-3 tracking-tight leading-tight" data-testid="text-username">
              WithGex
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light mb-4" data-testid="text-handle">
              @withgex
            </p>
          </div>

          {/* Social Links Section */}
          <div 
            className={`space-y-4 max-w-md mx-auto transition-all duration-600 delay-400 ${isVisible ? 'opacity-100 slide-up' : 'opacity-0'}`}
          >
            {/* Instagram Link */}
            <a 
              href="/go/instagram" 
              className="group flex items-center justify-between w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white font-semibold py-5 px-7 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95 relative overflow-hidden"
              data-testid="link-instagram"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                  <svg 
                    className="w-7 h-7" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-xl">Instagram</span>
              </div>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            {/* TikTok Link */}
            <a 
              href="/go/tiktok" 
              className="group flex items-center justify-between w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 hover:from-black hover:via-gray-900 hover:to-black text-white font-semibold py-5 px-7 rounded-2xl shadow-lg border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95 relative overflow-hidden"
              data-testid="link-tiktok"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                  <svg 
                    className="w-7 h-7" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
                <span className="text-xl">TikTok</span>
              </div>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Footer Info */}
          <div 
            className={`mt-14 text-center transition-all duration-600 delay-500 ${isVisible ? 'opacity-100 slide-up' : 'opacity-0'}`}
            data-testid="text-footer"
          >
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-border to-transparent mb-6"></div>
            <p className="text-muted-foreground/80 text-sm mb-2">
              © 2025 withgex | Powered by Global Tools AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
