import { useCallback, useEffect, useRef, useState } from "react";
import jawaLogo from "../assets/3dlogo.png"; // adjust path as needed
import "../styles/splash.css";

const EXIT_DURATION = 600;

export default function SplashScreen({
  duration = 3800,
  onFinish,
}) {
  const [exiting, setExiting] = useState(false);
  const hasFinishedRef = useRef(false);
  const exitTimerRef = useRef(null);

  const finishSplash = useCallback(() => {
    if (hasFinishedRef.current) {
      return;
    }

    hasFinishedRef.current = true;
    setExiting(true);

    exitTimerRef.current = window.setTimeout(() => {
      onFinish?.();
    }, EXIT_DURATION);
  }, [onFinish]);

  /* Finish after animation completes */
  useEffect(() => {
    const timer = window.setTimeout(finishSplash, duration);

    return () => {
      window.clearTimeout(timer);

      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, [duration, finishSplash]);

  return (
    <div className={`je-splash${exiting ? " je-splash--exit" : ""}`} onClick={finishSplash}>
      {/* Ambient effects */}
      <div className="je-flash" />
      <div className="je-scanline" />
      <div className="je-glow" />
      <div className="je-shockwave" />
      <div className="je-shockwave je-shockwave--2" />

      {/* Cinematic corner marks */}
      <span className="je-corner je-corner--tl" />
      <span className="je-corner je-corner--tr" />
      <span className="je-corner je-corner--bl" />
      <span className="je-corner je-corner--br" />

      {/* Logo */}
      <div className="je-logo-wrap">
        <img src={jawaLogo} alt="JAWA EdTech" className="je-logo" />
      </div>

      {/* Company name – letter-by-letter */}
      <div className="je-company-name" aria-label="JAWA EdTech">
        {"JAWA".split("").map((ch, i) => (
          <span key={i} style={{ animationDelay: `${1.35 + i * 0.07}s` }}>
            {ch}
          </span>
        ))}
        <span className="je-space" style={{ animationDelay: "1.63s" }}>&nbsp;</span>
        {"EdTech".split("").map((ch, i) => (
          <span
            key={i + 5}
            className="je-green"
            style={{ animationDelay: `${1.63 + i * 0.055}s` }}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* Accent line + tagline */}
      <div className="je-accent-line" />
      <p className="je-tagline">Learn &nbsp;·&nbsp; Lead &nbsp;·&nbsp; Innovate</p>
  
      {/* Loading bar */}
      <div className="je-loader-track">
        <div className="je-loader-fill" />
      </div>
    </div>
  );
}
