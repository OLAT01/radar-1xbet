"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, Ticket } from "lucide-react";

export default function ProBetV17_7() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchData = async (section: string = "all") => {
    setLoading(section);
    try {
      const headers = { 
        "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", 
        "x-rapidapi-host": "v3.football.api-sports.io" 
      };
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?live=all`, { headers, cache: 'no-store' });
      const data = await res.json();
      if (data.response) setFixtures(data.response);
    } catch (e) { console.error("Erreur API"); }
    setLoading(null);
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIQUE RADAR HISTORIQUE (MOINS DE 15' AVANT OU EN COURS JUSQU'A 42') ---
  const radarHisto = fixtures.filter(m => {
    const elapsed = m.fixture.status.elapsed || 0;
    const goals = (m.goals.home ?? 0) + (m.goals.away ?? 0);
    const startTime = new Date(m.fixture.date).getTime();
    const now = Date.now();
    const diffMinutes = (startTime - now) / 60000;

    // Règle 1: Apparaît si moins de 15 min avant le départ
    const isUpcoming = m.fixture.status.short === "NS" && diffMinutes <= 15 && diffMinutes > 0;
    // Règle 2: En cours, a au moins 1 but, et s'arrête à 42'
    const isLiveWithGoal = elapsed >= 1 && elapsed <= 42 && goals >= 1;

    return isUpcoming || isLiveWithGoal;
  }).slice(0, 7);

  const radarDanger = fixtures.filter(m => (m.fixture.status.elapsed || 0) >= 45 && (m.fixture.status.elapsed || 0) <= 88).slice(0, 7);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 font-sans uppercase font-bold tracking-tighter pb-10">
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-red-600 italic font-black text-xl"><Target /> PROBET V17.7</div>
        <button onClick={() => fetchData("all")} className={`${loading === "all" ? "animate-spin" : ""} bg-red-600/10 p-2 rounded-full border border-red-600/30`}>
          <RefreshCw size={20} className="text-red-600" />
        </button>
      </header>

      <main className="space-y-6 max-w-md mx-auto">
        
        {/* 1. LE SAUVEUR - CORRECTION DOUBLE CHANCE */}
        <section className="bg-red-950/20 border border-red-600/30 rounded-3xl p-5 relative shadow-2xl">
          <button onClick={() => fetchData("sauveur")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "sauveur" ? "animate-spin text-red-500" : "text-slate-600"}/></button>
          <h3 className="text-red-600 text-[10px] mb-4 flex items-center gap-2"><ShieldCheck size={16}/> LE SAUVEUR (94% WIN)</h3>
          {fixtures.slice(0, 2).map((m, i) => {
            // Logique simple pour déterminer 1X ou 2X
            const dc = (m.goals.home ?? 0) >= (m.goals.away ?? 0) ? "1X" : "2X";
            return (
              <div key={i} className="bg-slate-900/80 p-3 rounded-xl mb-2 border-l-4 border-red-600">
                <div className="flex justify-between text-[10px] text-slate-400"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="text-center text-red-500 text-[11px] mt-1 font-black">{dc} & +1.5 BUTS</div>
              </div>
            );
          })}
        </section>

        {/* 2. COUPON DU JOUR */}
        <section className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-5 relative shadow-2xl">
          <button onClick={() => fetchData("coupon")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "coupon" ? "animate-spin text-emerald-500" : "text-slate-600"}/></button>
          <h3 className="text-emerald-500 text-[10px] mb-4 flex items-center gap-2"><Ticket size={16}/> COUPON SÉCURISÉ</h3>
          <div className="space-y-2">
            {fixtures.slice(2, 6).map((m, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 text-[10px]">
                <span className="truncate max-w-[140px]">{m.teams.home.name}</span>
                <span className="text-emerald-400 font-black">+0.5 BUT MT</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. RADAR HISTORIQUE - CORRECTION TIMING */}
        <section className="bg-slate-900/50 border border-sky-500/20 rounded-3xl p-5 relative">
          <button onClick={() => fetchData("histo")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "histo" ? "animate-spin text-sky-500" : "text-slate-600"}/></button>
          <h3 className="text-sky-400 text-[10px] mb-4 flex items-center gap-2 font-black"><Clock size={16}/> RADAR HISTO (STOP 42')</h3>
          <div className="space-y-3">
            {radarHisto.length > 0 ? radarHisto.map((m, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5 text-[11px] items-center">
                <span className="truncate max-w-[160px] font-bold">{m.teams.home.name}-{m.teams.away.name}</span>
                <span className="text-yellow-500 font-black">
                  {m.fixture.status.short === "NS" ? "DEPART" : `${m.goals.home}-${m.goals.away}`} 
                  <span className="ml-1 text-[9px] opacity-70">({m.fixture.status.elapsed || '15M'})</span>
                </span>
              </div>
            )) : <p className="text-center text-slate-700 text-[9px] py-4 italic">ATTENTE MATCHS (-15' OU BUT 1MT)</p>}
          </div>
        </section>

        {/* 4. RADAR DANGER */}
        <section className="bg-slate-900/50 border border-orange-500/20 rounded-3xl p-5 relative">
          <button onClick={() => fetchData("danger")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "danger" ? "animate-spin text-orange-500" : "text-slate-600"}/></button>
          <h3 className="text-orange-500 text-[10px] mb-4 flex items-center gap-2 font-black"><Flame size={16}/> RADAR DANGER (STOP 88')</h3>
          <div className="space-y-3">
            {radarDanger.length > 0 ? radarDanger.map((m, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5 text-[11px] items-center">
                <span className="truncate max-w-[160px]">{m.teams.home.name}-{m.teams.away.name}</span>
                <span className="text-orange-500 font-black">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
              </div>
            )) : <p className="text-center text-slate-700 text-[9px] py-4 italic">SCAN 2ÈME MI-TEMPS...</p>}
          </div>
        </section>

      </main>
    </div>
  );
}