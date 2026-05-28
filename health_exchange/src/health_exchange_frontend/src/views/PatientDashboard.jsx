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

  const getAuthenticatedBackend = async () => {
    const LOCAL_CANISTER_ID = "uxrrr-q7777-77774-qaaaq-cai";
    const identity = authClient.getIdentity();

    const agent = new HttpAgent({
      identity: identity,
      host: "https://cuddly-eureka-4jvwv499grg73j5pp-4943.app.github.dev",
    });

    // Await root key to prevent signature verification errors
    await agent.fetchRootKey().catch(console.error);

    return Actor.createActor(idlFactory, {
      agent: agent,
      canisterId: LOCAL_CANISTER_ID,
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!principal || principal === "2vxsx-fae") return; // Skip if anonymous generic key
      try {
        const backend = await getAuthenticatedBackend();
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
      const backend = await getAuthenticatedBackend();

      const profileData = {
        role: { Patient: null },
        name: formData.name,
        age: parseInt(formData.age, 10),
        diseases: formData.diseases,
        authorized_viewers: [],
        notifications: [],
        medical_scans: [], // Aligns with the updated backend structure
      };

      const result = await backend.save_profile(profileData);

      if (result.Err) {
        alert("Submission Failed: " + result.Err);
        return;
      }

      setProfile(profileData);
      alert("Profile registered successfully!");
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
      const backend = await getAuthenticatedBackend();
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
      alert("Failed to grant access.");
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
    <div className="py-12 z-10 relative px-6 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-4xl mx-auto">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Patient Secure Space</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your immutable medical ledger entries.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono text-zinc-500">{principal.substring(0, 7)}...</span>
            </div>
          
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-sm text-zinc-400 animate-pulse">Synchronizing ledger keys...</div>
        ) : profile ? (
          /* DASHBOARD VIEW FOR REFRESHES */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Core Medical File</h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">Declared Identifier</span>
                    <p className="text-base font-medium mt-0.5">{profile.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">Age Bracket</span>
                      <p className="text-base font-medium mt-0.5">{profile.age} years</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">Classification</span>
                      <p className="text-base font-medium mt-0.5">{profile.diseases}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF & REPORT STORAGE HOLDER */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Encrypted Document Vault</h2>
                <p className="text-xs text-zinc-400 mb-4">Upload and attach verified radiology reports or clinical summaries.</p>
                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center bg-zinc-50/50 dark:bg-zinc-950/30">
                  <span className="text-2xl block mb-2">📄</span>
                  <button className="text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-2 rounded-md font-semibold mb-1">
                    Select Medical PDF
                  </button>
                  <p className="text-[10px] text-zinc-400">Maximum size allowance: 2MB</p>
                </div>
              </div>
            </div>

            {/* REQUESTS COLUMN */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-4">Pending Handshakes</h3>
                {profile.notifications && profile.notifications.length > 0 ? (
                  <div className="space-y-3">
                    {profile.notifications.map((note, idx) => (
                      <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                        <p className="text-zinc-400 truncate">🔬 {note.researcher_id}</p>
                        <p className="font-medium my-1.5">"{note.message}"</p>
                        <button
                          onClick={() => handleGrantAccess(note.researcher_id)}
                          disabled={note.status === "Approved" || isUpdatingAccess}
                          className="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white py-1 rounded font-medium transition disabled:opacity-40"
                        >
                          {note.status === "Approved" ? "Access Clear" : "Grant Authorization"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic text-center py-4">No active connection requests found.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* REGISTRATION ONBOARDING FLOW */
          <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-md">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Register Vault Profile</h2>
              <p className="text-xs text-zinc-400 mt-1">Initialize your records to configure network indexing values.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Full Name Alias</label>
                <input required type="text" placeholder="e.g. Patient Alpha" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-teal-500" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Age Matrix</label>
                <input required type="number" min="0" max="120" placeholder="Years" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-teal-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Condition Metric Dropdown</label>
                <select required value={formData.diseases} onChange={(e) => setFormData({...formData, diseases: e.target.value})} className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-teal-500">
                  <option value="" disabled>Choose categorization profile...</option>
                  <option value="Healthy / Control Group">Healthy / Control Group</option>
                  <option value="Asthma">Asthma</option>
                  <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                  <option value="Hypertension">Hypertension</option>
                  <option value="Autoimmune Condition">Autoimmune Condition</option>
                </select>
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-sm disabled:opacity-50 mt-2">
                {isSubmitting ? "Writing Block..." : "Finalize Registry"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}