"use client";

import React, { useState, useEffect, useCallback } from "react";

const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function RadarDoubleTableau() {
  const [matchsLive, setMatchsLive] = useState<any[]>([]);
  const [top3Pepites, setTop3Pepites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getPrediction = (m: any) => {
    const elapsed = m.fixture?.status?.elapsed || 0;
    const goals = (m.goals?.home || 0) + (m.goals?.away || 0);
    if (elapsed > 25 && goals === 0) return { tip: "DOUBLE CHANCE 12", col: "#fbbf24" };
    if (m.league?.id === 39) return { tip: "+8.5 CORNERS", col: "#38bdf8" };
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

      // TABLEAU 1 : Live 0-42 min
      const live = all.filter((m: any) => 
        GOLD_LEAGUES.includes(m.league?.id) && m.fixture?.status?.short === "1H" && m.fixture?.status?.elapsed <= 42
      );
      setMatchsLive(live.slice(0, 6));

      // TABLEAU 2 : Top 3 Pépites (Anticipation + Live)
      const pepites = all.filter((m: any) => {
        const diff = (new Date(m.fixture?.date).getTime() - now) / 60000;
        return GOLD_LEAGUES.includes(m.league?.id) && (diff <= 30 && diff > -45);
      }).sort((a: any, b: any) => (b.league?.id || 0) - (a.league?.id || 0));
      
      setTop3Pepites(pepites.slice(0, 3));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100vh", color: "white", padding: "10px", fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#fbbf24', fontSize: '20px', marginBottom: '20px', fontWeight: 'bold' }}>📊 DASHBOARD PROFESSIONNEL</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* SECTION 1 : FLUX LIVE */}
        <section>
          <h2 style={{ fontSize: '14px', borderLeft: '4px solid #38bdf8', paddingLeft: '10px', color: '#38bdf8', marginBottom: '15px' }}>🔥 FLUX LIVE (STRATÉGIE 0.5 HT)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {matchsLive.map(m => (
              <div key={m.fixture.id} style={{ background: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '5px' }}>
                  <span style={{color: '#94a3b8'}}>{m.league?.name}</span>
                  <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{m.fixture?.status?.elapsed}'</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>{m.teams?.home?.name}</span>
                  <span style={{color: '#fbbf24'}}>{m.goals?.home}-{m.goals?.away}</span>
                  <span>{m.teams?.away?.name}</span>
                </div>
              </div>
            ))}
            {!loading && matchsLive.length === 0 && <p style={{fontSize: '12px', color: '#475569', textAlign: 'center'}}>Aucune opportunité live pour le moment.</p>}
          </div>
        </section>

        {/* SECTION 2 : TOP 3 PÉPITES */}
        <section>
          <h2 style={{ fontSize: '14px', borderLeft: '4px solid #fbbf24', paddingLeft: '10px', color: '#fbbf24', marginBottom: '15px' }}>🏆 TOP 3 PÉPITES (PRÉDICTIONS)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {top3Pepites.map((m, i) => {
              const p = getPrediction(m);
              const isLive = m.fixture?.status?.short === "1H";
              return (
                <div key={m.fixture.id} style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', border: '1px solid #fbbf24' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>PÉPITE #{i+1} - {m.league?.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '12px', alignItems: 'center' }}>
                    <span style={{flex: 1}}>{m.teams?.home?.name}</span>
                    <span style={{color: '#fbbf24', fontSize: '18px', padding: '0 10px'}}>{isLive ? `${m.goals?.home}-${m.goals?.away}` : 'VS'}</span>
                    <span style={{flex: 1, textAlign: 'right'}}>{m.teams?.away?.name}</span>
                  </div>
                  <div style={{ background: 'rgba(251, 191, 36, 0.05)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: `1px dashed ${p.col}` }}>
                    <div style={{fontSize: '10px', color: '#94a3b8', marginBottom: '4px'}}>CONSEIL EXPERT</div>
                    <div style={{ fontSize: '14px', color: p.col, fontWeight: '900' }}>{p.tip}</div>
                  </div>
                </div>
              );
            })}
            {!loading && top3Pepites.length === 0 && <p style={{fontSize: '12px', color: '#475569', textAlign: 'center'}}>Analyse des pépites en cours...</p>}
          </div>
        </section>

      </div>
    </div>
  );
}