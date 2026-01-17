"use client";

import React, { useState, useEffect, useCallback } from "react";

const ELITE_LEAGUES = [39, 140, 135, 78, 61, 2, 3, 848, 143, 71, 13]; 

export default function RadarElite() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatchs = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      // On récupère tous les matchs du jour pour filtrer nous-mêmes le temps
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, 
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", 
            "x-rapidapi-host": "v3.football.api-sports.io",
            "Cache-Control": "no-cache"
          },
        }
      );

      const data = await response.json();
      const allMatchs = data.response || [];
      const now = new Date().getTime();

      const filtered = allMatchs.filter((m: any) => {
        const isElite = ELITE_LEAGUES.includes(m.league?.id);
        const matchTime = new Date(m.fixture.date).getTime();
        const diffMinutes = (matchTime - now) / 60000;

        // CRITÈRES : 
        // 1. Soit le match commence dans moins de 15 min (diffMinutes entre 0 et 15)
        // 2. Soit le match est en cours en 1ère mi-temps (status 1H)
        const isUpcoming = diffMinutes <= 15 && diffMinutes > 0;
        const isLive = m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42;
        
        return isElite && (isUpcoming || isLive);
      });

      setMatchs(filtered.sort((a: any) => a.fixture.status.short === "1H" ? -1 : 1));
    } catch (err) {
      console.error("Erreur API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatchs();
    const interval = setInterval(fetchMatchs, 60000);
    return () => clearInterval(interval);
  }, [fetchMatchs]);

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "white", padding: "15px" }}>
      <header style={{ borderBottom: "2px solid #fbbf24", marginBottom: "20px", paddingBottom: "10px", display: "flex", justifyContent: "space-between" }}>
        <div>
            <h1 style={{ color: "#fbbf24", fontSize: "18px", margin: 0 }}>🛡️ RADAR ELITE PRO</h1>
            <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>V3.2 - ANTICIPATION 15 MIN</p>
        </div>
        <button onClick={() => fetchMatchs()} style={{ background: "#1e293b", border: "1px solid #fbbf24", color: "white", padding: "5px 10px", borderRadius: "5px" }}>🔄</button>
      </header>

      {loading && <p style={{ textAlign: "center" }}>Recherche des pépites...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {matchs.map((m: any) => {
          const isLive = m.fixture.status.short === "1H";
          return (
            <div key={m.fixture.id} style={{ background: isLive ? "linear-gradient(145deg, #1e293b, #0f172a)" : "#0f172a", borderRadius: "10px", padding: "15px", border: isLive ? "1px solid #fbbf24" : "1px dashed #334155" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#38bdf8", marginBottom: "8px" }}>
                <span>{m.league?.name}</span>
                <span style={{ color: isLive ? "#fbbf24" : "#94a3b8", fontWeight: "bold" }}>
                  {isLive ? `${m.fixture.status.elapsed}'` : "BIENTÔT"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", fontSize: "14px", flex: 1 }}>{m.teams?.home?.name}</span>
                <div style={{ textAlign: "center", padding: "0 10px" }}>
                    <span style={{ fontSize: "20px", color: "#fbbf24", fontWeight: "bold" }}>
                        {isLive ? `${m.goals?.home} - ${m.goals?.away}` : "vs"}
                    </span>
                    {!isLive && <div style={{fontSize: '10px'}}>{new Date(m.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>}
                </div>
                <span style={{ fontWeight: "bold", fontSize: "14px", flex: 1, textAlign: "right" }}>{m.teams?.away?.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && matchs.length === 0 && (
        <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "40px" }}>Aucun match élite dans les 15 prochaines minutes.</p>
      )}
    </div>
  );
}