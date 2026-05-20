import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal"; // 👈 Required to handle Web3 IDs
import { createActor, canisterId } from "declarations/health_exchange_backend";

export default function PatientDashboard({ principal, authClient, setIsLoggedIn }) {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", bloodType: "", allergies: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Phase 3: Access Control State
  const [researcherId, setResearcherId] = useState("");
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);

const getAuthenticatedBackend = async () => {
    const identity = authClient.getIdentity();

    // The LIVE ID of your Rust Smart Contract on the Playground
    const LIVE_CANISTER_ID = "yhlsk-rqaaa-aaaab-qacfq-cai"; 

    const backend = createActor(LIVE_CANISTER_ID, {
      agentOptions: {
        identity: identity,
        host: "https://icp-api.io", // 👈 Bypasses local network, talks to global mainnet!
      },
    });

    // We do NOT need fetchRootKey() anymore because we are on the trusted mainnet!
    return backend;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const backend = await getAuthenticatedBackend();
        const result = await backend.get_my_profile(); 
        if (result.length > 0) setProfile(result[0]);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const backend = await getAuthenticatedBackend();
      const result = await backend.create_profile(formData.name, formData.bloodType, formData.allergies);
      if (result.includes("Error")) {
        alert("Submission Failed: " + result);
        return;
      }
      setProfile({
        name: formData.name,
        blood_type: formData.bloodType,
        allergies: formData.allergies,
        owner: principal,
        authorized_researchers: []
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PHASE 3: GRANT ACCESS ---
  const handleGrantAccess = async () => {
    if (!researcherId.trim()) return;
    setIsUpdatingAccess(true);
    try {
      const backend = await getAuthenticatedBackend();
      // Convert the text input into a true cryptographic Principal object
      const targetPrincipal = Principal.fromText(researcherId); 
      const result = await backend.grant_access(targetPrincipal);
      
      if (result.includes("Error")) {
        alert(result);
      } else {
        setProfile({
          ...profile,
          authorized_researchers: [...profile.authorized_researchers, targetPrincipal]
        });
        setResearcherId(""); // Clear the input
      }
    } catch (err) {
      alert("Invalid Principal ID format.");
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  // --- PHASE 3: REVOKE ACCESS ---
  const handleRevokeAccess = async (targetPrincipal) => {
    setIsUpdatingAccess(true);
    try {
      const backend = await getAuthenticatedBackend();
      await backend.revoke_access(targetPrincipal);
      
      setProfile({
        ...profile,
        // Filter the revoked ID out of the UI array
        authorized_researchers: profile.authorized_researchers.filter(p => p.toText() !== targetPrincipal.toText())
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingAccess(false);
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
    <div className="py-12 z-10 relative px-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">My Health Vault</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">Your data is encrypted and secured by ICP.</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors border border-red-500/20">
            Secure Logout
          </button>
        </div>

        <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-neutral-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Your Web3 Identity</h2>
          <code className="text-xs sm:text-sm text-blue-600 dark:text-teal-400 break-all">{principal}</code>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-neutral-500 animate-pulse font-medium">Decrypting blockchain records...</div>
        ) : profile ? (
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Profile Card */}
            <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-teal-500/30 rounded-2xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Medical Profile</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Full Name</p>
                  <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200">{profile.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Blood Type</p>
                  <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200">{profile.blood_type}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Known Allergies</p>
                  <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200">{profile.allergies}</p>
                </div>
              </div>
            </div>

            {/* Data Sharing Control Panel */}
            <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-neutral-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">Access Control</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Grant researchers or doctors access using their Web3 Principal ID.</p>
              
              <div className="flex gap-2 mb-8">
                <input 
                  type="text" 
                  value={researcherId} 
                  onChange={(e) => setResearcherId(e.target.value)} 
                  placeholder="Enter Principal ID..." 
                  className="flex-grow px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  onClick={handleGrantAccess} 
                  disabled={isUpdatingAccess}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition disabled:opacity-50 whitespace-nowrap"
                >
                  Grant Access
                </button>
              </div>

              <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3 uppercase tracking-wider">Active Permissions</h4>
              
              {profile.authorized_researchers.length === 0 ? (
                <div className="p-4 bg-neutral-100 dark:bg-zinc-900/50 rounded-lg border border-dashed border-neutral-300 dark:border-zinc-700 text-center text-sm text-neutral-500">
                  Your data is completely private. No one else has access.
                </div>
              ) : (
                <ul className="space-y-3">
                  {profile.authorized_researchers.map((resPrincipal, index) => (
                    <li key={index} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 rounded-lg">
                      <code className="text-xs text-blue-600 dark:text-teal-400 truncate max-w-[200px]" title={resPrincipal.toText()}>
                        {resPrincipal.toText()}
                      </code>
                      <button 
                        onClick={() => handleRevokeAccess(resPrincipal)}
                        disabled={isUpdatingAccess}
                        className="text-xs font-bold text-red-500 hover:text-red-400 disabled:opacity-50"
                      >
                        REVOKE
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        ) : (
          <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-neutral-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 text-center">Initialize Your Vault</h3>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-700 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Blood Type</label>
                <select required value={formData.bloodType} onChange={(e) => setFormData({...formData, bloodType: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-700 focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="" disabled>Select Blood Type</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Known Allergies</label>
                <input required type="text" value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-700 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-bold transition-all disabled:opacity-50">
                Save Medical Record
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}