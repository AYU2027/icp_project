import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


import { idlFactory } from "declarations/health_exchange_backend/health_exchange_backend.did.js";
import { Actor, HttpAgent } from "@dfinity/agent";

export default function PatientDashboard({ principal, authClient, setIsLoggedIn }) {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({ name: "", age: "", diseases: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);

  
  const getAuthenticatedBackend = () => {
    const LIVE_CANISTER_ID = "zydb5-siaaa-aaaab-qacba-cai";
    const identity = authClient.getIdentity();

   
    const agent = new HttpAgent({
      identity: identity,
      host: "https://icp-api.io",
    });

  
    return Actor.createActor(idlFactory, {
      agent: agent,
      canisterId: LIVE_CANISTER_ID,
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const backend = getAuthenticatedBackend(); // Note: No 'await' needed here now
        const result = await backend.get_profile(principal);

        if (result.Ok) {
          setProfile(result.Ok);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [principal, authClient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const backend = getAuthenticatedBackend(); // Note: No 'await' needed here now

      const profileData = {
        role: { Patient: null },
        name: formData.name,
        age: parseInt(formData.age, 10),
        diseases: formData.diseases,
        authorized_viewers: [],
        notifications: [],
      };

      const result = await backend.save_profile(profileData);

      if (result.Err) {
        alert("Submission Failed: " + result.Err);
        return;
      }

      setProfile(profileData);
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Full Error:", error);
      alert("Blockchain Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrantAccess = async (researcherPrincipalString) => {
    setIsUpdatingAccess(true);
    try {
      const backend = getAuthenticatedBackend(); // Note: No 'await' needed here now
      const result = await backend.grant_access(researcherPrincipalString);

      if (result.Err) {
        alert(result.Err);
      } else {
        alert("Access granted successfully!");
        const updatedProfile = await backend.get_profile(principal);
        if (updatedProfile.Ok) {
          setProfile(updatedProfile.Ok);
        }
      }
    } catch (err) {
      console.error("Error granting access:", err);
      alert("Failed to grant access. Check console for details.");
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
            <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-teal-500/30 rounded-2xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Medical Profile</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Full Name</p>
                  <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200">{profile.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Age</p>
                  <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200">{profile.age} years old</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Known Diseases</p>
                  <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200">{profile.diseases}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">📬 Data Requests</h3>
                {profile.notifications && profile.notifications.length > 0 ? (
                  <ul className="space-y-3">
                    {profile.notifications.map((note, index) => (
                      <li key={index} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-100 dark:border-purple-800 flex flex-col gap-2">
                        <div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate"><strong>From:</strong> {note.researcher_id}</p>
                          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mt-1">"{note.message}"</p>
                          <span className="text-xs font-bold text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 px-2 py-1 rounded mt-2 inline-block">
                            {note.status}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => handleGrantAccess(note.researcher_id)}
                            disabled={note.status === "Approved" || isUpdatingAccess}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {note.status === "Approved" ? "Access Granted" : "Approve"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 bg-neutral-100 dark:bg-zinc-900/50 rounded-lg border border-dashed border-neutral-300 dark:border-zinc-700 text-center text-sm text-neutral-500">
                    No pending data requests from researchers.
                  </div>
                )}
              </div>
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
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Age</label>
                <input required type="number" min="0" max="120" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-700 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Current/Past Diseases</label>
                <input required type="text" placeholder="e.g. Asthma, Type 2 Diabetes" value={formData.diseases} onChange={(e) => setFormData({...formData, diseases: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-700 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-bold transition-all disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Medical Record"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}