"use client";

import React, { useState, useEffect, useCallback } from "react";

const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function DashboardExpert() {
  const [matchsLive, setMatchsLive] = useState<any[]>([]);
  const [top3Pepites, setTop3Pepites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getPrediction = (m: any) => {
    const id = m.league?.id;
    if (id === 39) return { tip: "+8.5 CORNERS", col: "#38bdf8" };
    if (id === 140 || id === 61) return { tip: "DOUBLE CHANCE 12", col: "#fbbf24" };
    return { tip: "TOTAL +1.5 BUTS", col: "#f87171" };
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

      // 1. FILTRE SCALPING (Réglage : -15min avant le début ET Live 0-42 min)
      const live = all.filter((m: any) => {
        const matchTime = new Date(m.fixture.date).getTime();
        const diffMinutes = (matchTime - now) / 60000;
        const isGold = GOLD_LEAGUES.includes(m.league?.id);
        
        const isUpcoming = diffMinutes <= 15 && diffMinutes > 0; // -15 min avant
        const isInPlay = m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42; // 0-42 min
        
        return isGold && (isUpcoming || isInPlay);
      });
      setMatchsLive(live);

      // 2. FILTRE COUPON VIP (Les 3 meilleurs de toute la journée pour ton combiné)
      const pepites = all
        .filter((m: any) => GOLD_LEAGUES.includes(m.league?.id) && m.fixture.status.short === "NS")
        .sort((a: any, b: any) => {
            const priority = [39, 140, 61, 135, 78, 13, 71];
            const aIdx = priority.indexOf(a.league.id);
            const bIdx = priority.indexOf(b.league.id);
            return (aIdx !== -1 ? aIdx : 99) - (bIdx !== -1 ? bIdx : 99);
        });
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
      
      {/* SECTION COUPON VIP (MATIN) */}
      <section style={{ marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px auto' }}>
        <h2 style={{ color: '#fbbf24', fontSize: '16px', textAlign: 'center', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>🏆 MON COUPON COMBINÉ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
          {top3Pepites.map((m) => (
            <div key={m.fixture.id} style={{ background: '#1e293b', padding: '12px', borderRadius: '10px', border: '1px solid #fbbf24' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '5px' }}>
                <span style={{color: '#38bdf8'}}>{m.league.name}</span>
                <span style={{color: '#fbbf24'}}>{new Date(m.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{m.teams.home.name}</span>
                <span style={{color: '#fbbf24'}}>VS</span>
                <span>{m.teams.away.name}</span>
              </div>
              <div style={{ marginTop: '8px', background: 'rgba(251, 191, 36, 0.1)', padding: '5px', textAlign: 'center', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', color: getPrediction(m).col }}>
                {getPrediction(m).tip}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION RADAR SCALPING (RÉGLAGES : -15min à 42min) */}
      <section style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#38bdf8', fontSize: '16px', textAlign: 'center', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>🔥 RADAR LIVE (-15' à 42')</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
          {matchsLive.map(m => {
            const isLive = m.fixture.status.short === "1H";
            return (
              <div key={m.fixture.id} style={{ background: '#111827', padding: '12px', borderRadius: '10px', border: isLive ? '1px solid #38bdf8' : '1px dashed #475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '5px' }}>
                  <span style={{color: '#94a3b8'}}>{m.league.name}</span>
                  <span style={{color: isLive ? '#fbbf24' : '#38bdf8', fontWeight: 'bold'}}>
                    {isLive ? `${m.fixture.status.elapsed}'` : 'BIENTÔT'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span style={{flex: 1}}>{m.teams.home.name}</span>
                  <span style={{color: '#fbbf24', padding: '0 10px'}}>{isLive ? `${m.goals.home} - ${m.goals.away}` : 'vs'}</span>
                  <span style={{flex: 1, textAlign: 'right'}}>{m.teams.away.name}</span>
                </div>
                {!isLive && <div style={{textAlign: 'center', fontSize: '9px', color: '#38bdf8', marginTop: '5px'}}>Démarre à {new Date(m.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}