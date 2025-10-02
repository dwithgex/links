import { useEffect } from "react";

interface RedirectProps {
  url: string;
  platform: string;
}

export default function Redirect({ url, platform }: RedirectProps) {
  useEffect(() => {
    // Redirect inmediato
    window.location.href = url;
  }, [url, platform]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Redirigiendo a {platform}...</p>
      </div>
    </div>
  );
}