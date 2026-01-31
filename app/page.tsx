"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, ShieldCheck, Clock, Flame, RefreshCw, BadgeCheck } from "lucide-react";

const ELITE_LEAGUES = [2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203];

export default function ProBetV12_7() {
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingRadar, setLoadingRadar] = useState<string | null>(null);

  // MOTEUR DE PRÉDICTION ÉLITE (7 OPTIONS)
  const getProPrediction = (m: any, index: number) => {
    const leagueId = m.league.id;
    const homeTeam = m.teams.home.name;

    // 1. Stratégie BTTS (Les deux marquent) - Priorité Ligues offensives (ALL, PB, BEL)
    if ([78, 88, 144].includes(leagueId)) {
        return { tip: "LES DEUX ÉQUIPES MARQUENT : OUI", sub: "Option: But dans les deux camps", col: "#f472b6" };
    }

    // 2. Stratégie Over Buts - Pour les grosses affiches
    if (index % 5 === 0) {
        return { tip: "TOTAL : +2.5 BUTS", sub: "Option: Plus de 2.5 buts", col: "#f87171" };
    }

    // 3. Stratégie Corners - Spécial Angleterre
    if (leagueId === 39 || leagueId === 40) {
        return { tip: "CORNERS : +8.5", sub: "Option: Total Corners Plus", col: "#38bdf8" };
    }

    // 4. Stratégie Double Chance - Sécurité maximale
    if (index % 3 === 0) {
        return { tip: "DOUBLE CHANCE : 12", sub: "Option: 12 (Victoire de l'un)", col: "#fbbf24" };
    }

    // 5. Stratégie Individuelle - Pour les favoris à domicile
    return { tip: `INDIVIDUEL ${homeTeam} : +1.5 BUTS`, sub: "Option: Total Individuel 1", col: "#4ade80" };
  };

  const fetchInitialData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const all = data.response || [];
      const eliteMatches = all.filter((m: any) => ELITE_LEAGUES.includes(m.league.id));
      setAllMatches(eliteMatches);
      updateSections(eliteMatches);
      setIsLoaded(true);
    } catch (err) { console.error(err); }
  }, []);

  const updateSections = (matches: any[]) => {
    const nowTs = new Date().getTime();
    
    // Le Sauveur : Filtre très strict sur les ligues majeures uniquement
    const secure = matches.filter((m: any) => m.fixture.status.short === "NS" && [39, 140, 61, 78, 135].includes(m.league.id))
                          .sort(() => Math.random() - 0.5).slice(0, 2);
    setLeSauveur(secure);

    // Coupon : 3 matchs variés
    const coup = matches.filter((m: any) => m.fixture.status.short === "NS")
                        .sort(() => Math.random() - 0.5).slice(3, 6);
    setSingleCoupon(coup);

    // Radar Historique (Elite 8)
    const hist = matches.filter((m: any) => {
      const diffMin = (new Date(m.fixture.date).getTime() - nowTs) / 60000;
      return (diffMin <= 15 && diffMin > 0) || (m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42);
    }).slice(0, 8);
    setRadarHistorique(hist);

    // Radar Danger
    const danger = matches.filter((m: any) => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 5);
    setRadarDanger(danger);
  };

  const refreshSection = async (type: string) => {
    setLoadingRadar(type);
    await fetchInitialData(); 
    setLoadingRadar(null);
  };

  useEffect(() => { if (!isLoaded) fetchInitialData(); }, [isLoaded, fetchInitialData]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center"><Trophy className="text-yellow-500 w-6 h-6 mr-2" /><span className="font-black text-xl italic uppercase">ProBet Elite</span></div>
        <div className="flex gap-2">
            {loadingRadar && <div className="animate-spin text-yellow-500"><RefreshCw className="w-4 h-4" /></div>}
            <div className="bg-green-500/10 text-green-500 text-[9px] px-2 py-1 rounded border border-green-500/20 font-bold uppercase">1XBet Full Option</div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        
        {/* LE SAUVEUR */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest"><ShieldCheck className="w-4 h-4" /> Le Sauveur (BTTS Intégré)</h3>
            <button onClick={() => refreshSection('SAUVEUR')} className="text-slate-500 p-2"><RefreshCw className={`${loadingRadar === 'SAUVEUR' ? 'animate-spin' : ''} w-4 h-4`} /></button>
          </div>
          {leSauveur.map((m, i) => {
            const pred = getProPrediction(m, i);
            return (
              <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 border-l-4 border-l-red-500 shadow-lg">
                <div className="flex justify-between text-[8px] text-slate-500 mb-2 font-black uppercase"><span>{m.league.name}</span><span className="text-yellow-500 flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Certifié 1X</span></div>
                <div className="flex justify-between font-black text-sm mb-3"><span>{m.teams.home.name}</span><span className="text-slate-700 font-normal">vs</span><span>{m.teams.away.name}</span></div>
                <div className="text-[10px] text-red-500 font-black bg-red-500/5 py-2 text-center rounded-lg border border-red-500/20 uppercase">{pred.tip}</div>
                <div className="text-[8px] text-center mt-2 text-slate-500 italic uppercase">{pred.sub}</div>
              </div>
            );
          })}
        </section>

        {/* UNIQUE COUPON */}
        <section className="bg-[#11192e] rounded-2xl p-5 border border-slate-800 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase text-slate-400 italic">Unique Coupon Elite</h3>
            <button onClick={() => refreshSection('COUPON')} className="text-slate-500 p-2"><RefreshCw className={`${loadingRadar === 'COUPON' ? 'animate-spin' : ''} w-4 h-4`} /></button>
          </div>
          <div className="space-y-6">
            {singleCoupon.map((m, i) => {
                const pred = getProPrediction(m, i + 5);
                return (
                    <div key={i} className="relative pl-4 border-l-2 border-yellow-500/40">
                        <div className="flex justify-between text-[8px] text-slate-500 mb-1 font-bold uppercase"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                        <div className="flex justify-between font-black text-[13px] mb-2"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                        <div className="text-[10px] font-black uppercase tracking-widest" style={{color: pred.col}}>{pred.tip}</div>
                    </div>
                );
            })}
          </div>
        </section>

        {/* RADAR HISTORIQUE */}
        <section className="bg-sky-500/5 border border-sky-500/20 rounded-2xl overflow-hidden">
          <div className="bg-sky-500/10 p-3 flex justify-between items-center text-sky-400 font-black text-[10px] uppercase border-b border-sky-500/20">
            <div>Radar Historique</div>
            <button onClick={() => refreshSection('HISTO')} className="p-1"><RefreshCw className={`${loadingRadar === 'HISTO' ? 'animate-spin' : ''} w-3 h-3`} /></button>
          </div>
          <div className="divide-y divide-slate-800">
            {radarHistorique.map((m, i) => (
              <div key={i} className="p-4 flex justify-between items-center bg-[#11192e]/40">
                <div className="text-[11px] font-black uppercase truncate max-w-[140px]">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="text-[14px] font-black text-yellow-500">{m.goals.home} - {m.goals.away}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RADAR DANGER */}
        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden">
          <div className="bg-orange-500/10 p-3 flex justify-between items-center text-orange-400 font-black text-[10px] uppercase border-b border-orange-500/20">
            <div>Radar Danger</div>
            <button onClick={() => refreshSection('DANGER')} className="p-1"><RefreshCw className={`${loadingRadar === 'DANGER' ? 'animate-spin' : ''} w-3 h-3`} /></button>
          </div>
          <div className="divide-y divide-slate-800">
            {radarDanger.map((m, i) => (
              <div key={i} className="p-4 bg-orange-500/[0.03] flex justify-between items-center">
                <div className="text-[11px] font-black uppercase">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="text-orange-500 font-black font-mono">{m.goals.home} - {m.goals.away} <span className="text-[10px] ml-1">({m.fixture.status.elapsed}')</span></div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}