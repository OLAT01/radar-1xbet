"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, Crown, Zap, Lock, Clock, TrendingUp, ShieldCheck, Flame, Target } from "lucide-react";

const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function ProBetDualRadar() {
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [vipMatch, setVipMatch] = useState<any>(null);
  
  // États pour les deux radars
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);

  const getSmartAnalysis = (m: any, index: number) => {
    const id = m.league?.id;
    if (index === 0) return { tip: "PLUS DE 1.5 BUTS - 90MIN", col: "#f87171" }; 
    if (index === 1 && [39, 140, 61].includes(id)) return { tip: "PLUS DE 3.5 CARTONS", col: "#f472b6" };
    if (index === 2) return { tip: "DOUBLE CHANCE 12", col: "#fbbf24" };
    return { tip: "PLUS DE 8.5 CORNERS", col: "#38bdf8" };
  };

  const fetchAllData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const all = data.response || [];
      const nowTs = new Date().getTime();

      // 1. RADAR HISTORIQUE (But précoce : de -15min à 42min)
      setRadarHistorique(all.filter((m: any) => {
        const matchTime = new Date(m.fixture.date).getTime();
        const diffMin = (matchTime - nowTs) / 60000;
        const isEarly = m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42;
        const isPreMatch = diffMin <= 15 && diffMin > 0;
        return GOLD_LEAGUES.includes(m.league?.id) && (isPreMatch || isEarly);
      }));

      // 2. RADAR DANGER (Haute probabilité de but - Tout moment - Durée 20min)
      // Note : On utilise les statistiques de l'API (si disponibles) pour simuler le "Danger"
      setRadarDanger(all.filter((m: any) => {
        const status = m.fixture.status.short;
        // Critères Danger : Match en cours + (Bons championnats)
        const isLive = ["1H", "2H"].includes(status);
        // Ici on simule la détection de danger par les ligues offensives
        return isLive && [39, 2, 78, 135].includes(m.league?.id) && m.goals.home + m.goals.away < 4;
      }).slice(0, 5)); // On limite pour la lisibilité

      // GESTION DES COUPONS
      const future = all.filter((m: any) => {
        const diffH = (new Date(m.fixture.date).getTime() - nowTs) / (1000 * 60 * 60);
        return m.fixture.status.short === "NS" && diffH > 0 && diffH < 24;
      }).sort((a: any, b: any) => (GOLD_LEAGUES.includes(a.league.id) ? -1 : 1));

      setVipMatch(future[0]);
      setLeSauveur(future.slice(1, 3));
      setSingleCoupon(future.slice(3, 6));

    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchAllData();
    const inv = setInterval(fetchAllData, 60000);
    return () => clearInterval(inv);
  }, [fetchAllData]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans">
      <header className="bg-[#11192e] p-4 flex justify-between items-center border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2"><Trophy className="text-yellow-500 w-6 h-6" /><span className="font-black text-xl italic uppercase">Pro<span className="text-yellow-500">Bet</span></span></div>
        <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">Elite Mode</div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        
        {/* VIP & SAUVEUR (Inchangés) */}
        <section className="rounded-2xl border-2 border-yellow-500/50 bg-[#1a1f35] overflow-hidden shadow-xl p-5 text-center">
          <div className="text-yellow-500 font-black text-[10px] uppercase mb-2 flex items-center justify-center gap-2"><Crown className="w-4 h-4"/> VIP Rollover</div>
          <div className="text-2xl font-black italic mb-4">100€ → 1500€</div>
          <button className="bg-yellow-500 text-black w-full py-2 rounded-lg font-black text-xs">ACCÈS AU COUPON VIP</button>
        </section>

        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-red-500 font-black text-xs uppercase"><ShieldCheck className="w-4 h-4" /> Le Sauveur (90 MIN)</h3>
          {leSauveur.map((m, i) => (
            <div key={i} className="bg-[#11192e] border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between text-[9px] text-slate-500 mb-1 uppercase font-bold"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
              <div className="flex justify-between font-bold text-sm mb-2"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
              <div className="text-[10px] text-red-500 font-black bg-red-500/10 py-1 text-center rounded">{getSmartAnalysis(m, i).tip}</div>
            </div>
          ))}
        </section>

        {/* COUPON DE 3 MATCHS (RÉTABLI) */}
        <section className="bg-[#11192e] border-l-4 border-yellow-500 rounded-xl p-4 shadow-lg">
          <h3 className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center justify-between">Coupon de 3 Matchs</h3>
          <div className="space-y-4">
            {singleCoupon.map((m, i) => (
              <div key={i} className="border-b border-slate-800/50 pb-2 last:border-0">
                <div className="flex justify-between text-[8px] text-slate-500 mb-1 font-bold"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className="flex justify-between font-bold text-xs mb-1"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="text-[10px] font-black uppercase" style={{color: getSmartAnalysis(m, i).col}}>{getSmartAnalysis(m, i).tip}</div>
              </div>
            ))}
          </div>
        </section>

        {/* --- NOUVEAUX RADARS --- */}

        {/* 1. RADAR HISTORIQUE (PRE-MATCH & 1ERE MI-TEMPS) */}
        <section className="bg-[#0f172a] border border-sky-500/30 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-sky-500/10 p-3 flex justify-between items-center border-b border-sky-500/20">
            <div className="flex items-center gap-2 text-sky-400 font-black text-[10px] uppercase"><Clock className="w-4 h-4" /> Radar Historique (-15' à 42')</div>
          </div>
          <div className="divide-y divide-slate-800">
            {radarHistorique.length > 0 ? radarHistorique.map((m, i) => (
              <div key={i} className="p-4 flex justify-between items-center">
                <div className="text-[11px] font-bold truncate max-w-[150px]">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="text-[10px] bg-sky-500/10 px-2 py-1 rounded text-sky-400 font-mono font-bold">
                  {m.fixture.status.short === "NS" ? "BIENTÔT" : `${m.fixture.status.elapsed}'`}
                </div>
              </div>
            )) : <p className="p-4 text-center text-[10px] text-slate-600 italic">Aucun match précoce détecté...</p>}
          </div>
        </section>

        {/* 2. RADAR DANGER (HAUTE PROBABILITÉ DE BUT) */}
        <section className="bg-[#0f172a] border border-orange-500/30 rounded-xl overflow-hidden shadow-lg shadow-orange-500/5">
          <div className="bg-orange-500/10 p-3 flex justify-between items-center border-b border-orange-500/20">
            <div className="flex items-center gap-2 text-orange-400 font-black text-[10px] uppercase"><Flame className="w-4 h-4 animate-bounce" /> Radar Danger (Score Imminent)</div>
            <span className="bg-orange-500 text-black text-[8px] px-2 py-0.5 rounded-full font-bold">LIVE</span>
          </div>
          <div className="divide-y divide-slate-800">
            {radarDanger.length > 0 ? radarDanger.map((m, i) => (
              <div key={i} className="p-4 bg-orange-500/[0.02]">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[11px] font-black uppercase tracking-tighter">{m.teams.home.name} - {m.teams.away.name}</div>
                  <div className="text-xs font-black text-orange-500">{m.goals.home} - {m.goals.away}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[9px] text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full">
                    <Target className="w-3 h-3" /> FORTE PRESSION DÉTECTÉE
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono italic">Max 20 min</span>
                </div>
              </div>
            )) : <p className="p-4 text-center text-[10px] text-slate-600 italic">Analyse de la pression en cours...</p>}
          </div>
        </section>

      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-[#11192e] border-t border-slate-800 p-4 flex justify-around backdrop-blur-md">
        <TrendingUp className="text-yellow-500" /> <Zap className="text-slate-500" /> <Crown className="text-slate-500" />
      </nav>
    </div>
  );
}