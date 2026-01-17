"use client";

import React, { useState, useEffect, useCallback } from "react";

const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function RadarDoubleTableau() {
  const [matchsLive, setMatchsLive] = useState<any[]>([]);
  const [top3Pépites, setTop3Pépites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getPrediction = (m: any) => {
    const elapsed = m.fixture.status.elapsed || 0;
    const goals = (m.goals.home || 0) + (m.goals.away || 0);
    if (elapsed > 25 && goals === 0) return { tip: "DOUBLE CHANCE 12", col: "#fbbf24" };
    if (m.league.id === 39) return { tip: "+8.5 CORNERS", col: "#38bdf8" };
    if (goals >= 1) return { tip: "TOTAL +2.5 BUTS", col: "#f87171" };
    return { tip: "VICTOIRE ÉQUIPE 1", col: "#34d399" };
  };

  const fetchAllData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: {
          "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099",
          "x-rapidapi-host": "v3.football.api-sports.io"
        }
      });
      const data = await resp.json();
      const all = data.response || [];
      const now = new Date().getTime();

      // FILTRE 1 : Opportunités 0.5 - 1.0 (Live 0-42 min)
      const live = all.filter((m: any) => 
        GOLD_LEAGUES.includes(m.league.id) && m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42
      );
      setMatchsLive(live.slice(0, 6));

      // FILTRE 2 : Le Top 3 du Jour (Anticipation + Live Elite)
      const pépites = all.filter((m: any) => {
        const diff = (new Date(m.fixture.date).getTime() - now) / 60000;
        return GOLD_LEAGUES.includes(m.league.id) && (diff <= 30 && diff > -45);
      }).sort((a: any, b: any) => b.league.id - a.league.id);
      
      setTop3Pépites(pépites.slice(0, 3));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100vh", color: "white", padding: "10px", fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#fbbf24', fontSize: '20px', marginBottom: '20px' }}>📊 DASHBOARD PROFESSIONNEL</h1>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: '20px' }}>
        
        {/* TABLEAU 1 : OPPORTUNITÉS LIVE (0.5 - 1.0) */}
        <section>
          <h2 style={{ fontSize: '14px', borderLeft: '4px solid #38bdf8', paddingLeft: '10px', color: '#38bdf8' }}>🔥 FLUX LIVE (SCALPING 0.5)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {matchsLive.map(m => (
              <div key={m.fixture.id} style={{ background: '#111827', padding: '10px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>{m.league.name}</span>
                  <span style={{ color: '#fbbf24' }}>{m.fixture.status.elapsed}'</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontWeight: 'bold' }}>
                  <span>{m.teams.home.name}</span>
                  <span>{m.goals.home}-{m.goals.away}</span>
                  <span>{m.teams.away.name}</span>
                </div>
              </div>
            ))}
            {matchsLive.length === 0 && <p style={{fontSize: '11px', color: '#475569'}}>En attente de matchs en 1H...</p>}
          </div>
        </section>

        {/* TABLEAU 2 : LES 3 PÉPITES VIP (PRÉDICTIONS HAUTE PROBA) */}
        <section>
          <h2 style={{ fontSize: '14px', borderLeft: '4px solid #fbbf24', paddingLeft: '10px', color: '#fbbf24' }}>🏆 LE TOP 3 DES PÉPITES (PRÉDICTIONS)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {top3Pépites.map((m, i) => {
              const p = getPrediction(m);
              return (
                <div key={m.fixture.id} style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', border: '1px solid #fbbf24' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '5px' }}>PÉPITE #{i+1} - {m.league.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '10px' }}>
                    <span>{m.teams.home.name}</span>
                    <span style={{color: '#fbbf24'}}>{m.fixture.status.short === "1H" ? `${m.goals.home}-${m.goals.away}` : 'VS'}</span>
                    <span>{m.teams.away.name}</span>
                  </div>
                  <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: `1px dashed ${p.col}` }}>
                    <span style={{ fontSize: '13px', color: p.col, fontWeight: '900' }}>{p.tip}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}