"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target } from "lucide-react";

export default function ProBetV16_9() {
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
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const radarHisto = fixtures.filter(m => m.fixture.status.elapsed >= 15 && m.fixture.status.elapsed <= 42 && (m.goals.home + m.goals.away) >= 1);
  const radarDanger = fixtures.filter(m => m.fixture.status.elapsed >= 45 && m.fixture.status.elapsed <= 88);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-4 font-sans uppercase font-bold italic">
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-red-600"><Target /> PROBET V16.9 GOLD</div>
        <button onClick={fetchData} className={loading ? "animate-spin" : ""}><RefreshCw /></button>
      </header>

      <main className="space-y-6">
        <section className="bg-[#11192e] border border-sky-900 rounded-xl p-4">
          <h3 className="text-sky-400 text-xs mb-3 flex items-center gap-2"><Clock size={16}/> RADAR HISTORIQUE (15-42')</h3>
          {radarHisto.length > 0 ? radarHisto.map((m, i) => (
            <div key={i} className="flex justify-between border-b border-slate-800 py-2 text-sm">
              <span>{m.teams.home.name} - {m.teams.away.name}</span>
              <span className="text-yellow-500">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
            </div>
          )) : <p className="text-slate-600 text-xs text-center py-4 font-normal">AUCUN MATCH DANS CETTE ZONE</p>}
        </section>

        <section className="bg-[#11192e] border border-orange-900 rounded-xl p-4">
          <h3 className="text-orange-500 text-xs mb-3 flex items-center gap-2"><Flame size={16}/> RADAR DANGER (45-88')</h3>
          {radarDanger.length > 0 ? radarDanger.map((m, i) => (
            <div key={i} className="flex justify-between border-b border-slate-800 py-2 text-sm">
              <span>{m.teams.home.name} - {m.teams.away.name}</span>
              <span className="text-orange-500">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
            </div>
          )) : <p className="text-slate-600 text-xs text-center py-4 font-normal">RECHERCHE DE MATCHS EN DIRECT...</p>}
        </section>
      </main>
    </div>
  );
}