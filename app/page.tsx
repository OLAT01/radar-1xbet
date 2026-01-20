"use client";

import React, { useState, useEffect, useCallback } from "react";

const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function DashboardFinalPro() {
  const [coupons, setCoupons] = useState<any[][]>([]);
  const [matchsLive, setMatchsLive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getHighWinRateTip = (m: any) => {
    const id = m.league?.id;
    if (id === 39 || id === 2) return { tip: "TOTAL +1.5 BUTS / CORNERS", col: "#38bdf8" }; 
    if (id === 140 || id === 61 || id === 135) return { tip: "DOUBLE CHANCE 12", col: "#fbbf24" };
    return { tip: "TOTAL +1.0 (REMBOURSÉ SI 1)", col: "#f87171" };
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
      const now = new Date().getTime();

      // 1. RADAR LIVE : FILTRE STRICT (-15' À 42')
      const liveFiltered = all.filter((m: any) => {
        const matchTime = new Date(m.fixture.date).getTime();
        const diffMinutes = (matchTime - now) / 60000;
        const isGold = GOLD_LEAGUES.includes(m.league?.id);
        const isUpcoming = diffMinutes <= 15 && diffMinutes > 0; 
        const isInPlay = m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42;
        return isGold && (isUpcoming || isInPlay);
      });
      setMatchsLive(liveFiltered);

      // 2. COUPONS : UNIQUEMENT LES MATCHS À VENIR (NS)
      const eligible = all
        .filter((m: any) => 
            GOLD_LEAGUES.includes(m.league?.id) && 
            m.fixture.status.short === "NS" && 
            m.league.name !== "Friendlies"
        )
        .sort((a: any, b: any) => {
            const priority = [2, 39, 140, 61, 135, 78];
            const aP = priority.indexOf(a.league.id) !== -1 ? priority.indexOf(a.league.id) : 99;
            const bP = priority.indexOf(b.league.id) !== -1 ? priority.indexOf(b.league.id) : 99;
            return aP - bP || new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
        });

      const pack = [eligible.slice(0, 3), eligible.slice(3, 6), eligible.slice(6, 9)];
      setCoupons(pack.filter(p => p.length > 0));

    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100vh", color: "white", padding: "10px", fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#fbbf24', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>💎 STRATÉGIE 94% RENTABLE</h1>

      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* LES 3 COUPONS VIP */}
        {coupons.map((coupon, idx) => (
          <section key={idx} style={{ border: '1px solid #334155', borderRadius: '12px', padding: '12px', background: '#0f172a' }}>
            <div style={{ background: '#fbbf24', color: '#000', fontSize: '10px', fontWeight: '900', padding: '2px 10px', borderRadius: '4px', width: 'fit-content', margin: '0 auto 10px auto' }}>COUPON #{idx + 1}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {coupon.map(m => (
                <div key={m.fixture.id} style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>{m.league.name}</span>
                    <span style={{color: '#fbbf24'}}>{new Date(m.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
                    <span>{m.teams.home.name}</span>
                    <span style={{color: '#fbbf24'}}>VS</span>
                    <span>{m.teams.away.name}</span>
                  </div>
                  <div style={{ color: getHighWinRateTip(m).col, fontSize: '11px', fontWeight: 'bold', textAlign: 'center', marginTop: '5px' }}>{getHighWinRateTip(m).tip}</div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* RADAR SCALPING RECTIFIÉ (-15' à 42') */}
        <section style={{ borderTop: '2px solid #38bdf8', paddingTop: '20px' }}>
          <h2 style={{ color: '#38bdf8', fontSize: '14px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>🔥 RADAR LIVE (-15' à 42')</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                    <span style={{flex: 1}}>{m.teams.home.name}</span>
                    <span style={{color: '#fbbf24', padding: '0 10px'}}>{isLive ? `${m.goals.home} - ${m.goals.away}` : 'vs'}</span>
                    <span style={{flex: 1, textAlign: 'right'}}>{m.teams.away.name}</span>
                  </div>
                </div>
              );
            })}
            {matchsLive.length === 0 && <p style={{textAlign: 'center', fontSize: '11px', color: '#475569'}}>Aucun match en phase de scalping actuellement.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}