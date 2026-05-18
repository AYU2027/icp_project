import { useState } from 'react';
import { health_exchange_backend } from 'declarations/health_exchange_backend';

function App() {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');

  // This function calls your Rust Smart Contract!
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    
    // Calls the default 'greet' function in your Rust backend
    const result = await health_exchange_backend.greet(name);
    setGreeting(result);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-3xl font-extrabold text-teal-400 mb-6">
          ICP Health Vault
        </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name to test Rust..."
            className="px-4 py-3 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-teal-400"
          />
          <button 
            type="submit" 
            className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-4 py-3 rounded font-bold transition-colors"
          >
            Call Rust Backend
          </button>
        </form>

        {greeting && (
          <div className="mt-6 p-4 bg-slate-700 rounded-lg text-teal-300 font-medium text-lg border border-slate-600">
            {greeting}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;