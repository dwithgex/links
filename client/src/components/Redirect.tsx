import { useEffect } from "react";

interface RedirectProps {
  url: string;
  platform: string;
}

export default function Redirect({ url, platform }: RedirectProps) {
  useEffect(() => {
    // Tracking del click
    const trackClick = async () => {
      try {
        const response = await fetch("/api/track/click", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform,
            url,
            timestamp: new Date().toISOString(),
          }),
        });
        console.log(`✅ Click en ${platform} registrado`);
      } catch (error) {
        console.error(`❌ Error al registrar click en ${platform}:`, error);
      }
    };

    trackClick();
    
    // Redirect inmediato
    window.location.href = url;
  }, [url, platform]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg font-medium text-muted-foreground">
          Redirigiendo a {platform}...
        </p>
      </div>
    </div>
  );
}