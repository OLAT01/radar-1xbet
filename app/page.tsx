"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, BarChart2 } from "lucide-react";

const ELITE_BUTS = [39, 40, 41, 61, 140, 141, 78, 79, 135, 88, 94, 253, 2, 3, 1];

export default function ProBetV16_4() {
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
    const timestamp = new Date().getTime();
    const headers = { 
        "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", 
        "x-rapidapi-host": "v3.football.api-sports.io" 
    };

    try {
      // 1. Pour les Radars (LIVE uniquement - Très léger)
      if (section === 'histo' || section === 'danger' || section === 'all') {
        const resLive = await fetch(`https://v3.football.api-sports.io/fixtures?live=all&timezone=Africa/Bamako&v=${timestamp}`, { headers });
        const dataLive = await resLive.json();
        const liveMatches = dataLive.response || [];

        setRadarHisto(liveMatches.filter((m: any) => 
            m.fixture.status.elapsed >= 15 && 
            m.fixture.status.elapsed <= 42 && 
            (m.goals.home + m.goals.away) >= 1
        ).slice(0, 5));

        setRadarDanger(liveMatches.filter((m: any) => 
            m.fixture.status.elapsed >= 45 && 
            m.fixture.status.elapsed < 88
        ).slice(0, 5));
      }

      // 2. Pour les Coupons (Matchs à venir - Plus lourd)
      if (section === 'sauveur' || section === 'coupon' || section === 'all') {
        const today = new Date().toISOString().split('T')[0];
        const resDay = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako&v=${timestamp}`, { headers });
        const dataDay = await resDay.json();
        const dayMatches = dataDay.response || [];

        const elite = dayMatches.filter((m: any) => ELITE_BUTS.includes(m.league.id) && m.fixture.status.short === "NS");
        setLeSauveur(elite.slice(0, 2));
        setSingleCoupon(elite.slice(3, 6));
      }
    } catch (e) { console.error("Quota ou Connexion instable"); }
    setLoading(null);
  };

  useEffect(() => { forceFetch('all'); }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase font-bold tracking-tighter">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2 text-red-600"><Target /><span className="text-lg italic tracking-tighter">PROBET V16.4 GOLD</span></div>
        <button onClick={() => forceFetch('all')} className="p-2 bg-red-600/10 rounded-full border border-red-600/20">
          <RefreshCw className={loading === 'all' ? "animate-spin text-red-600" : "text-red-600"} size={20} />
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* LE SAUVEUR */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-red-600 text-[10px] flex items-center gap-2 font-black"><ShieldCheck size={14}/> LE SAUVEUR (ELITE)</h3>
            <button onClick={() => forceFetch('sauveur')}><RefreshCw size={14} className={loading === 'sauveur' ? "animate-spin text-red-500" : ""}/></button>
          </div>
          {leSauveur.length > 0 ? leSauveur.map((m, i) => {
            const op = getLogic(m);
            return (
              <div key={i} className={`bg-[#11192e] border-t-4 ${op.border} p-4 rounded-xl shadow-xl`}>
                <div className="flex justify-between text-[11px] mb-3 font-black"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="bg-white/5 p-3 rounded text-center text-[11px] mb-3 font-black" style={{color: op.col}}>{op.dc} & +1.5 BUTS</div>
                <div className="grid grid-cols-2 gap-2 text-[9px] text-center italic font-bold">
                  <div className="bg-blue-600/10 p-2 rounded text-blue-400">+7.5 CORNERS</div>
                  <div className="bg-yellow-600/10 p-2 rounded text-yellow-500">+2.5 CARTONS</div>
                </div>
              </div>
            );
          }) : <div className="p-4 text-center text-[10px] text-slate-600 italic">CHARGEMENT OU AUCUN MATCH ELITE...</div>}
        </section>

        {/* COUPON DU JOUR */}
        <section className="bg-[#11192e] p-5 rounded-3xl border border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-500 text-[10px] italic">COUPON {new Date().toLocaleDateString()}</h3>
            <button onClick={() => forceFetch('coupon')}><RefreshCw size={14} className={loading === 'coupon' ? "animate-spin text-slate-500" : ""}/></button>
          </div>
          <div className="space-y-4">
            {singleCoupon.map((m, i) => {
              const op = getLogic(m);
              return (
                <div key={i} className="border-l-2 pl-3" style={{borderColor: op.col}}>
                  <div className="flex justify-between text-[10px] font-black text-white"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                  <div className="text-[9px] font-black" style={{color: op.col}}>{op.dc} & +1.5 BUTS</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RADAR HISTORIQUE */}
        <section className="bg-sky-600/5 border border-sky-600/20 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-sky-600/10 p-3 flex justify-between items-center text-sky-400 text-[9px]">
            <div className="flex items-center gap-2 font-black"><Clock size={14}/> RADAR HISTORIQUE (15'-42')</div>
            <button onClick={() => forceFetch('histo')}><RefreshCw size={12} className={loading === 'histo' ? "animate-spin text-sky-400" : ""}/></button>
          </div>
          <div className="divide-y divide-slate-800 font-black">
            {radarHisto.map((m, i) => (
              <div key={i} className="p-3 flex justify-between items-center text-[11px] bg-[#11192e]/20 text-white font-black">
                <span className="truncate max-w-[150px]">{m.teams.home.name}-{m.teams.away.name}</span>
                <span className="text-yellow-500 font-black">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
              </div>
            ))}
          </div>
        </section>

        {/* RADAR DANGER */}
        <section className="bg-orange-600/5 border border-orange-600/20 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-orange-600/10 p-3 flex justify-between items-center text-orange-400 text-[9px]">
            <div className="flex items-center gap-2 font-black"><Flame size={14}/> RADAR DANGER (MAX 88')</div>
            <button onClick={() => forceFetch('danger')}><RefreshCw size={12} className={loading === 'danger' ? "animate-spin text-orange-400" : ""}/></button>
          </div>
          {radarDanger.length > 0 ? radarDanger.map((m, i) => (
            <div key={i} className="p-4 border-b border-slate-800 flex flex-col gap-2 bg-[#11192e]/30 last:border-0 text-white">
              <div className="flex justify-between items-center text-[11px] font-black">
                <span className="truncate max-w-[160px] font-black">{m.teams.home.name} - {m.teams.away.name}</span>
                <span className="text-orange-500 text-[14px] font-black">{m.goals.home} - {m.goals.away}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 italic font-black">SCORE LIVE - PRESSION BUT</span>
                <div className="flex items-center gap-2 text-orange-500 text-[11px] font-black">
                  <span className="animate-pulse">{m.fixture.status.elapsed}'</span>
                  <BarChart2 size={12} className="animate-bounce" />
                </div>
              </div>
            </div>
          )) : <div className="p-4 text-center text-slate-600 text-[9px] font-black italic">AUCUN MATCH EN DIRECT (45'-88')</div>}
        </section>
      </main>
    </div>
  );
}