"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, ShieldCheck, Clock, Flame, RefreshCw, BadgeCheck } from "lucide-react";

// MISE À JOUR : Ajout des Coupes (ID 1, 4, 9, 10, 13, 45, 137, 143, 81, 529...)
const ELITE_LEAGUES = [
  2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203,
  1, 4, 9, 10, 13, 45, 48, 137, 143, 81, 529, 202, 197 // IDs pour les Coupes d'aujourd'hui
];

export default function ProBetV13_1() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const getProPrediction = (m: any, level: 'STRICT' | 'NORMAL') => {
    const leagueId = m.league.id;
    if (level === 'STRICT') {
        if ([39, 78, 140, 45, 137].includes(leagueId)) return { tip: "DOUBLE CHANCE : 1X", col: "#4ade80" };
        return { tip: "LES DEUX ÉQUIPES MARQUENT : OUI", col: "#f472b6" };
    }
    return { tip: "TOTAL : +1.5 BUTS", col: "#fbbf24" };
  };

  const refreshSection = async (section: 'SAUVEUR' | 'COUPON' | 'HISTO' | 'DANGER') => {
    setLoadingType(section);
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const elite = (data.response || []).filter((m: any) => ELITE_LEAGUES.includes(m.league.id));
      const nowTs = new Date().getTime();

      if (section === 'SAUVEUR') {
        setLeSauveur(elite.filter((m: any) => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(0, 2));
      } 
      else if (section === 'COUPON') {
        setSingleCoupon(elite.filter((m: any) => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(3, 6));
      } 
      else if (section === 'HISTO') {
        setRadarHistorique(elite.filter((m: any) => {
          const diffMin = (new Date(m.fixture.date).getTime() - nowTs) / 60000;
          return (diffMin <= 15 && diffMin > 0) || (m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42);
        }).slice(0, 8));
      } 
      else if (section === 'DANGER') {
        setRadarDanger(elite.filter((m: any) => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 5));
      }
    } catch (err) { console.error(err); }
    setLoadingType(null);
  };

  useEffect(() => {
    if (!isLoaded) {
      const init = async () => {
        await Promise.all([refreshSection('SAUVEUR'), refreshSection('COUPON'), refreshSection('HISTO'), refreshSection('DANGER')]);
        setIsLoaded(true);
      };
      init();
    }
  }, [isLoaded]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center"><Trophy className="text-yellow-500 w-6 h-6 mr-2" /><span className="font-black text-xl italic uppercase">ProBet V13.1</span></div>
        <div className="bg-red-500/10 text-red-500 text-[9px] px-2 py-1 rounded border border-red-500/20 font-bold">MODE COUPE ACTIVÉ</div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest"><ShieldCheck className="w-4 h-4" /> Le Sauveur</h3>
            <button onClick={() => refreshSection('SAUVEUR')} className="text-slate-500 p-2"><RefreshCw className={`${loadingType === 'SAUVEUR' ? 'animate-spin' : ''} w-4 h-4`} /></button>
          </div>
          {leSauveur.map((m, i) => (
            <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 border-l-4 border-l-red-500">
              <div className="flex justify-between text-[8px] text-slate-500 mb-2 font-black uppercase"><span>{m.league.name}</span><span className="text-yellow-500">1X Certifié</span></div>
              <div className="flex justify-between font-black text-sm mb-3"><span>{m.teams.home.name}</span><span className="text-slate-700">vs</span><span>{m.teams.away.name}</span></div>
              <div className="text-[10px] text-red-500 font-black bg-red-500/5 py-2 text-center rounded-lg border border-red-500/20 uppercase">{getProPrediction(m, 'STRICT').tip}</div>
            </div>
          ))}
        </section>

        <section className="bg-[#11192e] rounded-2xl p-5 border border-slate-800 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase text-slate-400 italic">Unique Coupon</h3>
            <button onClick={() => refreshSection('COUPON')} className="text-slate-500 p-2"><RefreshCw className={`${loadingType === 'COUPON' ? 'animate-spin' : ''} w-4 h-4`} /></button>
          </div>
          <div className="space-y-6">
            {singleCoupon.map((m, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-yellow-500/40">
                <div className="flex justify-between text-[8px] text-slate-500 mb-1 font-bold uppercase"><span>{m.league.name}</span></div>
                <div className="flex justify-between font-black text-[13px] mb-2"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="text-[10px] font-black uppercase tracking-widest" style={{color: getProPrediction(m, 'NORMAL').col}}>{getProPrediction(m, 'NORMAL').tip}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-sky-500/5 border border-sky-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-sky-500/10 p-3 flex justify-between items-center text-sky-400 font-black text-[10px] uppercase border-b border-sky-500/20">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Radar Historique</div>
            <button onClick={() => refreshSection('HISTO')} className="bg-sky-500/20 p-2 rounded-full"><RefreshCw className={`${loadingType === 'HISTO' ? 'animate-spin' : ''} w-4 h-4`} /></button>
          </div>
          <div className="divide-y divide-slate-800">
            {radarHistorique.map((m, i) => (
              <div key={i} className="p-4 flex justify-between items-center bg-[#11192e]/40">
                <div className="text-[11px] font-black uppercase truncate max-w-[140px]">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="flex gap-3 items-center">
                    <span className="text-[14px] font-black text-yellow-500 bg-black/40 px-2 py-1 rounded border border-white/5">{m.goals.home} - {m.goals.away}</span>
                    <span className="text-[10px] text-sky-400 font-mono font-bold animate-pulse">{m.fixture.status.elapsed}'</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-orange-500/10 p-3 flex justify-between items-center text-orange-400 font-black text-[10px] uppercase border-b border-orange-500/20">
            <div className="flex items-center gap-2"><Flame className="w-4 h-4" /> Radar Danger</div>
            <button onClick={() => refreshSection('DANGER')} className="bg-orange-500/20 p-2 rounded-full"><RefreshCw className={`${loadingType === 'DANGER' ? 'animate-spin' : ''} w-4 h-4`} /></button>
          </div>
          <div className="divide-y divide-slate-800">
            {radarDanger.map((m, i) => (
              <div key={i} className="p-4 bg-orange-500/[0.03] flex justify-between items-center">
                <div className="text-[11px] font-black uppercase truncate max-w-[150px]">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="flex gap-3 items-center">
                    <span className="text-[14px] font-black text-orange-500">{m.goals.home} - {m.goals.away}</span>
                    <span className="text-[10px] text-orange-400 font-bold">{m.fixture.status.elapsed}'</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}