import { useEffect, useRef, useState } from "react";
import { socialLogin } from "../../services/api";

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window object"));
    if (window.google && window.google.accounts) return resolve(window.google);

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", () => reject(new Error("Failed to load Google SDK")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Failed to load Google SDK"));
    document.head.appendChild(script);
  });
}

export default function SocialLogin({ role, disabled, onSuccess, onError, onProfile }) {
  const initialized = useRef(false);
  const [googleReady, setGoogleReady] = useState(Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID));

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setGoogleReady(false);
        return;
      }

      try {
        await loadGoogleScript();
        if (!mounted) return;
        if (initialized.current) return;

        if (!window.google || !window.google.accounts) {
          onError?.("Google SDK failed to initialize.");
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            console.debug("Google callback received:", response);
            // Try to decode the ID token payload to expose profile info to the UI
            try {
              if (response?.credential) {
                const parts = String(response.credential).split('.');
                if (parts.length >= 2) {
                  const payload = JSON.parse(window.atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                  const profile = {
                    name: payload.name || "",
                    email: payload.email || "",
                    picture: payload.picture || "",
                  };
                  // provide profile via onProfile if available
                  if (typeof onProfile === 'function') {
                    onProfile(profile);
                  }
                }
              }
            } catch (e) {
              console.debug('Failed to decode id_token payload', e);
            }

            console.debug("Google callback received:", response);
            if (!response?.credential) {
              onError?.("No credential returned from Google.");
              return;
            }
            try {
              console.debug("Sending id_token to backend (first 40 chars):", String(response.credential).slice(0, 40) + "...");
              const session = await socialLogin({
                provider: "google",
                id_token: response.credential,
                role,
              });
              console.debug("Received session from backend:", session);
              onSuccess?.(session);
            } catch (err) {
              console.error("socialLogin error:", err);
              onError?.(err.message || "Google login failed.");
            }
          },
        });

        // Render the Google button into our hidden container (used as the click target)
        try {
          const btnContainer = document.getElementById("google-signin-button");
          if (btnContainer && window.google.accounts.id.renderButton) {
            window.google.accounts.id.renderButton(btnContainer, {
              theme: "outline",
              size: "large",
              width: 380,
            });
          }
        } catch (err) {
          console.warn("Failed to render Google button:", err);
        }

        initialized.current = true;
      } catch (err) {
        setGoogleReady(false);
        console.warn(err.message || "Failed to load Google SDK.");
      }
    };

    init();
    return () => { mounted = false; };
  }, [role, onError, onSuccess]);

  return (
    <div className="pt-2">
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
        <span className="absolute bg-white dark:bg-[#0B0F0D] px-4 text-[10px] uppercase tracking-[0.2em] text-gray-400">
          or continue with
        </span>
      </div>

      <div className="relative w-full group">
        <button
          type="button"
          disabled={disabled || !googleReady}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 dark:border-white/10 rounded-xl group-hover:bg-gray-50 dark:group-hover:bg-white/5 group-active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <i className="fa-brands fa-google text-lg"></i>
          <span className="text-sm">Google</span>
        </button>

        <div
          id="google-signin-button"
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            cursor: googleReady ? "pointer" : "not-allowed",
            pointerEvents: googleReady && !disabled ? "auto" : "none",
          }}
        ></div>

        <style>{`
          #google-signin-button > div {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
          }
          #google-signin-button > div > div {
            width: 100% !important;
          }
          #google-signin-button iframe {
            width: 100% !important;
            height: 100% !important;
            opacity: 0.01 !important;
          }
          #google-signin-button [role="button"] {
            width: 100% !important;
            opacity: 0.01 !important;
            cursor: pointer !important;
          }
        `}</style>
      </div>
    </div>
  );
}
