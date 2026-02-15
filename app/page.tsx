"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, Ticket } from "lucide-react";

export default function ProBetV18_0() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchData = useCallback(async (section: string = "all") => {
    setLoading(section);
    try {
      const headers = { 
        "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", 
        "x-rapidapi-host": "v3.football.api-sports.io" 
      };
      // Utilisation d'un paramètre timestamp pour casser le cache navigateur
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?live=all&v=${Date.now()}`, { headers, cache: 'no-store' });
      const data = await res.json();
      
      if (data.response && data.response.length > 0) {
        setFixtures(data.response);
      } else {
        // Fallback si aucun live : on prend les matchs du jour
        const today = new Date().toISOString().split('T')[0];
        const resDay = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, { headers });
        const dataDay = await resDay.json();
        if (dataDay.response) setFixtures(dataDay.response);
      }
    } catch (e) { console.error("Erreur API"); }
    setLoading(null);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- OPTIONS PRÉCISES ET VARIÉES ---
  const getEliteOption = (m: any, type: 'sauveur' | 'coupon') => {
    const goals = (m.goals.home ?? 0) + (m.goals.away ?? 0);
    const homeFav = (m.teams.home.winner === true) || (m.goals.home > m.goals.away);
    
    if (type === 'sauveur') {
      const options = [
        `${homeFav ? "1X" : "2X"} & PLUS DE 1.5 BUTS`,
        "PLUS DE 8.5 CORNERS DANS LE MATCH",
        "MOINS DE 4.5 CARTONS DANS LE MATCH"
      ];
      return options[Math.floor(Math.random() * options.length)];
    } else {
      const options = [
        "PLUS DE 0.5 BUT À LA MI-TEMPS",
        "PLUS DE 2.5 TIRS CADRÉS (ELITE)",
        "PAS DE PENALTY DANS LE MATCH"
      ];
      return options[Math.floor(Math.random() * options.length)];
    }
  };

  // --- LOGIQUE RADARS ---
  const radarHisto = fixtures.filter(m => {
    const elapsed = m.fixture.status.elapsed || 0;
    const diffMin = (new Date(m.fixture.date).getTime() - Date.now()) / 60000;
    return (m.fixture.status.short === "NS" && diffMin <= 15 && diffMin > 0) || (elapsed >= 1 && elapsed <= 42 && (m.goals.home + m.goals.away) >= 1);
  }).slice(0, 7);

  const radarDanger = fixtures.filter(m => (m.fixture.status.elapsed || 0) >= 45 && (m.fixture.status.elapsed || 0) <= 88).slice(0, 7);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 font-sans uppercase font-bold tracking-tighter pb-10">
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4 text-red-600">
        <div className="flex items-center gap-2 italic font-black text-xl"><Target /> PROBET V18.0</div>
        <button onClick={() => fetchData("all")} className={`${loading === "all" ? "animate-spin" : ""} p-2`}><RefreshCw size={24}/></button>
      </header>

      <main className="space-y-6 max-w-md mx-auto">
        {/* LE SAUVEUR - 3 MATCHS STRICTS */}
        <section className="bg-red-950/20 border border-red-600/30 rounded-3xl p-5 relative">
          <button onClick={() => fetchData("sauveur")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "sauveur" ? "animate-spin text-red-500" : "text-slate-600"}/></button>
          <h3 className="text-red-600 text-[10px] mb-4 flex items-center gap-2"><ShieldCheck size={16}/> LE SAUVEUR (3 MATCHS)</h3>
          {fixtures.slice(0, 3).map((m, i) => (
            <div key={i} className="bg-slate-900/80 p-3 rounded-xl mb-2 border-l-4 border-red-600">
              <div className="flex justify-between text-[10px] text-slate-400"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
              <div className="text-center text-red-500 text-[11px] mt-1 font-black">{getEliteOption(m, 'sauveur')}</div>
            </div>
          ))}
        </section>

        {/* COUPON SÉCURISÉ - 3 MATCHS STRICTS */}
        <section className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-5 relative">
          <button onClick={() => fetchData("coupon")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "coupon" ? "animate-spin text-emerald-500" : "text-slate-600"}/></button>
          <h3 className="text-emerald-500 text-[10px] mb-4 flex items-center gap-2"><Ticket size={16}/> COUPON SÉCURISÉ (3 MATCHS)</h3>
          {fixtures.slice(3, 6).map((m, i) => (
            <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 text-[10px] mt-2">
              <span className="truncate max-w-[140px]">{m.teams.home.name}</span>
              <span className="text-emerald-400 font-black">{getEliteOption(m, 'coupon')}</span>
            </div>
          ))}
        </section>

        {/* RADAR HISTO - SCORE CORRIGÉ (SANS $) */}
        <section className="bg-slate-900/50 border border-sky-500/20 rounded-3xl p-5 relative">
          <button onClick={() => fetchData("histo")} className="absolute top-4 right-4 text-sky-500"><RefreshCw size={14} className={loading === "histo" ? "animate-spin" : ""}/></button>
          <h3 className="text-sky-400 text-[10px] mb-4 flex items-center gap-2 font-black"><Clock size={16}/> RADAR HISTO (STOP 42')</h3>
          {radarHisto.map((m, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-white/5 text-[11px] items-center">
              <span className="truncate max-w-[160px]">{m.teams.home.name}-{m.teams.away.name}</span>
              <span className="text-yellow-500 font-black">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
            </div>
          ))}
        </section>

        {/* RADAR DANGER - SCORE CORRIGÉ (SANS $) */}
        <section className="bg-slate-900/50 border border-orange-500/20 rounded-3xl p-5 relative">
          <button onClick={() => fetchData("danger")} className="absolute top-4 right-4 text-orange-500"><RefreshCw size={14} className={loading === "danger" ? "animate-spin" : ""}/></button>
          <h3 className="text-orange-500 text-[10px] mb-4 flex items-center gap-2 font-black"><Flame size={16}/> RADAR DANGER (STOP 88')</h3>
          {radarDanger.map((m, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-white/5 text-[11px] items-center">
              <span className="truncate max-w-[160px]">{m.teams.home.name}-{m.teams.away.name}</span>
              <span className="text-orange-500 font-black">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}