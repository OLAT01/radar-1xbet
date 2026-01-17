"use client";
import React, { useState, useEffect } from 'react';
import { RefreshCw, Target, Activity } from "lucide-react";

export default function RadarExpertLive() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // Pour voir l'erreur réelle

  const API_KEY = '7457ba7f869c23967e70d6f9edce7099';

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
        headers: { 
          'x-rapidapi-key': API_KEY, 
          'x-rapidapi-host': 'v3.football.api-sports.io' 
        }
      });
      
      const data = await res.json();

      // Vérification si l'API renvoie une erreur de quota
      if (data.errors && Object.keys(data.errors).length > 0) {
        setErrorMsg("Quota API dépassé (100/jour). Attends demain !");
        return;
      }

      if (data.response && data.response.length > 0) {
        const analyzed = data.response
          .filter((m: any) => m.league.country !== "Sudan") // Filtre Soudan
          .map((m: any) => ({
              id: m.fixture.id,
              status: m.fixture.status.short,
              elapsed: m.fixture.status.elapsed || 0,
              time: new Date(m.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              home: m.teams.home.name,
              away: m.teams.away.name,
              league: m.league.name,
              probability: 70 + (m.fixture.id % 25)
          }))
          .slice(0, 20); // Affiche les 20 premiers pour tester

        setMatches(analyzed);
      } else {
        setErrorMsg("Aucun match trouvé pour aujourd'hui.");
      }
    } catch (err) {
      setErrorMsg("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-4 text-white">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-yellow-400 italic">1X-RADAR LIVE</h1>
          <button onClick={fetchData} className="p-2 bg-white/10 rounded-full">
            <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500 p-4 rounded-xl text-red-200 text-sm mb-4">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          {matches.map((m: any) => (
            <div key={m.id} className="bg-white/5 p-4 rounded-xl border-l-4 border-yellow-500">
               <div className="flex justify-between">
                 <span className="text-[10px] text-gray-400 uppercase">{m.league}</span>
                 <span className="text-yellow-500 font-bold">{m.status === "1H" ? `${m.elapsed}'` : m.time}</span>
               </div>
               <div className="font-bold">{m.home} vs {m.away}</div>
               <div className="text-right text-xs text-gray-400">Probabilité: {m.probability}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}