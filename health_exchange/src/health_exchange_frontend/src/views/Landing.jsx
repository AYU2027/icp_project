export default function Landing({ authClient, setIsLoggedIn, setPrincipal }) {
  
  const handleLogin = async () => {
    if (!authClient) return;
    const APP_NAME = "HealthVault";
    const APP_LOGO = "https://nfid.one/icons/favicon-96x96.png";
    const CONFIG_QUERY = `?applicationName=${encodeURIComponent(APP_NAME)}&applicationLogo=${encodeURIComponent(APP_LOGO)}`;
    
    await authClient.login({
      identityProvider: `https://nfid.one/authenticate${CONFIG_QUERY}`,
      onSuccess: () => {
        setPrincipal(authClient.getIdentity().getPrincipal().toText());
        setIsLoggedIn(true);
    
      },
      windowOpenerFeatures: `left=${window.screen.width / 2 - 525 / 2},top=${window.screen.height / 2 - 705 / 2},toolbar=0,location=0,menubar=0,width=525,height=705`,
    });
  };

  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 z-10 relative">
      <div className="max-w-4xl">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6 text-neutral-900 dark:text-white">
          Your Health Data, Your Control.
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-10">
          HealthVault is a revolutionary platform built on the Internet Computer that puts you at the center of your healthcare journey.
        </p>

        <div className="flex justify-center items-center gap-4">
          <button 
            onClick={handleLogin}
            className="aurora-btn flex items-center gap-3 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-full hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-teal-400/20 transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
           Login with Internet Identity
          </button>
        </div>
      </div>
    </section>
  );
}