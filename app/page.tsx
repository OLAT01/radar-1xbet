"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, BarChart2 } from "lucide-react";

const ELITE_BUTS = [39, 40, 41, 61, 140, 141, 78, 79, 135, 88, 94, 253, 2, 3, 1];

export default function ProBetV16_2() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHisto, setRadarHisto] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const getLogic = (m: any) => {
    const away = m.teams.away.name.toLowerCase();
    const home = m.teams.home.name.toLowerCase();
    const giants = ["liverpool", "city", "real", "bayern", "psg", "arsenal", "barca", "inter", "milan", "leverkusen"];
    if (giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) return { dc: "2X", col: "#60a5fa", border: "border-blue-500" };
    if (!giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) return { dc: "12", col: "#fbbf24", border: "border-yellow-500" };
    return { dc: "1X", col: "#4ade80", border: "border-green-500" };
  };

  const forceFetch = async (section: string) => {
    setLoading(section);
    // On vide la section pour prouver le rafraîchissement
    if(section === 'sauveur') setLeSauveur([]);
    if(section === 'coupon') setSingleCoupon([]);
    if(section === 'histo') setRadarHisto([]);
    if(section === 'danger') setRadarDanger([]);

    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" },
        cache: 'no-store' // Force l'API à donner du frais
      });
      const data = await resp.json();
      const all = data.response || [];

      if (section === 'sauveur' || section === 'all') 
        setLeSauveur(all.filter((m: any) => ELITE_BUTS.includes(m.league.id) && m.fixture.status.short === "NS").slice(0, 2));
      
      if (section === 'coupon' || section === 'all') 
        setSingleCoupon(all.filter((m: any) => ELITE_BUTS.includes(m.league.id) && m.fixture.status.short === "NS").slice(3, 6));
      
      if (section === 'histo' || section === 'all') 
        setRadarHisto(all.filter((m: any) => m.fixture.status.elapsed >= 15 && m.fixture.status.elapsed <= 42 && (m.goals.home + m.goals.away) >= 1).slice(0, 6));
      
      if (section === 'danger' || section === 'all') 
        // Filtre Danger : Matchs en 2ème mi-temps (pression but tardif)
        setRadarDanger(all.filter((m: any) => m.fixture.status.short === "2H" || (m.fixture.status.elapsed >= 45)).slice(0, 5));
        
    } catch (e) { console.error("Erreur Refresh"); }
    setLoading(null);
  };

  useEffect(() => { forceFetch('all'); }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase font-bold tracking-tighter">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2 text-red-600"><Target /><span className="text-lg italic tracking-tighter">PROBET V16.2 GOLD</span></div>
        <button onClick={() => forceFetch('all')} className="p-2 bg-red-600/10 rounded-full border border-red-600/20 active:scale-95 transition-transform">
          <RefreshCw className={loading === 'all' ? "animate-spin text-red-600" : "text-red-600"} size={20} />
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-red-600 text-[10px] flex items-center gap-2"><ShieldCheck size={14}/> LE SAUVEUR (ELITE)</h3>
            <button onClick={() => forceFetch('sauveur')} className="active:rotate-180 transition-all"><RefreshCw size={14} className={loading === 'sauveur' ? "animate-spin text-red-500" : ""}/></button>
          </div>
          {leSauveur.map((m, i) => {
            const op = getLogic(m);
            return (
              <div key={i} className={`bg-[#11192e] border-t-4 ${op.border} p-4 rounded-xl shadow-xl`}>
                <div className="flex justify-between text-[11px] mb-3"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="bg-white/5 p-3 rounded text-center text-[11px] mb-3" style={{color: op.col}}>{op.dc} & +1.5 BUTS</div>
                <div className="grid grid-cols-2 gap-2 text-[9px] text-center italic">
                  <div className="bg-blue-600/10 p-2 rounded text-blue-400">+7.5 CORNERS</div>
                  <div className="bg-yellow-600/10 p-2 rounded text-yellow-500">+2.5 CARTONS</div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="bg-[#11192e] p-5 rounded-3xl border border-slate-800">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-slate-500 text-[10px] italic">COUPON {new Date().toLocaleDateString()}</h3>
            <button onClick={() => forceFetch('coupon')}><RefreshCw size={14} className={loading === 'coupon' ? "animate-spin text-slate-500" : ""}/></button>
          </div>
          <div className="space-y-4 text-white">
            {singleCoupon.map((m, i) => {
              const op = getLogic(m);
              return (
                <div key={i} className="border-l-2 pl-3" style={{borderColor: op.col}}>
                  <div className="flex justify-between text-[10px] font-black"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                  <div className="text-[9px] font-bold" style={{color: op.col}}>{op.dc} & +1.5 BUTS</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-sky-600/5 border border-sky-600/20 rounded-xl overflow-hidden shadow-xl text-white">
          <div className="bg-sky-600/10 p-3 flex justify-between items-center text-sky-400 text-[9px]">
            <div className="flex items-center gap-2"><Clock size={14}/> RADAR HISTORIQUE (15'-42' / +BUT)</div>
            <button onClick={() => forceFetch('histo')}><RefreshCw size={12} className={loading === 'histo' ? "animate-spin text-sky-400" : ""}/></button>
          </div>
          <div className="divide-y divide-slate-800 font-black">
            {radarHisto.map((m, i) => (
              <div key={i} className="p-3 flex justify-between items-center text-[11px] bg-[#11192e]/20">
                <span className="truncate max-w-[150px]">{m.teams.home.name}-{m.teams.away.name}</span>
                <span className="text-yellow-500">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-orange-600/5 border border-orange-600/20 rounded-xl overflow-hidden shadow-xl text-white">
          <div className="bg-orange-600/10 p-3 flex justify-between items-center text-orange-400 text-[9px]">
            <div className="flex items-center gap-2"><Flame size={14}/> SIGNAL PRESSION DANGER (SCORE LIVE)</div>
            <button onClick={() => forceFetch('danger')}><RefreshCw size={12} className={loading === 'danger' ? "animate-spin text-orange-400" : ""}/></button>
          </div>
          {radarDanger.map((m, i) => (
            <div key={i} className="p-4 border-b border-slate-800 flex flex-col gap-2 bg-[#11192e]/30 last:border-0">
              <div className="flex justify-between items-center text-[11px] font-black">
                <span className="truncate max-w-[160px]">{m.teams.home.name} - {m.teams.away.name}</span>
                <span className="text-orange-500 text-[14px]">{m.goals.home} - {m.goals.away}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 italic">Objectif: Over Buts 2ème Mi-temps</span>
                <div className="flex items-center gap-2 text-orange-500 text-[11px]">
                  <span className="animate-pulse">{m.fixture.status.elapsed}'</span>
                  <BarChart2 size={12} className="animate-bounce" />
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}