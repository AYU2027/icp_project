import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createActor } from "declarations/health_exchange_backend";

export default function ResearcherDashboard({ principal, authClient, setIsLoggedIn }) {
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [requestingId, setRequestingId] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const [fullProfileView, setFullProfileView] = useState(null);
  const [isViewing, setIsViewing] = useState(false);

  const getAuthenticatedBackend = async () => {
    const identity = authClient.getIdentity();
    const LIVE_CANISTER_ID = "zydb5-siaaa-aaaab-qacba-cai";

    return createActor(LIVE_CANISTER_ID, {
      agentOptions: {
        identity: identity,
        host: "https://icp-api.io", 
      },
    });
  };

  useEffect(() => {
    const fetchAnonymizedData = async () => {
      try {
        const backend = await getAuthenticatedBackend();
        const result = await backend.get_all_patients_anonymized();
        setPatients(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnonymizedData();
  }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const backend = await getAuthenticatedBackend();
      const result = await backend.request_access(requestingId, requestMessage);
      
      if (result.Err) {
        alert("Failed to send request: " + result.Err);
      } else {
        alert("Data request sent securely to the patient!");
        setRequestingId(null);
        setRequestMessage("");
      }
    } catch (error) {
      console.error("Error sending request:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleViewFullData = async (patientId) => {
    setIsViewing(true);
    try {
      const backend = await getAuthenticatedBackend();
      const result = await backend.get_full_patient_data(patientId);
      
      if (result.Err) {
        alert("Access Denied: " + result.Err);
      } else if (result.Ok) {
        setFullProfileView(result.Ok);
      }
    } catch (error) {
      console.error("Error fetching full data:", error);
    } finally {
      setIsViewing(false);
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
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Researcher Portal</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">Explore anonymized global health data and request study access.</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors border border-red-500/20">
            Secure Logout
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-neutral-500 animate-pulse font-medium">Scanning blockchain for health data...</div>
        ) : (
          <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-neutral-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Global Anonymized Patient Registry</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-300 dark:border-zinc-700 text-neutral-500 dark:text-neutral-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Patient ID (Anonymous)</th>
                    <th className="p-4 font-semibold">Age</th>
                    <th className="p-4 font-semibold">Known Diseases</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-neutral-500 italic">No patient data available on the network yet.</td>
                    </tr>
                  ) : (
                    patients.map((patient, index) => (
                      <tr key={index} className="border-b border-neutral-200 dark:border-zinc-700/50 hover:bg-white/40 dark:hover:bg-zinc-700/30 transition-colors">
                        <td className="p-4 text-sm font-mono text-blue-600 dark:text-teal-400 break-all">{patient.name}</td>
                        <td className="p-4 text-neutral-800 dark:text-neutral-200">{patient.age}</td>
                        <td className="p-4 text-neutral-800 dark:text-neutral-200">{patient.diseases}</td>
                        
                        <td className="p-4 text-right flex gap-2 justify-end">
                          <button 
                            onClick={() => setRequestingId(patient.name)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition shadow-sm"
                          >
                            Request
                          </button>
                          <button 
                            onClick={() => handleViewFullData(patient.name)}
                            disabled={isViewing}
                            className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition shadow-sm disabled:opacity-50"
                          >
                            View Data
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Floating Request Modal */}
        {requestingId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-neutral-200 dark:border-zinc-700">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Request Data Access</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                Send a secure message to Patient <code className="text-xs text-teal-500 bg-teal-500/10 px-1 rounded">{requestingId.substring(0,8)}...</code>
              </p>
              
              <form onSubmit={handleSendRequest} className="space-y-4">
                <textarea 
                  required
                  rows="3"
                  placeholder="Explain why you need this data for your research..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-50 dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none text-sm"
                />
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setRequestingId(null)}
                    className="flex-1 py-3 bg-neutral-200 hover:bg-neutral-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-neutral-800 dark:text-white rounded-lg font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isSending}
                    type="submit" 
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                  >
                    {isSending ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Floating Full Profile View Modal */}
        {fullProfileView && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl max-w-lg w-full border border-teal-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">Full Medical Record</h3>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Access Verified</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="bg-neutral-50 dark:bg-zinc-900 p-4 rounded-lg border border-neutral-200 dark:border-zinc-700">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Decrypted Name</p>
                  <p className="text-xl font-medium text-neutral-800 dark:text-neutral-200">{fullProfileView.name}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-neutral-50 dark:bg-zinc-900 p-4 rounded-lg border border-neutral-200 dark:border-zinc-700">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Age</p>
                    <p className="text-xl font-medium text-neutral-800 dark:text-neutral-200">{fullProfileView.age}</p>
                  </div>
                  <div className="flex-1 bg-neutral-50 dark:bg-zinc-900 p-4 rounded-lg border border-neutral-200 dark:border-zinc-700">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Known Diseases</p>
                    <p className="text-xl font-medium text-neutral-800 dark:text-neutral-200">{fullProfileView.diseases}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setFullProfileView(null)}
                className="w-full py-3 bg-neutral-200 hover:bg-neutral-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-neutral-800 dark:text-white rounded-lg font-bold transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}