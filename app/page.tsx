"use client";

import React, { useState, useEffect, useCallback } from "react";

const ELITE_LEAGUES = [39, 140, 135, 78, 61, 2, 3, 848, 143, 71, 13]; 

export default function RadarElite() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatchs = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?date=${today}&status=1H-HT&timezone=Africa/Bamako`, 
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

      const filtered = allMatchs.filter((m: any) => {
        const isElite = ELITE_LEAGUES.includes(m.league?.id);
        const elapsed = m.fixture?.status?.elapsed || 0;
        const totalGoals = (m.goals?.home || 0) + (m.goals?.away || 0);
        return isElite && elapsed >= 1 && elapsed <= 42 && totalGoals <= 2;
      });

      setMatchs(filtered.sort((a: any, b: any) => (b.fixture?.status?.elapsed || 0) - (a.fixture?.status?.elapsed || 0)));
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
            <h1 style={{ color: "#fbbf24", fontSize: "18px", margin: 0 }}>🛡️ RADAR ELITE HT</h1>
            <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>V3.1 - SÉCURISÉ</p>
        </div>
        <button onClick={() => fetchMatchs()} style={{ background: "#1e293b", border: "1px solid #fbbf24", color: "white", padding: "5px 10px", borderRadius: "5px" }}>🔄</button>
      </header>

      {loading && <p style={{ textAlign: "center" }}>Analyse en cours...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {matchs.map((m: any) => (
          <div key={m.fixture.id} style={{ background: "#1e293b", borderRadius: "10px", padding: "15px", border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#38bdf8", marginBottom: "8px" }}>
              <span>{m.league?.name}</span>
              <span style={{ color: "#fbbf24" }}>{m.fixture?.status?.elapsed}'</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "bold" }}>{m.teams?.home?.name}</span>
              <span style={{ fontSize: "20px", color: "#fbbf24" }}>{m.goals?.home} - {m.goals?.away}</span>
              <span style={{ fontWeight: "bold" }}>{m.teams?.away?.name}</span>
            </div>
          </div>
        ))}
      </div>

      {!loading && matchs.length === 0 && (
        <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "40px" }}>Aucun match sûr détecté pour le moment.</p>
      )}
    </div>
  );
}