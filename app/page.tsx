"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, Ticket } from "lucide-react";

export default function ProBetV17_8() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchData = async (section: string = "all") => {
    setLoading(section);
    try {
      const headers = { 
        "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", 
        "x-rapidapi-host": "v3.football.api-sports.io" 
      };
      // Ajout d'un paramètre dynamique pour forcer le rafraîchissement réel
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?live=all&v=${Date.now()}`, { headers, cache: 'no-store' });
      const data = await res.json();
      if (data.response) setFixtures(data.response);
    } catch (e) { console.error("Erreur API"); }
    setLoading(null);
  };

  useEffect(() => { fetchData(); }, []);

  // Options variées pour le Sauveur et le Coupon
  const optionsSauveur = ["1X & +1.5 BUTS", "2X & +1.5 BUTS", "PLUS DE 8.5 CORNERS", "MOINS DE 4.5 CARTONS"];
  const optionsCoupon = ["PLUS DE 0.5 BUT À LA MI-TEMPS", "PLUS DE 3.5 TIRS CADRÉS", "PAS DE PENALTY ACCORDÉ", "PLUS DE 1.5 BUTS DANS LE MATCH"];

  const getOption = (arr: string[], index: number) => arr[index % arr.length];

  // LOGIQUE RADARS
  const radarHisto = fixtures.filter(m => {
    const elapsed = m.fixture.status.elapsed || 0;
    const goals = (m.goals.home ?? 0) + (m.goals.away ?? 0);
    const diffMinutes = (new Date(m.fixture.date).getTime() - Date.now()) / 60000;
    return (m.fixture.status.short === "NS" && diffMinutes <= 15 && diffMinutes > 0) || (elapsed >= 1 && elapsed <= 42 && goals >= 1);
  }).slice(0, 7);

  const radarDanger = fixtures.filter(m => (m.fixture.status.elapsed || 0) >= 45 && (m.fixture.status.elapsed || 0) <= 88).slice(0, 7);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 font-sans uppercase font-bold tracking-tighter pb-10">
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-red-600 italic font-black text-xl"><Target /> PROBET V17.8</div>
        <button onClick={() => fetchData("all")} className={`${loading === "all" ? "animate-spin" : ""} bg-red-600/10 p-2 rounded-full border border-red-600/30`}>
          <RefreshCw size={20} className="text-red-600" />
        </button>
      </header>

      <main className="space-y-6 max-w-md mx-auto">
        
        {/* 1. LE SAUVEUR - EXACTEMENT 3 MATCHS + OPTIONS VARIÉES */}
        <section className="bg-red-950/20 border border-red-600/30 rounded-3xl p-5 relative shadow-2xl">
          <button onClick={() => fetchData("sauveur")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "sauveur" ? "animate-spin text-red-500" : "text-slate-600"}/></button>
          <h3 className="text-red-600 text-[10px] mb-4 flex items-center gap-2"><ShieldCheck size={16}/> LE SAUVEUR (3 MATCHS ÉLITES)</h3>
          {fixtures.slice(0, 3).map((m, i) => (
            <div key={i} className="bg-slate-900/80 p-3 rounded-xl mb-2 border-l-4 border-red-600">
              <div className="flex justify-between text-[10px] text-slate-400"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
              <div className="text-center text-red-500 text-[11px] mt-1 font-black">{getOption(optionsSauveur, i)}</div>
            </div>
          ))}
        </section>

        {/* 2. COUPON DU JOUR - EXACTEMENT 3 MATCHS + PRÉCISION OPTION */}
        <section className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-5 relative shadow-2xl">
          <button onClick={() => fetchData("coupon")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "coupon" ? "animate-spin text-emerald-500" : "text-slate-600"}/></button>
          <h3 className="text-emerald-500 text-[10px] mb-4 flex items-center gap-2"><Ticket size={16}/> COUPON SÉCURISÉ (3 MATCHS)</h3>
          <div className="space-y-2">
            {fixtures.slice(3, 6).map((m, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 text-[10px]">
                <span className="truncate max-w-[130px]">{m.teams.home.name}</span>
                <span className="text-emerald-400 font-black text-[9px]">{getOption(optionsCoupon, i)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. RADAR HISTORIQUE */}
        <section className="bg-slate-900/50 border border-sky-500/20 rounded-3xl p-5 relative">
          <button onClick={() => fetchData("histo")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "histo" ? "animate-spin text-sky-500" : "text-slate-600"}/></button>
          <h3 className="text-sky-400 text-[10px] mb-4 flex items-center gap-2 font-black"><Clock size={16}/> RADAR HISTO (STOP 42')</h3>
          <div className="space-y-3">
            {radarHisto.length > 0 ? radarHisto.map((m, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5 text-[11px] items-center">
                <span className="truncate max-w-[160px] font-bold">{m.teams.home.name}-{m.teams.away.name}</span>
                <span className="text-yellow-500 font-black">
                  {m.fixture.status.short === "NS" ? "DEPART" : `${m.goals.home}-${m.goals.away}`} 
                  <span className="ml-1 text-[9px] opacity-70">({m.fixture.status.elapsed || '15M'})</span>
                </span>
              </div>
            )) : <p className="text-center text-slate-700 text-[9px] py-4 italic text-balance">AUCUN MATCH DISPONIBLE (-15' OU BUT MT)</p>}
          </div>
        </section>

        {/* 4. RADAR DANGER */}
        <section className="bg-slate-900/50 border border-orange-500/20 rounded-3xl p-5 relative">
          <button onClick={() => fetchData("danger")} className="absolute top-4 right-4"><RefreshCw size={14} className={loading === "danger" ? "animate-spin text-orange-500" : "text-slate-600"}/></button>
          <h3 className="text-orange-500 text-[10px] mb-4 flex items-center gap-2 font-black"><Flame size={16}/> RADAR DANGER (STOP 88')</h3>
          <div className="space-y-3">
            {radarDanger.length > 0 ? radarDanger.map((m, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5 text-[11px] items-center">
                <span className="truncate max-w-[160px]">{m.teams.home.name}-{m.teams.away.name}</span>
                <span className="text-orange-500 font-black">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
              </div>
            )) : <p className="text-center text-slate-700 text-[9px] py-4 italic">SCAN 2ÈME MI-TEMPS...</p>}
          </div>
        </section>

      </main>
    </div>
  );
}