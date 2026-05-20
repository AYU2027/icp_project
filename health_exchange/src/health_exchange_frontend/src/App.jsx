import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthClient } from "@dfinity/auth-client";

import Background from "./components/Background";
import Navbar from "./components/Navbar";
import Landing from "./views/Landing";
import PatientDashboard from "./views/PatientDashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [principal, setPrincipal] = useState("");
  const [authClient, setAuthClient] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check if user is already logged in when they visit the site
  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      const _isAuthenticated = await client.isAuthenticated();
      if (_isAuthenticated) {
        setPrincipal(client.getIdentity().getPrincipal().toText());
        setIsLoggedIn(true);
      }
      setIsInitializing(false); // Finished checking
    });
  }, []);

  if (isInitializing) return null; // Prevents UI flicker while checking auth

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <Background />
        <Navbar />
        
        <main className="container mx-auto flex-grow z-10">
          <Routes>
            {/* Landing Route */}
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
                  <PatientDashboard principal={principal} authClient={authClient} setIsLoggedIn={setIsLoggedIn} />
                ) : (
                  <Navigate to="/" replace /> /* Auto-kick to landing if not logged in */
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