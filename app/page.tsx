"use client";

import React, { useState, useEffect, useCallback } from "react";

const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function DashboardPermanent() {
  const [coupons, setCoupons] = useState<any[][]>([[], [], []]); // Initialisé avec 3 tableaux vides
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [matchsLive, setMatchsLive] = useState<any[]>([]);

  const getSingleBestTip = (m: any) => {
    const id = m.league?.id;
    if (id === 2 || id === 39) return { tip: "PLUS DE 8.5 CORNERS", col: "#38bdf8" };
    if (id === 78 || id === 88) return { tip: "TOTAL PLUS DE 1.5 BUTS", col: "#f87171" };
    if ([140, 135, 61].includes(id)) return { tip: "DOUBLE CHANCE 12", col: "#fbbf24" };
    return { tip: "TOTAL PLUS DE 1.0 (REMBOURSÉ SI 1)", col: "#94a3b8" };
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
      const now = new Date();
      const nowTimestamp = now.getTime();

      // 1. RADAR LIVE
      setMatchsLive(all.filter((m: any) => {
        const matchTime = new Date(m.fixture.date).getTime();
        const diffMinutes = (matchTime - nowTimestamp) / 60000;
        return GOLD_LEAGUES.includes(m.league?.id) && diffMinutes >= -120 && ((diffMinutes <= 15 && diffMinutes > 0) || (m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42));
      }));

      // 2. FILTRE FUTUR (24H)
      const futureMatchs = all.filter((m: any) => {
        const matchTime = new Date(m.fixture.date).getTime();
        const diffHours = (matchTime - nowTimestamp) / (1000 * 60 * 60);
        return GOLD_LEAGUES.includes(m.league?.id) && m.fixture.status.short === "NS" && m.league.name !== "Friendlies" && diffHours > 0 && diffHours < 24;
      }).sort((a: any, b: any) => {
        const priority = [2, 39, 140, 135, 78, 61];
        const aP = priority.indexOf(a.league.id) !== -1 ? priority.indexOf(a.league.id) : 99;
        const bP = priority.indexOf(b.league.id) !== -1 ? priority.indexOf(b.league.id) : 99;
        return aP - bP || new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
      });

      setLeSauveur(futureMatchs.slice(0, 2));
      const couponPool = futureMatchs.slice(2);
      // On force le découpage en 3 coupons même s'ils sont vides
      setCoupons([couponPool.slice(0, 3), couponPool.slice(3, 6), couponPool.slice(6, 9)]);

    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100vh", color: "white", padding: "10px", fontFamily: 'sans-serif' }}>
      
      {/* LE SAUVEUR */}
      <section style={{ maxWidth: '600px', margin: '0 auto 30px auto', border: '2px solid #ef4444', borderRadius: '15px', background: 'rgba(239, 68, 68, 0.1)', padding: '15px' }}>
        <h2 style={{ textAlign: 'center', color: '#ef4444', fontSize: '16px', fontWeight: '900', marginBottom: '15px' }}>🛡️ LE SAUVEUR (RÉCUPÉRATION)</h2>
        {leSauveur.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leSauveur.map(m => (
              <div key={m.fixture.id} style={{ background: '#020617', padding: '12px', borderRadius: '10px', border: '1px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}><span>{m.league.name}</span><span style={{color: '#ef4444'}}>{new Date(m.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', margin: '8px 0' }}><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', background: 'rgba(239, 68, 68, 0.2)', padding: '5px', borderRadius: '5px' }}>CIBLE : {getSingleBestTip(m).tip}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{textAlign:'center', fontSize:'11px', color:'#94a3b8'}}>Analyse des meilleures pépites en cours...</p>
        )}
      </section>

      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* TITRES DES COUPONS TOUJOURS PRÉSENTS */}
        {[1, 2, 3].map((num, i) => (
          <section key={i} style={{ border: '1px solid #334155', borderRadius: '12px', padding: '12px', background: '#0f172a' }}>
            <div style={{ background: '#fbbf24', color: '#000', fontSize: '10px', fontWeight: '900', padding: '2px 10px', borderRadius: '4px', width: 'fit-content', margin: '0 auto 10px auto' }}>COUPON #{num}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {coupons[i] && coupons[i].length > 0 ? (
                coupons[i].map(m => (
                  <div key={m.fixture.id} style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8' }}><span>{m.league.name}</span><span style={{color: '#fbbf24'}}>{new Date(m.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', margin: '5px 0' }}><span>{m.teams.home.name}</span><span style={{color: '#fbbf24'}}>VS</span><span>{m.teams.away.name}</span></div>
                    <div style={{ color: getSingleBestTip(m).col, fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>{getSingleBestTip(m).tip}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #334155', borderRadius: '8px', color: '#475569', fontSize: '11px' }}>En attente de matchs pour le Coupon #{num}...</div>
              )}
            </div>
          </section>
        ))}

        {/* RADAR LIVE */}
        <section style={{ borderTop: '2px solid #38bdf8', paddingTop: '20px' }}>
          <h2 style={{ color: '#38bdf8', fontSize: '14px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>🔥 RADAR LIVE</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {matchsLive.length > 0 ? matchsLive.map(m => (
              <div key={m.fixture.id} style={{ background: '#111827', padding: '12px', borderRadius: '10px', border: m.fixture.status.short === "1H" ? '1px solid #38bdf8' : '1px dashed #475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '5px' }}>
                  <span style={{color: '#94a3b8'}}>{m.league.name}</span>
                  <span style={{color: m.fixture.status.short === "1H" ? '#fbbf24' : '#38bdf8', fontWeight: 'bold'}}>{m.fixture.status.short === "1H" ? `${m.fixture.status.elapsed}'` : 'BIENTÔT'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                  <span style={{flex: 1}}>{m.teams.home.name}</span>
                  <span style={{color: '#fbbf24', padding: '0 10px'}}>{m.fixture.status.short === "1H" ? `${m.goals.home} - ${m.goals.away}` : 'vs'}</span>
                  <span style={{flex: 1, textAlign: 'right'}}>{m.teams.away.name}</span>
                </div>
              </div>
            )) : <p style={{textAlign: 'center', color: '#475569', fontSize: '11px'}}>Recherche de matchs en cours...</p>}
          </div>
        </section>
      </div>
    </div>
  );
}