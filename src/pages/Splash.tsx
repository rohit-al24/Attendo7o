import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import attendoLogo from "@/assets/attendo-logo.png";

const Splash = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'text' | 'blur' | 'logo'>('text');
  const [showBlack, setShowBlack] = useState(false);

  useEffect(() => {
    let t1: any, t2: any, t3: any;
    t1 = setTimeout(() => {
      setShowBlack(true); // start fading in black overlay at the same time as blur
      setStage('blur');
    }, 2000); // after 2s, blur and fade bg
    t2 = setTimeout(() => setStage('logo'), 3200); // after 3.2s, show logo (after transition)
    t3 = setTimeout(() => navigate("/login-selection"), 5200); // after 5.2s, navigate
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div className="relative h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes logo-zoom-out {
          0% { transform: scale(1); opacity: 1; }
          80% { transform: scale(2.5); opacity: 1; }
          100% { transform: scale(8); opacity: 0; }
        }
        .logo-zoom-out {
          animation: logo-zoom-out 1.6s cubic-bezier(.4,0,.2,1) forwards;
        }
        @keyframes fluid1 {
          0% { transform: translate(-30%, -10%) scale(1) rotate(0deg); }
          50% { transform: translate(-20%, 10%) scale(1.08) rotate(8deg); }
          100% { transform: translate(-30%, -10%) scale(1) rotate(0deg); }
        }
        @keyframes fluid2 {
          0% { transform: translate(40%, 20%) scale(1.1) rotate(0deg); }
          50% { transform: translate(30%, 0%) scale(1.18) rotate(-6deg); }
          100% { transform: translate(40%, 20%) scale(1.1) rotate(0deg); }
        }
        .fluid-blob1 {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 420px;
          height: 320px;
          background: radial-gradient(ellipse at 60% 40%, #222442cc 60%, #0A0D15 100%);
          opacity: 0.32;
          filter: blur(48px);
          border-radius: 60% 40% 50% 70% / 60% 50% 70% 40%;
          z-index: 1;
          animation: fluid1 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .fluid-blob2 {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 340px;
          height: 260px;
          background: radial-gradient(ellipse at 40% 60%, #0A0D15 60%, #222442 100%);
          opacity: 0.22;
          filter: blur(36px);
          border-radius: 50% 60% 40% 70% / 70% 40% 60% 50%;
          z-index: 2;
          animation: fluid2 14s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .fade-black {
          position: absolute;
          inset: 0;
          z-index: 5;
          background: #000;
          opacity: 0;
          transition: opacity 1.2s cubic-bezier(.4,0,.2,1);
          pointer-events: none;
        }
        .fade-black.show {
          opacity: 1;
        }
        /* Fluid droplet effects */
        @keyframes droplet1 {
          0% { transform: translate(-60%, -60%) scale(1) rotate(0deg); }
          50% { transform: translate(-55%, -65%) scale(1.12) rotate(8deg); }
          100% { transform: translate(-60%, -60%) scale(1) rotate(0deg); }
        }
        @keyframes droplet2 {
          0% { transform: translate(60%, 60%) scale(1.1) rotate(0deg); }
          50% { transform: translate(65%, 55%) scale(1.18) rotate(-6deg); }
          100% { transform: translate(60%, 60%) scale(1.1) rotate(0deg); }
        }
        @keyframes droplet3 {
          0% { transform: translate(-40%, 60%) scale(1.05) rotate(0deg); }
          50% { transform: translate(-45%, 65%) scale(1.15) rotate(10deg); }
          100% { transform: translate(-40%, 60%) scale(1.05) rotate(0deg); }
        }
        .droplet1 {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 180px;
          height: 180px;
          background: radial-gradient(ellipse at 60% 40%, #222442cc 60%, #0A0D15 100%);
          opacity: 0.38;
          filter: blur(32px);
          border-radius: 60% 40% 50% 70% / 60% 50% 70% 40%;
          z-index: 2;
          animation: droplet1 8s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .droplet2 {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 120px;
          height: 120px;
          background: radial-gradient(ellipse at 40% 60%, #0A0D15 60%, #222442 100%);
          opacity: 0.28;
          filter: blur(24px);
          border-radius: 50% 60% 40% 70% / 70% 40% 60% 50%;
          z-index: 2;
          animation: droplet2 10s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .droplet3 {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 90px;
          height: 90px;
          background: radial-gradient(ellipse at 60% 40%, #6ffcff33 60%, #222442 100%);
          opacity: 0.18;
          filter: blur(18px);
          border-radius: 60% 40% 50% 70% / 60% 50% 70% 40%;
          z-index: 2;
          animation: droplet3 7s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes ripple-motion {
          0% { transform: scale(1.0) rotate(0deg) translate(0%, 0%); }
          50% { transform: scale(1.1) rotate(1deg) translate(2%, 3%); }
          100% { transform: scale(1.0) rotate(0deg) translate(0%, 0%); }
        }
        .fluid-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(ellipse at 50% 40%, rgba(2,6,23,1) 60%, rgba(16,24,32,0.9) 100%);
          animation: ripple-motion 25s ease-in-out infinite alternate;
        }
        @keyframes foggy-blur {
          0% { opacity: 1; filter: blur(0px); }
          100% { opacity: 0; filter: blur(16px); }
        }
        .foggy-blur {
          animation: foggy-blur 0.6s cubic-bezier(.4,0,.2,1) forwards;
        }
      `}</style>
  <div className="fluid-bg" />
  {/* Fluid animated blobs behind text/logo */}
  <div className="fluid-blob1" />
  <div className="fluid-blob2" />
  {/* Fluid droplet effects */}
  <div className="droplet1" />
  <div className="droplet2" />
  <div className="droplet3" />
  {/* Black overlay fades in behind logo */}
  <div className={`fade-black${showBlack ? ' show' : ''}`} />
      <div className="relative z-10 flex flex-col items-center justify-center">
        {stage === 'text' && (
          <span className="text-white font-semibold text-4xl text-center">Attendo</span>
        )}
        {stage === 'blur' && (
          <span className="text-white font-semibold text-4xl text-center foggy-blur">Attendo</span>
        )}
        {stage === 'logo' && (
          <div className="flex items-center justify-center">
            <img
              src={attendoLogo}
              alt="Attendo Logo"
              className="w-32 h-32 object-contain drop-shadow-lg logo-zoom-out"
              style={{ filter: 'brightness(1.2) contrast(1.1)' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Splash;
