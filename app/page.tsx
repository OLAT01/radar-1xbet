"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, Zap, ChevronRight, BarChart2 } from "lucide-react";

const ELITE_LEAGUES = [1, 2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203, 4, 9, 10, 13, 45, 137, 143];

export default function ProBetV15_9() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHisto, setRadarHisto] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  // LOGIQUE DE DOUBLE CHANCE SELON LE FAVORI (CORRIGÉE)
  const analyzeMatch = (m: any) => {
    const home = m.teams.home.name.toLowerCase();
    const away = m.teams.away.name.toLowerCase();
    // Liste des géants pour détecter le 2X
    const giants = ["liverpool", "city", "real", "bayern", "inter", "psg", "arsenal", "barca", "milan", "napoli", "leverkusen", "chelsea", "united", "juventus"];
    
    let res = { dc: "1X", col: "#4ade80", border: "border-green-500" }; 

    // Si le favori est à l'extérieur (ex: Liverpool chez Sunderland)
    if (giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) {
        res = { dc: "2X", col: "#60a5fa", border: "border-blue-500" }; 
    } 
    // Si c'est un match très serré entre équipes moyennes
    else if (!giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) {
        res = { dc: "12", col: "#fbbf24", border: "border-yellow-500" }; 
    }
    return res;
  };

  const fetchData = async (section: string = 'all') => {
    setLoading(section);
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const all = data.response || [];
      const elite = all.filter((m: any) => ELITE_LEAGUES.includes(m.league.id));

      if (section === 'all' || section === 'sauveur') setLeSauveur(elite.filter(m => m.fixture.status.short === "NS").slice(0, 2));
      if (section === 'all' || section === 'coupon') setSingleCoupon(elite.filter(m => m.fixture.status.short === "NS").slice(2, 5));
      if (section === 'all' || section === 'histo') setRadarHisto(all.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 5));
      if (section === 'all' || section === 'danger') setRadarDanger(all.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(5, 9));
    } catch (e) { console.error(e); }
    setLoading(null);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase">
      {/* HEADER AVEC REFRESH GLOBAL */}
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2"><Target className="text-red-500" /><span className="font-black text-lg italic">PROBET V15.9 PRO</span></div>
        <button onClick={() => fetchData('all')} className="p-2 bg-slate-800/50 rounded-full border border-slate-700">
          <RefreshCw className={loading === 'all' ? "animate-spin" : ""} size={20} />
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        
        {/* 1. LE SAUVEUR AVEC REFRESH INDIVIDUEL */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-red-500 font-black text-[10px] tracking-widest flex items-center gap-2"><ShieldCheck size={16}/> LE SAUVEUR</h3>
            <button onClick={() => fetchData('sauveur')} className="text-slate-500"><RefreshCw size={14} className={loading === 'sauveur' ? "animate-spin" : ""}/></button>
          </div>
          {leSauveur.map((m, i) => {
            const op = analyzeMatch(m);
            return (
              <div key={i} className={`bg-[#11192e] border-t-4 ${op.border} p-5 rounded-2xl shadow-xl`}>
                <div className="flex justify-between font-black text-[12px] mb-4"><span>{m.teams.home.name}</span><span className="text-slate-600 text-[10px]">VS</span><span>{m.teams.away.name}</span></div>
                <div className="bg-white/5 p-4 rounded-xl text-center font-black text-[12px] mb-4" style={{color: op.col}}>{op.dc} & +1.5 BUTS</div>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-center italic">
                  <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-blue-400">+7.5 CORNERS</div>
                  <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 text-yellow-500">+2.5 CARTONS</div>
                </div>
              </div>
            );
          })}
        </section>

        {/* 2. COUPON UNIQUE (3) AVEC REFRESH INDIVIDUEL */}
        <section className="bg-[#11192e] p-6 rounded-[2rem] border border-slate-800 shadow-inner">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[10px] font-black text-slate-500 italic tracking-widest flex items-center gap-2">COUPON UNIQUE (3) <Zap size={14} className="text-yellow-500"/></h3>
            <button onClick={() => fetchData('coupon')} className="text-slate-500"><RefreshCw size={14} className={loading === 'coupon' ? "animate-spin" : ""}/></button>
          </div>
          <div className="space-y-5">
            {singleCoupon.map((m, i) => {
              const op = analyzeMatch(m);
              return (
                <div key={i} className="flex items-center gap-4 border-l-2 pl-4" style={{borderColor: op.col}}>
                  <div className="flex-1">
                    <div className="flex justify-between font-black text-[11px] mb-1"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                    <div className="text-[10px] font-black italic" style={{color: op.col}}>{op.dc} & +1.5 BUTS</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. RADAR HISTORIQUE AVEC REFRESH INDIVIDUEL */}
        <section className="bg-sky-500/5 border border-sky-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-sky-500/10 p-3 flex justify-between items-center">
            <div className="text-sky-400 font-black text-[9px] flex items-center gap-2"><Clock size={14}/> RADAR HISTORIQUE (LIVE)</div>
            <button onClick={() => fetchData('histo')} className="text-sky-400/50"><RefreshCw size={12} className={loading === 'histo' ? "animate-spin" : ""}/></button>
          </div>
          <div className="divide-y divide-slate-800">
            {radarHisto.map((m, i) => (
              <div key={i} className="p-4 flex justify-between items-center bg-[#11192e]/20">
                <span className="text-[10px] font-black truncate max-w-[160px]">{m.teams.home.name} - {m.teams.away.name}</span>
                <div className="flex items-center gap-3 font-black">
                    <span className="text-yellow-500">{m.goals.home}-{m.goals.away}</span>
                    <span className="text-sky-400 text-[10px] animate-pulse">{m.fixture.status.elapsed}'</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. RADAR DANGER (RETOUR !) AVEC REFRESH INDIVIDUEL */}
        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-orange-500/10 p-3 flex justify-between items-center">
            <div className="text-orange-400 font-black text-[9px] flex items-center gap-2"><Flame size={14}/> SIGNAL PRESSION PACKBALL</div>
            <button onClick={() => fetchData('danger')} className="text-orange-400/50"><RefreshCw size={12} className={loading === 'danger' ? "animate-spin" : ""}/></button>
          </div>
          <div className="divide-y divide-slate-800">
            {radarDanger.map((m, i) => (
              <div key={i} className="p-4 flex justify-between items-center bg-[#11192e]/20">
                <span className="text-[10px] font-black truncate max-w-[160px]">{m.teams.home.name} - {m.teams.away.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500 font-black">{m.fixture.status.elapsed}'</span>
                  <BarChart2 size={12} className="text-orange-500 animate-bounce" />
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}