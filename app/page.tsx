"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, Zap } from "lucide-react";

const ELITE_LEAGUES = [1, 2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203, 4, 9, 10, 13, 45, 137, 143];

export default function ProBetV15_6() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHisto, setRadarHisto] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const analyzeMatch = (m: any) => {
    const home = m.teams.home.name.toLowerCase();
    const away = m.teams.away.name.toLowerCase();
    const giants = ["liverpool", "city", "real", "bayern", "inter", "psg", "arsenal", "barca", "milan", "napoli", "leverkusen"];
    
    let res = { dc: "1X", col: "#4ade80" }; // Vert par défaut
    if (giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) {
        res = { dc: "2X", col: "#60a5fa" }; // Bleu pour les favoris extérieurs
    } else if (!giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) {
        res = { dc: "12", col: "#fbbf24" }; // Jaune pour match serré
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
      const elite = (data.response || []).filter((m: any) => ELITE_LEAGUES.includes(m.league.id));

      setLeSauveur(elite.filter(m => m.fixture.status.short === "NS").slice(0, 2));
      setSingleCoupon(elite.filter(m => m.fixture.status.short === "NS").slice(2, 5));
      setRadarHisto(elite.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 5));
      setRadarDanger(elite.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(5, 8));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2"><Target className="text-red-500" /><span className="font-black text-lg italic">PROBET V15.6 FIX</span></div>
        <button onClick={fetchData} className="p-2 bg-slate-800 rounded-full"><RefreshCw className={loading ? "animate-spin" : ""} size={18} /></button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        {/* LE SAUVEUR */}
        <section className="space-y-4">
          <h3 className="text-red-500 font-black text-[10px] flex items-center gap-2"><ShieldCheck size={16}/> LE SAUVEUR (ADAPTATIF)</h3>
          {leSauveur.map((m, i) => {
            const op = analyzeMatch(m);
            return (
              <div key={i} className="bg-[#11192e] border-t-2 p-4 rounded-xl shadow-lg" style={{borderColor: op.col}}>
                <div className="flex justify-between font-black text-[12px] mb-3"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="bg-white/5 p-3 rounded-lg text-center font-black text-[11px] mb-3" style={{color: op.col}}>{op.dc} & +1.5 BUTS</div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-center italic">
                  <div className="bg-blue-500/10 p-2 rounded text-blue-400">+7.5 CORNERS</div>
                  <div className="bg-yellow-500/10 p-2 rounded text-yellow-500">+2.5 CARTONS</div>
                </div>
              </div>
            );
          })}
        </section>

        {/* COUPON 3 MATCHS */}
        <section className="bg-[#11192e] p-5 rounded-3xl border border-slate-800">
          <h3 className="text-[10px] font-black text-slate-500 mb-4 italic">COUPON UNIQUE (3)</h3>
          <div className="space-y-4">
            {singleCoupon.map((m, i) => {
              const op = analyzeMatch(m);
              return (
                <div key={i} className="border-l-2 pl-3" style={{borderColor: op.col}}>
                  <div className="flex justify-between font-black text-[11px]"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                  <div className="text-[9px] font-black" style={{color: op.col}}>{op.dc} & +1.5 BUTS</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RADARS */}
        <section className="space-y-4">
          <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl overflow-hidden">
            <div className="bg-sky-500/10 p-2 text-sky-400 font-black text-[9px] flex items-center gap-2"><Clock size={14}/> RADAR HISTORIQUE</div>
            {radarHisto.map((m, i) => (
              <div key={i} className="p-3 border-b border-slate-800 flex justify-between items-center text-[10px] font-black">
                <span>{m.teams.home.name} - {m.teams.away.name}</span>
                <span className="text-yellow-500">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
              </div>
            ))}
          </div>

          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl overflow-hidden">
            <div className="bg-orange-500/10 p-2 text-orange-400 font-black text-[9px] flex items-center gap-2"><Flame size={14}/> SIGNAL PRESSION PACKBALL</div>
            {radarDanger.map((m, i) => (
              <div key={i} className="p-3 border-b border-slate-800 flex justify-between items-center text-[10px] font-black">
                <span>{m.teams.home.name} - {m.teams.away.name}</span>
                <span className="text-orange-500">{m.fixture.status.elapsed}'</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}