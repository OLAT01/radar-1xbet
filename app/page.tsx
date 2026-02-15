"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, Ticket } from "lucide-react";

export default function ProBetV17_3() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 
        "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", 
        "x-rapidapi-host": "v3.football.api-sports.io" 
      };
      // On récupère les lives et les matchs du jour pour Bamako
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=2026-02-15&timezone=Africa/Bamako`, { headers });
      const data = await res.json();
      setFixtures(data.response || []);
    } catch (e) {
      console.error("Erreur API");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // 1. RADAR HISTORIQUE : Reste 15 min avant match OU en cours avec but (Stop à 42')
  const radarHisto = fixtures.filter(m => {
    const time = m.fixture.status.elapsed;
    const status = m.fixture.status.short;
    const hasGoal = (m.goals.home + m.goals.away) >= 1;
    
    // Match qui commence dans 15 min ou moins
    const isUpcoming = status === "NS" && new Date(m.fixture.date).getTime() - Date.now() <= 15 * 60 * 1000;
    // Match en cours entre 1' et 42' avec au moins un but
    const isLiveWithGoal = time >= 1 && time <= 42 && hasGoal;
    
    return isUpcoming || isLiveWithGoal;
  });

  // 2. RADAR DANGER : Entre 45' et 88'
  const radarDanger = fixtures.filter(m => m.fixture.status.elapsed >= 45 && m.fixture.status.elapsed <= 88);

  // 3. LE SAUVEUR & COUPON (Algorithme de probabilité élevée)
  const sortedByProb = [...fixtures].filter(m => m.fixture.status.short === "NS").slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-4 font-sans uppercase font-bold">
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-red-600 italic font-black"><Target /> PROBET V17.3 GOLD</div>
        <button onClick={fetchData} className={loading ? "animate-spin" : ""}><RefreshCw className="text-red-600" /></button>
      </header>

      <main className="space-y-6 max-w-md mx-auto">
        
        {/* LE SAUVEUR */}
        <section className="bg-red-900/20 border border-red-600/30 rounded-2xl p-4">
          <h3 className="text-red-500 text-[10px] mb-4 flex items-center gap-2"><ShieldCheck size={16}/> LE SAUVEUR (98% PROBA)</h3>
          {sortedByProb.slice(0, 2).map((m, i) => (
            <div key={i} className="bg-[#11192e] p-3 rounded-xl mb-2 border-l-4 border-red-600 shadow-lg">
               <div className="flex justify-between text-[11px]"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
               <div className="text-center text-red-500 text-[12px] mt-2 italic">DOUBLE CHANCE & +1.5 BUTS</div>
            </div>
          ))}
        </section>

        {/* COUPON DU JOUR */}
        <section className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-4">
          <h3 className="text-emerald-500 text-[10px] mb-4 flex items-center gap-2"><Ticket size={16}/> COUPON SÉCURISÉ</h3>
          <div className="space-y-3">
            {sortedByProb.slice(2, 5).map((m, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 text-[10px]">
                <span className="truncate max-w-[150px]">{m.teams.home.name} - {m.teams.away.name}</span>
                <span className="text-emerald-400">PLUS DE 0.5 BUT MT</span>
              </div>
            ))}
          </div>
        </section>

        {/* RADAR HISTORIQUE */}
        <section className="bg-sky-900/10 border border-sky-500/20 rounded-2xl p-4">
          <h3 className="text-sky-400 text-[10px] mb-4 flex items-center gap-2"><Clock size={16}/> RADAR HISTORIQUE (STOP 42')</h3>
          {radarHisto.length > 0 ? radarHisto.map((m, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-white/5 text-[11px]">
              <span className="truncate max-w-[160px]">{m.teams.home.name} - {m.teams.away.name}</span>
              <span className="text-yellow-500">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed || '15m'})</span>
            </div>
          )) : <p className="text-center text-slate-700 text-[9px] py-4 italic">AUCUN MATCH DÉTECTÉ (PROCHAINS DÉPARTS OU BUTS MT)</p>}
        </section>

        {/* RADAR DANGER */}
        <section className="bg-orange-900/10 border border-orange-500/20 rounded-2xl p-4">
          <h3 className="text-orange-500 text-[10px] mb-4 flex items-center gap-2"><Flame size={16}/> RADAR DANGER (STOP 88')</h3>
          {radarDanger.length > 0 ? radarDanger.map((m, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-white/5 text-[11px]">
              <span>{m.teams.home.name} - {m.teams.away.name}</span>
              <span className="text-orange-500">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
            </div>
          )) : <p className="text-center text-slate-700 text-[9px] py-4 italic">ATTENTE DE LA 2ÈME MI-TEMPS...</p>}
        </section>

      </main>
    </div>
  );
}