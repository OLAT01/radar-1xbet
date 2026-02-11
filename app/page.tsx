"use client";
import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target } from "lucide-react";

export default function ProBetFinal() {
  const [data, setData] = useState({ sauveur: [], coupon: [], histo: [], danger: [] });
  const [loading, setLoading] = useState(false);

  const getPred = (m: any) => {
    const away = m.teams.away.name.toLowerCase();
    const giants = ["liverpool", "city", "real", "bayern", "psg", "arsenal", "barca", "inter"];
    if (giants.some(g => away.includes(g))) return { txt: "2X & +1.5", col: "#60a5fa" };
    return { txt: "1X & +1.5", col: "#4ade80" };
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const r = await fetch(`https://v3.football.api-sports.io/fixtures?date=2026-02-11&timezone=Africa/Bamako`, {
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const d = await r.json();
      const res = d.response || [];
      setData({
        sauveur: res.filter(m => m.fixture.status.short === "NS").slice(0, 2),
        coupon: res.filter(m => m.fixture.status.short === "NS").slice(2, 5),
        histo: res.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 5),
        danger: res.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(5, 9)
      });
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-4 uppercase font-bold">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-red-500"><Target /> V15.8 FIXED</div>
        <button onClick={fetchAll}><RefreshCw className={loading ? "animate-spin" : ""} /></button>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-red-500 text-[10px] mb-4 flex items-center gap-2"><ShieldCheck size={14}/> LE SAUVEUR</h2>
          {data.sauveur.map((m: any, i) => {
            const p = getPred(m);
            return (
              <div key={i} className="bg-[#11192e] p-4 rounded-xl border-t-4 mb-4 shadow-lg" style={{borderColor: p.col}}>
                <div className="flex justify-between text-[12px] mb-2"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="text-center py-2 rounded bg-white/5" style={{color: p.col}}>{p.txt}</div>
              </div>
            );
          })}
        </section>

        <section className="bg-[#11192e] p-4 rounded-2xl border border-slate-800">
          <h2 className="text-slate-500 text-[10px] mb-4 italic">COUPON UNIQUE (3)</h2>
          {data.coupon.map((m: any, i) => (
            <div key={i} className="border-l-2 border-yellow-500 pl-3 mb-4 last:mb-0">
                <div className="text-[10px]">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="text-yellow-500 text-[9px]">{getPred(m).txt}</div>
            </div>
          ))}
        </section>

        <section className="bg-sky-500/5 border border-sky-500/20 rounded-xl overflow-hidden">
          <div className="bg-sky-500/10 p-2 text-[9px] text-sky-400 flex items-center gap-2"><Clock size={12}/> RADAR HISTORIQUE</div>
          {data.histo.map((m: any, i) => (
            <div key={i} className="p-3 border-b border-slate-800 flex justify-between text-[10px]">
              <span>{m.teams.home.name.slice(0,15)}</span>
              <span className="text-yellow-500">{m.goals.home}-{m.goals.away} ({m.fixture.status.elapsed}')</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}