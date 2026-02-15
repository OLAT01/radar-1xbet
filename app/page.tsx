"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, Ticket } from "lucide-react";

export default function ProBetV17_9() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchData = useCallback(async (section: string = "all") => {
    setLoading(section);
    try {
      const headers = { 
        "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", 
        "x-rapidapi-host": "v3.football.api-sports.io" 
      };
      
      // Tentative 1: Matchs en direct
      let response = await fetch(`https://v3.football.api-sports.io/fixtures?live=all&timezone=Africa/Bamako`, { headers, cache: 'no-store' });
      let data = await response.json();

      // Tentative 2: Si aucun direct, on prend les matchs du jour pour remplir Sauveur/Coupon
      if (!data.response || data.response.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, { headers, cache: 'no-store' });
        data = await response.json();
      }

      if (data.response) {
        setFixtures(data.response);
      }
    } catch (e) {
      console.error("Erreur de connexion API");
    } finally {
      setLoading(null);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Générateur d'options précises
  const getSauveurOption = (m: any) => {
    const homeFav = (m.teams.home.winner === true) || (m.goals.home > m.goals.away);
    return homeFav ? "1X & +1.5 BUTS DANS LE MATCH" : "2X & +1.5 BUTS DANS LE MATCH";
  };

  const getCouponOption = (index: number) => {
    const options = [
      "PLUS DE 0.5 BUT À LA MI-TEMPS",
      "PLUS DE 8.5 CORNERS DANS LE MATCH",
      "MOINS DE 4.5 CARTONS JAUNES",
      "PLUS DE 2.5 TIRS CADRÉS (EQUIPE FAVORITE)"
    ];
    return options[index % options.length];
  };

  // Filtrage des Radars avec règles strictes
  const radarHisto = fixtures.filter(m => {
    const elapsed = m.fixture.status.elapsed || 0;
    const goals = (m.goals.home ?? 0) + (m.goals.away ?? 0);
    const diffMin = (new Date(m.fixture.date).getTime() - Date.now()) / 60000;
    
    const isUpcoming = m.fixture.status.short === "NS" && diffMin <= 15 && diffMin > 0;
    const isLiveEarly = elapsed >= 1 && elapsed <= 42 && goals >= 1;
    return isUpcoming || isLiveEarly;
  }).slice(0, 7);

  const radarDanger = fixtures.filter(m => {
    const elapsed = m.fixture.status.elapsed || 0;
    return elapsed >= 45 && elapsed <= 88;
  }).slice(0, 7);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 font-sans uppercase font-bold tracking-tighter pb-10">
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-red-600 italic font-black text-xl"><Target /> PROBET V17.9</div>
        <button onClick={() => fetchData("all")} className={`${loading === "all" ? "animate-spin" : ""} bg-red-600/20 p-2 rounded-full`}>
          <RefreshCw size={20} className="text-red-600" />
        </button>
      </header>

      <main className="space-y-6 max-w-md mx-auto">
        
        {/* SECTION 1: LE SAUVEUR (3 MATCHS) */}
        <section className="bg-red-950/20 border border-red-600/30 rounded-3xl p-5 relative shadow-2xl">
          <button onClick={() => fetchData("sauveur")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "sauveur" ? "animate-spin text-red-500" : "text-slate-600"}/></button>
          <h3 className="text-red-600 text-[10px] mb-4 flex items-center gap-2 font-black"><ShieldCheck size={16}/> LE SAUVEUR (3 PRÉVISIONS)</h3>
          {fixtures.length > 0 ? fixtures.slice(0, 3).map((m, i) => (
            <div key={i} className="bg-slate-900/80 p-3 rounded-xl mb-2 border-l-4 border-red-600">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
              <div className="text-center text-red-500 text-[11px] font-black">{getSauveurOption(m)}</div>
            </div>
          )) : <div className="text-center text-slate-700 text-[9px] py-4 italic">CHARGEMENT ÉLITE...</div>}
        </section>

        {/* SECTION 2: COUPON (3 MATCHS) */}
        <section className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-5 relative shadow-2xl">
          <button onClick={() => fetchData("coupon")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "coupon" ? "animate-spin text-emerald-500" : "text-slate-600"}/></button>
          <h3 className="text-emerald-500 text-[10px] mb-4 flex items-center gap-2 font-black"><Ticket size={16}/> COUPON DU JOUR</h3>
          <div className="space-y-2">
            {fixtures.length > 0 ? fixtures.slice(3, 6).map((m, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 text-[10px]">
                <span className="truncate max-w-[130px]">{m.teams.home.name}</span>
                <span className="text-emerald-400 font-black text-[9px]">{getCouponOption(i)}</span>
              </div>
            )) : <div className="text-center text-slate-700 text-[9px] py-4 italic">ANALYSE EN COURS...</div>}
          </div>
        </section>

        {/* SECTION 3: RADAR HISTORIQUE */}
        <section className="bg-slate-900/50 border border-sky-500/20 rounded-3xl p-5 relative">
          <button onClick={() => fetchData("histo")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "histo" ? "animate-spin text-sky-500" : "text-slate-600"}/></button>
          <h3 className="text-sky-400 text-[10px] mb-4 flex items-center gap-2 font-black"><Clock size={16}/> RADAR HISTO (STOP 42')</h3>
          <div className="space-y-3">
            {radarHisto.length > 0 ? radarHisto.map((m, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5 text-[11px] items-center">
                <span className="truncate max-w-[150px] font-bold">{m.teams.home.name}-{m.teams.away.name}</span>
                <span className="text-yellow-500 font-black">
                  {m.fixture.status.short === "NS" ? "A VENIR" : `${m.goals.home}-${m.goals.away}`} 
                  <span className="ml-1 text-[9px] opacity-70">({m.fixture.status.elapsed || '-15M'})</span>
                </span>
              </div>
            )) : <p className="text-center text-slate-700 text-[9px] py-4 italic">AUCUN MATCH (-15' OU BUT MT)</p>}
          </div>
        </section>

        {/* SECTION 4: RADAR DANGER */}
        <section className="bg-slate-900/50 border border-orange-500/20 rounded-3xl p-5 relative">
          <button onClick={() => fetchData("danger")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "danger" ? "animate-spin text-orange-500" : "text-slate-600"}/></button>
          <h3 className="text-orange-500 text-[10px] mb-4 flex items-center gap-2 font-black"><Flame size={16}/> RADAR DANGER (STOP 88')</h3>
          <div className="space-y-3">
            {radarDanger.length > 0 ? radarDanger.map((m, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5 text-[11px] items-center">
                <span className="truncate max-w-[150px]">{m.teams.home.name}-{m.teams.away.name}</span>
                <span className="text-orange-500 font-black">{m.goals.home}-${m.goals.away} ({m.fixture.status.elapsed}')</span>
              </div>
            )) : <p className="text-center text-slate-700 text-[9px] py-4 italic">SCAN 2EME MI-TEMPS...</p>}
          </div>
        </section>

      </main>
    </div>
  );
}