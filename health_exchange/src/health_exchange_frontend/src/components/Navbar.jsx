import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import the router for logout
import logo from "./logo.png";


export default function Navbar({ isLoggedIn, authClient, setIsLoggedIn }) {
  const [isDark, setIsDark] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("color-theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("color-theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
      setIsDark(true);
    }
  };


  const handleLogout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsLoggedIn(false);
      navigate("/"); 
    }
  };

  return (
   
    <header className="sticky top-6 z-50 flex justify-center px-4 pointer-events-none mb-12">
      
      <nav className="pointer-events-auto flex items-center justify-between w-full max-w-6xl bg-white/50 dark:bg-black/40 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full px-6 py-3 transition-all duration-500 ease-out hover:bg-white/60 dark:hover:bg-black/50">
        
        {/* BRANDING SECTION */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/20 dark:bg-white/5 transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-110 shadow-sm border border-transparent group-hover:border-white/30 dark:group-hover:border-white/20">
            <img src={logo} alt="HealthVault Logo" className="w-7 h-7 object-contain drop-shadow-lg" />
          </div>
          <span className="text-xl md:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-blue-500 to-purple-600 dark:from-teal-400 dark:via-indigo-400 dark:to-purple-500 transition-all duration-500 group-hover:hue-rotate-15">
            HealthVault
          </span>
        </div>
        
       
        <div className="flex items-center space-x-3 md:space-x-5">
          
        
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full cursor-default backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-300">
              Localnet
            </span>
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="relative p-2.5 rounded-full text-neutral-500 dark:text-neutral-400 transition-all duration-500 hover:text-teal-600 dark:hover:text-teal-300 hover:rotate-45 focus:outline-none overflow-hidden group">
            <div className="absolute inset-0 bg-neutral-200/50 dark:bg-zinc-800/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100"></div>
            <div className="relative z-10">
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
              )}
            </div>
          </button>

         
          {isLoggedIn && (
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 rounded-full text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors border border-red-500/20 shadow-sm"
            >
              Disconnect
            </button>
          )}

        </div>
      </nav>
    </header>
  );
}