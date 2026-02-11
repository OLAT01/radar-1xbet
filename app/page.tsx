"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, Zap, ChevronRight } from "lucide-react";

const ELITE_LEAGUES = [1, 2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203, 4, 9, 10, 13, 45, 137, 143];

export default function ProBetV15_7() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHisto, setRadarHisto] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const analyzeMatch = (m: any) => {
    const home = m.teams.home.name.toLowerCase();
    const away = m.teams.away.name.toLowerCase();
    const giants = ["liverpool", "city", "real", "bayern", "inter", "psg", "arsenal", "barca", "milan", "napoli", "leverkusen"];
    
    let res = { dc: "1X", col: "#4ade80", border: "border-green-500" }; 
    if (giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) {
        res = { dc: "2X", col: "#60a5fa", border: "border-blue-500" }; 
    } else if (!giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) {
        res = { dc: "12", col: "#fbbf24", border: "border-yellow-500" }; 
    }
    return res;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const all = data.response || [];
      const elite = all.filter((m: any) => ELITE_LEAGUES.includes(m.league.id));

      setLeSauveur(elite.filter(m => m.fixture.status.short === "NS").slice(0, 2));
      setSingleCoupon(elite.filter(m => m.fixture.status.short === "NS").slice(2, 5));
      setRadarHisto(all.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 5));
      setRadarDanger(all.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(5, 9));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2"><Target className="text-red-500" /><span className="font-black text-lg italic tracking-tighter">PROBET V15.7 FINAL</span></div>
        <button onClick={fetchData} className="p-2 bg-slate-800/50 rounded-full border border-slate-700"><RefreshCw className={loading ? "animate-spin" : ""} size={20} /></button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        {/* 1. LE SAUVEUR */}
        <section className="space-y-4">
          <h3 className="text-red-500 font-black text-[10px] tracking-widest flex items-center gap-2 px-1"><ShieldCheck size={16}/> ANALYSE DIRECTIONNELLE</h3>
          {leSauveur.map((m, i) => {
            const op = analyzeMatch(m);
            return (
              <div key={i} className={`bg-[#11192e] border-t-4 ${op.border} p-5 rounded-2xl shadow-xl`}>
                <div className="flex justify-between font-black text-[13px] mb-4"><span>{m.teams.home.name}</span><span className="text-slate-600">VS</span><span>{m.teams.away.name}</span></div>
                <div className="bg-white/5 p-4 rounded-xl text-center font-black text-[12px] mb-4 border border-white/5" style={{color: op.col}}>{op.dc} & +1.5 BUTS</div>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-center italic">
                  <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-blue-400">+7.5 CORNERS</div>
                  <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 text-yellow-500">+2.5 CARTONS</div>
                </div>
              </div>
            );
          })}
        </section>

        {/* 2. COUPON UNIQUE (3) */}
        <section className="bg-[#11192e] p-6 rounded-[2rem] border border-slate-800 shadow-inner">
          <h3 className="text-[10px] font-black text-slate-500 mb-5 italic tracking-widest flex justify-between">COUPON UNIQUE (3) <Zap size={14}/></h3>
          <div className="space-y-5">
            {singleCoupon.map((m, i) => {
              const op = analyzeMatch(m);
              return (
                <div key={i} className="flex items-center gap-4 border-l-2 pl-4" style={{borderColor: op.col}}>
                  <div className="flex-1">
                    <div className="flex justify-between font-black text-[11px] mb-1"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                    <div className="text-[10px] font-black italic" style={{color: op.col}}>{op.dc} & +1.5 BUTS</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-700" />
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. RADAR HISTORIQUE */}
        <section className="bg-sky-500/5 border border-sky-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-sky-500/10 p-3 text-sky-400 font-black text-[9px] flex items-center gap-2 border-b border-sky-500/10"><Clock size={14}/> RADAR HISTORIQUE (LIVE)</div>
          <div className="divide-y divide-slate-800">
            {radarHisto.map((m, i) => (
              <div key={i} className="p-4 flex justify-between items-center bg-[#11192e]/20">
                <span className="text-[10px] font-black truncate max-w-[160px]">{m.teams.home.name} - {m.teams.away.name}</span>
                <div className="flex items-center gap-3">
                    <span className="text-[14px] font-black text-yellow-500">{m.goals.home}-{m.goals.away}</span>
                    <span className="text-[10px] text-sky-400 font-bold animate-pulse">{m.fixture.status.elapsed}'</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. SIGNAL PRESSION */}
        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-orange-500/10 p-3 text-orange-400 font-black text-[9px] flex items-center gap-2 border-b border-orange-500/10"><Flame size={14}/> SIGNAL PRESSION PACKBALL</div>
          {radarDanger.map((m, i) => (
            <div key={i} className="p-4 flex justify-between items-center border-b border-slate-800 last:border-0">
              <span className="text-[10px] font-black">{m.teams.home.name} - {m.teams.away.name}</span>
              <span className="text-orange-500 font-black">{m.fixture.status.elapsed}'</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}