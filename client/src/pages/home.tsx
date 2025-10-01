import { useState, useEffect } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLinkClick = (platform: string) => {
    console.log(`Link clicked: ${platform}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-0 md:py-8">
      <div className="w-full max-w-2xl mx-auto px-4 md:px-6">
        {/* Banner Section */}
        <div 
          className={`relative w-full h-48 md:h-64 rounded-t-2xl md:rounded-2xl overflow-hidden mb-0 md:mb-4 transition-opacity duration-600 ${isVisible ? 'opacity-100 fade-in' : 'opacity-0'}`}
        >
          <img 
            src="https://cdn.getallmylinks.com/cdn-cgi/image/w=860,h=1864,q=90,fit=cover,f=auto,onerror=redirect/https://images.getallmylinks.com/backgrounds/club-dorado-banner-1-68be1ccedc4d0163194063.jpg" 
            alt="withgex profile banner - Club Dorado theme"
            className="w-full h-full object-cover"
            data-testid="img-banner"
          />
          <div className="banner-overlay absolute inset-0"></div>
        </div>

        {/* Profile Content Card */}
        <div 
          className={`glass-card rounded-b-2xl md:rounded-2xl p-6 md:p-8 relative transition-all duration-600 delay-200 ${isVisible ? 'opacity-100 slide-up' : 'opacity-0'}`}
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center -mt-20 md:-mt-24 mb-6">
            <div 
              className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-5xl md:text-6xl font-bold border-4 border-background avatar-glow"
              data-testid="avatar-withgex"
            >
              W
            </div>
          </div>

          {/* Profile Info */}
          <div 
            className={`text-center mb-8 transition-all duration-600 delay-300 ${isVisible ? 'opacity-100 slide-up' : 'opacity-0'}`}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-username">
              withgex
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground" data-testid="text-handle">
              @withgex
            </p>
          </div>

          {/* Social Links Section */}
          <div 
            className={`space-y-4 max-w-md mx-auto transition-all duration-600 delay-400 ${isVisible ? 'opacity-100 slide-up' : 'opacity-0'}`}
          >
            {/* Instagram Link */}
            <a 
              href="https://www.instagram.com/withgex" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => handleLinkClick("Instagram")}
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
              data-testid="link-instagram"
            >
              <svg 
                className="w-6 h-6" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-lg">Instagram</span>
            </a>

            {/* TikTok Link */}
            <a 
              href="https://www.tiktok.com/@gextrap" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => handleLinkClick("TikTok")}
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-white font-medium py-4 px-6 rounded-xl shadow-lg border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
              data-testid="link-tiktok"
            >
              <svg 
                className="w-6 h-6" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="text-lg">TikTok</span>
            </a>
          </div>

          {/* Footer Info */}
          <div 
            className={`mt-12 text-center text-muted-foreground text-sm transition-all duration-600 delay-500 ${isVisible ? 'opacity-100 slide-up' : 'opacity-0'}`}
            data-testid="text-footer"
          >
            <p>© 2024 withgex. All links in one place.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
