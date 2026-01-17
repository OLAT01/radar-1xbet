"use client";

import React, { useState, useEffect, useCallback } from "react";

const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function ChambreOrMulti() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getPrediction = (match: any) => {
    const goals = (match.goals.home || 0) + (match.goals.away || 0);
    const elapsed = match.fixture.status.elapsed;
    
    if (goals >= 2 && elapsed < 40) return { tip: "OVER 3.5 BUTS", color: "#f87171" };
    if (goals === 0 && elapsed > 20) return { tip: "DOUBLE CHANCE 12", color: "#fbbf24" };
    if (match.league.id === 39 || match.league.id === 140) return { tip: "+8.5 CORNERS", color: "#38bdf8" };
    return { tip: "VICTOIRE DIRECTE", color: "#34d399" };
  };

  const fetchMatchs = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: {
          "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099",
          "x-rapidapi-host": "v3.football.api-sports.io",
          "Cache-Control": "no-cache"
        },
      });

      const data = await response.json();
      const allMatchs = data.response || [];
      const now = new Date().getTime();

      const potential = allMatchs.filter((m: any) => {
        const diff = (new Date(m.fixture.date).getTime() - now) / 60000;
        return GOLD_LEAGUES.includes(m.league?.id) && ((diff <= 20 && diff > 0) || (m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 45));
      });

      setMatchs(potential.slice(0, 3));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchMatchs();
    const interval = setInterval(fetchMatchs, 60000);
    return () => clearInterval(interval);
  }, [fetchMatchs]);

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100vh", color: "white", padding: "15px", fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: "2px solid #eab308", marginBottom: "25px", paddingBottom: "15px", textAlign: "center" }}>
        <h1 style={{ color: "#eab308", fontSize: "22px", fontWeight: "bold" }}>💰 LA CHAMBRE D'OR</h1>
        <p style={{ fontSize: "11px", color: "#94a3b8" }}>ANALYSE MULTI-PRÉDICTIONS (V4.5)</p>
      </header>

      {loading && <p style={{ textAlign: "center", color: "#eab308" }}>Scan des meilleures cotes...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {matchs.map((m, i) => {
          const pred = getPrediction(m);
          const isLive = m.fixture.status.short === "1H";
          return (
            <div key={m.fixture.id} style={{ background: "#111827", borderRadius: "12px", padding: "18px", border: "1px solid #1f2937" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8", marginBottom: "10px" }}>
                <span>{m.league.name}</span>
                <span style={{ color: isLive ? "#fbbf24" : "#94a3b8" }}>{isLive ? `${m.fixture.status.elapsed}'` : "BIENTÔT"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <span style={{ fontWeight: "bold", flex: 1 }}>{m.teams.home.name}</span>
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#eab308", margin: "0 10px" }}>{isLive ? `${m.goals.home}-${m.goals.away}` : "VS"}</span>
                <span style={{ fontWeight: "bold", flex: 1, textAlign: "right" }}>{m.teams.away.name}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "12px", border: `1px solid ${pred.color}`, textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "4px" }}>PRÉDICTION CONSEILLÉE</div>
                <div style={{ fontSize: "16px", fontWeight: "900", color: pred.color }}>{pred.tip}</div>
              </div>
            </div>
          );
        })}
      </div>
      {!loading && matchs.length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "40px" }}>En attente d'opportunités majeures...</p>}
    </div>
  );
}