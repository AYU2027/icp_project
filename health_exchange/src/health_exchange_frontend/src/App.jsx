import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthClient } from "@dfinity/auth-client";
import Background from "./components/Background";
import Navbar from "./components/Navbar";
import Landing from "./views/Landing";
import PatientDashboard from "./views/PatientDashboard";
import ResearcherDashboard from "./views/ResearcherDashboard"; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [principal, setPrincipal] = useState("");
  const [authClient, setAuthClient] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  

  const [userRole, setUserRole] = useState(null); 


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);
        const _isAuthenticated = await client.isAuthenticated();
        if (_isAuthenticated) {
          setPrincipal(client.getIdentity().getPrincipal().toText());
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsInitializing(false); 
      }
    };
    
    checkAuth();
  }, []);

  
  useEffect(() => {
    if (!isLoggedIn) {
      setUserRole(null);
    }
  }, [isLoggedIn]);

  if (isInitializing) return null; 

 
  const renderDashboardContent = () => {
    if (!userRole) {
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 relative z-10">
          <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border border-neutral-200 dark:border-zinc-700">
            <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-2">Welcome to the Vault</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8">How would you like to interact with the network today?</p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setUserRole("Patient")}
                className="p-6 border-2 border-teal-500/50 hover:border-teal-500 text-teal-700 dark:text-teal-400 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all text-left"
              >
                <h3 className="text-xl font-bold mb-1">I am a Patient</h3>
                <p className="text-sm opacity-80">I want to secure my data and manage permissions.</p>
              </button>
              
              <button 
                onClick={() => setUserRole("Researcher")}
                className="p-6 border-2 border-blue-500/50 hover:border-blue-500 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
              >
                <h3 className="text-xl font-bold mb-1">I am a Researcher</h3>
                <p className="text-sm opacity-80">I want to explore anonymized data and request access.</p>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (userRole === "Patient") {
      return <PatientDashboard principal={principal} authClient={authClient} setIsLoggedIn={setIsLoggedIn} />;
    }

    if (userRole === "Researcher") {
      return <ResearcherDashboard principal={principal} authClient={authClient} setIsLoggedIn={setIsLoggedIn} />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <Background />
        <Navbar />
        
        <main className="container mx-auto flex-grow z-10 relative">
          <Routes>
            {/* Landing Route (Untouched logic!) */}
            <Route 
              path="/" 
              element={
                !isLoggedIn ? (
                  <Landing authClient={authClient} setIsLoggedIn={setIsLoggedIn} setPrincipal={setPrincipal} />
                ) : (
                  <Navigate to="/dashboard" replace /> /* Auto-redirect if already logged in */
                )
              } 
            />
            
            {/* Protected Dashboard Route */}
            <Route 
              path="/dashboard" 
              element={
                isLoggedIn ? (
                  renderDashboardContent() 
                ) : (
                  <Navigate to="/" replace /> 
                )
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;