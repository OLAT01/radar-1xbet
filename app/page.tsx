"use client";

import React, { useState, useEffect } from "react";
import { Clock, Flame, RefreshCw, Target } from "lucide-react";

export default function ProBetV17_1() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 
        "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", 
        "x-rapidapi-host": "v3.football.api-sports.io" 
      };
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?live=all&v=${Date.now()}`, { headers });
      const data = await res.json();
      setFixtures(data.response || []);
    } catch (e) {
      console.error("Erreur API");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // FILTRES
  const radarHisto = fixtures.filter(m => m.fixture.status.elapsed >= 15 && m.fixture.status.elapsed <= 42 && (m.goals.home + m.goals.away) >= 1);
  const radarDanger = fixtures.filter(m => m.fixture.status.elapsed >= 45 && m.fixture.status.elapsed <= 88);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-4 font-sans uppercase font-bold tracking-tight">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-red-600 italic"><Target /> PROBET V17.1</div>
        <button onClick={fetchData} className={loading ? "animate-spin" : ""}><RefreshCw className="text-red-600" /></button>
      </header>

      <main className="space-y-6">
        {/* RADAR HISTORIQUE */}
        <section className="bg-[#11192e] border border-sky-500/20 rounded-xl p-4">
          <h3 className="text-sky-400 text-[10px] mb-3 flex items-center gap-2 font-black"><Clock size={14}/> RADAR HISTORIQUE (15-42' +BUT)</h3>
          {radarHisto.length > 0 ? radarHisto.map((m, i) => (
            <div key={i} className="flex justify-between border-b border-white/5 py-2 text-[11px]">
              <span className="truncate max-w-[150px]">{m.teams.home.name}-{m.teams.away.name}</span>
              <span className="text-yellow-500 font-black">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
            </div>
          )) : (
            <div className="py-4">
              <p className="text-slate-600 text-[9px] text-center italic mb-2">AUCUN MATCH AVEC BUT (15-42')</p>
              {/* MODE SECOURS : Affiche quand même les matchs sans but pour tester */}
              <p className="text-slate-500 text-[8px] text-center border-t border-white/5 pt-2 uppercase">Matchs en cours (0-0) :</p>
              {fixtures.filter(m => m.fixture.status.elapsed < 45).slice(0, 3).map((m, i) => (
                <div key={i} className="flex justify-between text-[9px] text-slate-400 mt-1 opacity-50">
                   <span>{m.teams.home.name} - {m.teams.away.name}</span>
                   <span>{m.fixture.status.elapsed}'</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RADAR DANGER */}
        <section className="bg-[#11192e] border border-orange-500/20 rounded-xl p-4">
          <h3 className="text-orange-500 text-[10px] mb-3 flex items-center gap-2 font-black"><Flame size={14}/> RADAR DANGER (45-88')</h3>
          {radarDanger.length > 0 ? radarDanger.map((m, i) => (
            <div key={i} className="flex justify-between border-b border-white/5 py-2 text-[11px]">
              <span>{m.teams.home.name}-{m.teams.away.name}</span>
              <span className="text-orange-500 font-black">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
            </div>
          )) : (
            <div className="py-4 text-center">
               <p className="text-slate-600 text-[9px] italic mb-2">RECHERCHE DE 2ÈME MI-TEMPS...</p>
               {fixtures.filter(m => m.fixture.status.elapsed >= 45).slice(0, 3).map((m, i) => (
                <div key={i} className="flex justify-between text-[9px] text-slate-400 mt-1 opacity-50">
                   <span>{m.teams.home.name} - {m.teams.away.name}</span>
                   <span>{m.fixture.status.elapsed}'</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}