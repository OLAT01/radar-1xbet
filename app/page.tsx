"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, BarChart2 } from "lucide-react";

// Liste élargie pour ne plus avoir de tableaux vides
const ELITE_BUTS = [
  39, 40, 41, 61, 140, 141, 78, 79, 135, 88, 94, 253, 2, 3, 1, 4, 5, // Élite Europe
  9, 10, 11, 12, 13, 14, 20, 21, 22, 23, 24, 30, 31, 32, 33, 34,    // Amériques & Asie
  62, 63, 65, 66, 71, 72, 81, 136, 142, 144, 179, 180, 203, 204     // Divisions 2 & Coupes
];

export default function ProBetV16_7() {
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
    const ts = Date.now();
    const headers = { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" };

    try {
      // 1. Fetch LIVE (Radars) - Priorité absolue
      const resLive = await fetch(`https://v3.football.api-sports.io/fixtures?live=all&v=${ts}`, { headers });
      const dataLive = await resLive.json();
      const live = dataLive.response || [];

      setRadarHisto(live.filter((m: any) => m.fixture.status.elapsed >= 15 && m.fixture.status.elapsed <= 42 && (m.goals.home + m.goals.away) >= 1).slice(0, 10));
      setRadarDanger(live.filter((m: any) => m.fixture.status.elapsed >= 45 && m.fixture.status.elapsed < 88).slice(0, 10));

      // 2. Fetch TODAY (Sauveur & Coupon)
      if (section === 'sauveur' || section === 'coupon' || section === 'all') {
        const today = new Date().toISOString().split('T')[0];
        const resDay = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako&v=${ts}`, { headers });
        const dataDay = await resDay.json();
        const all = dataDay.response || [];
        const filtered = all.filter((m: any) => ELITE_BUTS.includes(m.league.id) && m.fixture.status.short === "NS");
        
        setLeSauveur(filtered.slice(0, 3));
        setSingleCoupon(filtered.slice(4, 8));
      }
    } catch (e) { console.error("Error"); }
    setLoading(null);
  };

  useEffect(() => { forceFetch('all'); }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase font-bold tracking-tighter">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2 text-red-600"><Target /><span className="text-lg italic">PROBET V16.7 GOLD</span></div>
        <button onClick={() => forceFetch('all')} className="p-2 bg-red-600/10 rounded-full border border-red-600/20">
          <RefreshCw className={loading === 'all' ? "animate-spin text-red-600" : "text-red-600"} size={20} />
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* LE SAUVEUR */}
        <section className="space-y-3">
          <h3 className="text-red-600 text-[10px] flex items-center gap-2 px-1"><ShieldCheck size={14}/> LE SAUVEUR (ELITE)</h3>
          {leSauveur.length > 0 ? leSauveur.map((m, i) => {
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
          }) : <div className="p-4 text-center text-slate-700 text-[10px] italic bg-[#11192e] rounded-xl">RECHERCHE...</div>}
        </section>

        {/* RADAR HISTORIQUE */}
        <section className="bg-sky-600/5 border border-sky-600/20 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-sky-600/10 p-3 text-sky-400 text-[9px] flex justify-between items-center">
             <div className="flex items-center gap-2"><Clock size={14}/> RADAR HISTORIQUE (15'-42')</div>
             <button onClick={() => forceFetch('histo')}><RefreshCw size={12} className={loading === 'histo' ? "animate-spin" : ""}/></button>
          </div>
          <div className="divide-y divide-slate-800">
            {radarHisto.length > 0 ? radarHisto.map((m, i) => (
              <div key={i} className="p-3 flex justify-between items-center text-[11px] text-white bg-[#11192e]/20 font-black">
                <span className="truncate max-w-[150px]">{m.teams.home.name}-{m.teams.away.name}</span>
                <span className="text-yellow-500">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
              </div>
            )) : <div className="p-4 text-center text-slate-700 text-[9px] italic">AUCUN MATCH LIVE (15'-42')</div>}
          </div>
        </section>

        {/* RADAR DANGER */}
        <section className="bg-orange-600/5 border border-orange-600/20 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-orange-600/10 p-3 text-orange-400 text-[9px] flex justify-between items-center font-black">
            <div className="flex items-center gap-2"><Flame size={14}/> RADAR DANGER (MAX 88')</div>
            <button onClick={() => forceFetch('danger')}><RefreshCw size={12} className={loading === 'danger' ? "animate-spin" : ""}/></button>
          </div>
          {radarDanger.length > 0 ? radarDanger.map((m, i) => (
            <div key={i} className="p-4 border-b border-slate-800 flex flex-col gap-2 bg-[#11192e]/30 text-white last:border-0 font-black">
              <div className="flex justify-between items-center text-[11px] font-black">
                <span>{m.teams.home.name} - {m.teams.away.name}</span>
                <span className="text-orange-500 text-[14px]">{m.goals.home} - {m.goals.away}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 italic">SCORE LIVE</span>
                <span className="text-orange-500 animate-pulse">{m.fixture.status.elapsed}'</span>
              </div>
            </div>
          )) : <div className="p-4 text-center text-slate-700 text-[9px] italic">AUCUN MATCH LIVE (45'-88')</div>}
        </section>
      </main>
    </div>
  );
}