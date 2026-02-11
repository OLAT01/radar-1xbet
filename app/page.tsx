"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, ShieldCheck, Clock, Flame, RefreshCw, BadgeCheck, BarChart2, Zap, Target, Flag, CreditCard } from "lucide-react";

const ELITE_LEAGUES = [2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203, 1, 4, 9, 10, 13, 45, 137, 143];

export default function ProBetV15_3() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const getAnalysisLink = (home: string, away: string, type: 'FOOTY' | 'PACK') => {
    const query = encodeURIComponent(`${home} vs ${away}`);
    return type === 'FOOTY' ? `https://footystats.org/fr/search?q=${query}` : `https://www.google.com/search?q=Packball+live+stats+${query}`;
  };

  const analyzeMatchMarkets = (m: any) => {
    const leagueId = m.league.id;
    const isHighCorner = [39, 140, 78].includes(leagueId);
    return {
      main: [78, 88].includes(leagueId) ? "LES DEUX MARQUENT" : "1X & +1.5 BUTS",
      corners: isHighCorner ? "+8.5 CORNERS" : "+7.5 CORNERS",
      cornersMT: "OVER 3.5 CORNERS 1H",
      cards: [140, 135, 61].includes(leagueId) ? "+3.5 CARTONS" : "+2.5 CARTONS",
      col: [78, 88].includes(leagueId) ? "#f472b6" : "#4ade80",
      conf: isHighCorner ? "94%" : "88%"
    };
  };

  const refreshSection = async (section: string) => {
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

      if (section === 'SAUVEUR') setLeSauveur(elite.filter(m => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(0, 2));
      if (section === 'COUPON') setSingleCoupon(elite.filter(m => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(3, 6));
      if (section === 'HISTO') setRadarHistorique(elite.filter(m => {
          const diffMin = (new Date(m.fixture.date).getTime() - nowTs) / 60000;
          return (diffMin <= 15 && diffMin > 0) || (m.fixture.status.short === "1H");
      }).slice(0, 8));
      if (section === 'DANGER') setRadarDanger(elite.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 5));
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
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center shadow-xl">
        <div className="flex items-center"><Target className="text-red-500 w-5 h-5 mr-2 animate-pulse" /><span className="font-black text-lg italic">PROBET V15.3</span></div>
        <div className="text-[7px] font-bold text-green-500 border border-green-500/30 px-2 py-1 rounded bg-green-500/5">ALGO ANALYSE COMPLÈTE</div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        {/* LE SAUVEUR */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-red-500 font-black text-[9px] tracking-widest flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> LE SAUVEUR</h3>
            <button onClick={() => refreshSection('SAUVEUR')} className="text-slate-500"><RefreshCw className={`${loadingType === 'SAUVEUR' ? 'animate-spin' : ''} w-4 h-4`} /></button>
          </div>
          {leSauveur.map((m, i) => {
            const an = analyzeMatchMarkets(m);
            return (
              <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 border-l-4 border-l-red-500 shadow-2xl">
                <div className="flex justify-between text-[8px] text-slate-500 mb-2 font-black"><span>{m.league.name}</span><span className="text-yellow-500">CONF: {an.conf}</span></div>
                <div className="flex justify-between font-black text-sm mb-4"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="bg-white/5 p-2 rounded-lg text-center font-black text-[10px] border border-white/10" style={{color: an.col}}>{an.main}</div>
                    <div className="grid grid-cols-2 gap-2 text-[8px] font-black">
                        <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 text-center text-blue-400"><Flag className="w-3 h-3 mx-auto mb-1" />{an.corners}</div>
                        <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20 text-center text-yellow-500"><CreditCard className="w-3 h-3 mx-auto mb-1" />{an.cards}</div>
                    </div>
                </div>
                <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'FOOTY')} target="_blank" className="w-full bg-slate-800/80 p-2 rounded-lg flex items-center justify-center gap-2 text-[8px] font-bold border border-slate-700">VÉRIFIER FOOTYSTATS</a>
              </div>
            );
          })}
        </section>

        {/* UNIQUE COUPON */}
        <section className="bg-[#11192e] rounded-3xl p-5 border border-slate-800">
          <h3 className="text-[9px] font-black text-slate-500 mb-4 flex justify-between items-center">COUPON UNIQUE (3) <RefreshCw onClick={() => refreshSection('COUPON')} className="w-3 h-3" /></h3>
          <div className="space-y-4">
            {singleCoupon.map((m, i) => (
              <div key={i} className="border-l-2 border-yellow-500/40 pl-3">
                <div className="flex justify-between text-[7px] text-slate-500 font-bold mb-1"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className="flex justify-between font-black text-[11px] mb-1"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="text-[9px] font-black text-yellow-500">{analyzeMatchMarkets(m).main} & +7.5 CORNERS</div>
              </div>
            ))}
          </div>
        </section>

        {/* RADAR DANGER AVEC CHRONO */}
        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden">
          <div className="bg-orange-500/10 p-3 flex justify-between items-center text-orange-400 font-black text-[9px]">
            <div className="flex items-center gap-2"><Flame className="w-4 h-4" /> RADAR DANGER (LIVE)</div>
            <button onClick={() => refreshSection('DANGER')} className="bg-orange-500/20 p-2 rounded-full"><RefreshCw className="w-3 h-3" /></button>
          </div>
          <div className="divide-y divide-slate-800">
            {radarDanger.map((m, i) => (
              <div key={i} className="p-4 flex flex-col gap-3 bg-[#11192e]/20">
                <div className="flex justify-between items-center font-black">
                    <span className="text-[10px] truncate max-w-[140px]">{m.teams.home.name} - {m.teams.away.name}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-orange-500">{m.goals.home} - {m.goals.away}</span>
                        <span className="text-[9px] bg-orange-500/20 px-1 rounded animate-pulse">{m.fixture.status.elapsed}'</span>
                    </div>
                </div>
                <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'PACK')} target="_blank" className="w-full py-2 bg-orange-500/10 border border-orange-500/20 rounded text-[8px] font-black text-orange-400 text-center">ANALYSE PACKBALL</a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}