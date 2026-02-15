"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, LayoutDashboard } from "lucide-react";

export default function ProBetV17_2() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 
        "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", 
        "x-rapidapi-host": "v3.football.api-sports.io" 
      };
      // On récupère tout pour être sûr d'avoir des données
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?live=all&v=${Date.now()}`, { headers });
      const data = await res.json();
      setFixtures(data.response || []);
    } catch (e) {
      console.error("Erreur API");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // FILTRES LOGIQUES
  const radarHisto = fixtures.filter(m => m.fixture.status.elapsed >= 15 && m.fixture.status.elapsed <= 42 && (m.goals.home + m.goals.away) >= 1);
  const radarDanger = fixtures.filter(m => m.fixture.status.elapsed >= 45 && m.fixture.status.elapsed <= 88);
  
  // Simulation Sauveur & Coupon (basée sur les lives importants ou à venir)
  const topMatches = fixtures.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-4 font-sans uppercase font-bold tracking-tight">
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-red-600 italic font-black"><Target /> PROBET V17.2 GOLD</div>
        <button onClick={fetchData} className={loading ? "animate-spin" : ""}><RefreshCw className="text-red-600" /></button>
      </header>

      <main className="space-y-6 max-w-md mx-auto">
        
        {/* SECTION SAUVEUR */}
        <section className="bg-red-600/5 border border-red-600/20 rounded-xl p-4 shadow-lg">
          <h3 className="text-red-600 text-[10px] mb-3 flex items-center gap-2 font-black"><ShieldCheck size={14}/> LE SAUVEUR (TOP PRÉVISIONS)</h3>
          {topMatches.length > 0 ? topMatches.slice(0, 2).map((m, i) => (
            <div key={i} className="bg-[#11192e] p-3 rounded-lg mb-2 border-l-4 border-red-600">
               <div className="flex justify-between text-[10px] mb-1"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
               <div className="text-center text-red-500 text-[11px]">1X & +1.5 BUTS</div>
            </div>
          )) : <p className="text-slate-700 text-[9px] text-center italic">CHARGEMENT...</p>}
        </section>

        {/* SECTION COUPON */}
        <section className="bg-[#11192e] border border-slate-800 rounded-xl p-4 shadow-xl">
          <h3 className="text-slate-500 text-[10px] mb-3 flex items-center gap-2 font-black"><LayoutDashboard size={14}/> COUPON DU JOUR</h3>
          <div className="space-y-2">
            {topMatches.slice(2, 5).map((m, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 text-[10px]">
                <span className="truncate max-w-[140px]">{m.teams.home.name} - {m.teams.away.name}</span>
                <span className="text-green-500">BUT +1.5</span>
              </div>
            ))}
          </div>
        </section>

        {/* RADAR HISTORIQUE */}
        <section className="bg-sky-600/5 border border-sky-600/20 rounded-xl p-4">
          <h3 className="text-sky-400 text-[10px] mb-3 flex items-center gap-2 font-black"><Clock size={14}/> RADAR HISTORIQUE (15-42' +BUT)</h3>
          {radarHisto.length > 0 ? radarHisto.map((m, i) => (
            <div key={i} className="flex justify-between border-b border-white/5 py-2 text-[11px]">
              <span className="truncate max-w-[150px]">{m.teams.home.name}-{m.teams.away.name}</span>
              <span className="text-yellow-500 font-black">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
            </div>
          )) : (
            <div className="py-2 text-center">
              <p className="text-slate-600 text-[9px] italic">AUCUNE OPPORTUNITÉ DÉTECTÉE (15-42')</p>
            </div>
          )}
        </section>

        {/* RADAR DANGER */}
        <section className="bg-orange-600/5 border border-orange-600/20 rounded-xl p-4">
          <h3 className="text-orange-500 text-[10px] mb-3 flex items-center gap-2 font-black"><Flame size={14}/> RADAR DANGER (45-88')</h3>
          {radarDanger.length > 0 ? radarDanger.map((m, i) => (
            <div key={i} className="flex justify-between border-b border-white/5 py-2 text-[11px]">
              <span className="truncate max-w-[150px]">{m.teams.home.name}-{m.teams.away.name}</span>
              <span className="text-orange-500 font-black">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
            </div>
          )) : (
            <p className="text-slate-600 text-[9px] text-center italic py-2">RECHERCHE DE 2ÈME MI-TEMPS...</p>
          )}
        </section>

      </main>
    </div>
  );
}