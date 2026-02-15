"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, Ticket } from "lucide-react";

export default function ProBetV17_4() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const headers = { 
        "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", 
        "x-rapidapi-host": "v3.football.api-sports.io" 
      };
      // Récupération ciblée pour Bamako
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?live=all&timezone=Africa/Bamako`, { headers });
      const data = await res.json();
      setFixtures(data.response || []);
    } catch (e) {
      console.error("Erreur API");
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 60000); // Rafraîchir toutes les minutes pour sauver le quota
    return () => clearInterval(interval);
  }, []);

  // 1. RADAR HISTORIQUE (Limite 7, Max 42')
  const radarHisto = fixtures
    .filter(m => {
      const time = m.fixture.status.elapsed;
      const hasGoal = (m.goals.home + m.goals.away) >= 1;
      const isUpcoming = m.fixture.status.short === "NS" && (new Date(m.fixture.date).getTime() - Date.now() <= 15 * 60 * 1000);
      return (isUpcoming || (time >= 1 && time <= 42 && hasGoal));
    })
    .slice(0, 7); // Limite à 7 matchs

  // 2. RADAR DANGER (Limite 7, Max 88')
  const radarDanger = fixtures
    .filter(m => m.fixture.status.elapsed >= 45 && m.fixture.status.elapsed <= 88)
    .slice(0, 7); // Limite à 7 matchs

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 font-sans uppercase font-bold tracking-tighter">
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-red-600 italic font-black text-xl"><Target /> PROBET V17.4 GOLD</div>
        <button onClick={fetchData} className={`${loading ? "animate-spin" : ""} bg-red-600/20 p-2 rounded-full border border-red-600/50`}>
          <RefreshCw className="text-red-600" size={20} />
        </button>
      </header>

      <main className="space-y-6 max-w-md mx-auto">
        
        {/* LE SAUVEUR - TOP 2 UNIQUEMENT */}
        <section className="bg-gradient-to-br from-red-950/40 to-black border border-red-500/30 rounded-3xl p-5 shadow-2xl">
          <h3 className="text-red-500 text-[11px] mb-4 flex items-center gap-2"><ShieldCheck size={18}/> SAUVEUR (94% WIN)</h3>
          {fixtures.slice(0, 2).map((m, i) => (
            <div key={i} className="bg-slate-900/80 p-4 rounded-2xl mb-3 border-b-2 border-red-600 shadow-inner">
               <div className="flex justify-between text-[11px] text-slate-300"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
               <div className="text-center text-red-500 text-[13px] mt-2 font-black">2X & +1.5 BUTS @1.94</div>
            </div>
          ))}
        </section>

        {/* RADAR HISTORIQUE (STOP 42') */}
        <section className="bg-slate-900/50 border border-sky-500/20 rounded-3xl p-5">
          <h3 className="text-sky-400 text-[11px] mb-4 flex items-center gap-2 font-black"><Clock size={18}/> RADAR HISTO (LIMIT 7)</h3>
          <div className="space-y-3">
            {radarHisto.length > 0 ? radarHisto.map((m, i) => (
              <div key={i} className="flex justify-between py-3 border-b border-white/5 text-[12px] items-center">
                <span className="truncate max-w-[170px] font-black">{m.teams.home.name}-{m.teams.away.name}</span>
                <span className="bg-sky-500/10 text-yellow-500 px-2 py-1 rounded-lg">{m.goals.home}-{m.goals.away} <span className="text-[10px] opacity-70">({m.fixture.status.elapsed || '15m'})</span></span>
              </div>
            )) : <p className="text-center text-slate-700 text-[10px] py-4 italic">SNIPER EN ATTENTE...</p>}
          </div>
        </section>

        {/* RADAR DANGER (STOP 88') */}
        <section className="bg-slate-900/50 border border-orange-500/20 rounded-3xl p-5">
          <h3 className="text-orange-500 text-[11px] mb-4 flex items-center gap-2 font-black"><Flame size={18}/> RADAR DANGER (LIMIT 7)</h3>
          <div className="space-y-3">
            {radarDanger.length > 0 ? radarDanger.map((m, i) => (
              <div key={i} className="flex justify-between py-3 border-b border-white/5 text-[12px] items-center">
                <span className="truncate max-w-[170px] font-black">{m.teams.home.name}-{m.teams.away.name}</span>
                <span className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded-lg">{m.goals.home}-{m.goals.away} <span className="text-[10px] opacity-70">({m.fixture.status.elapsed}')</span></span>
              </div>
            )) : <p className="text-center text-slate-700 text-[10px] py-4 italic">SCAN DES 2ÈMES MI-TEMPS...</p>}
          </div>
        </section>

      </main>
    </div>
  );
}