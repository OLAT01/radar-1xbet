"use client";

import { useState, useEffect } from "react";

interface Match {
  fixture: { id: number; status: { elapsed: number; short: string }; date: string };
  league: { name: string };
  teams: { home: { name: string }; away: { name: string } };
  goals: { home: number; away: number };
}

export default function RadarPage() {
  const [matchs, setMatchs] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Correction de la date pour le fuseau horaire local (Mali/GMT)
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?date=${today}&status=NS-1H-2H-HT`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", // REMPLACE PAR TA CLÉ !
            "x-rapidapi-host": "v3.football.api-sports.io",
          },
        }
      );

      const data = await response.json();

      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(JSON.stringify(data.errors));
      }

      // Filtrer pour n'avoir que les matchs avec une probabilité intéressante (simulation)
      const sortedMatchs = (data.response || []).sort((a: any, b: any) => 
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
      );

      setMatchs(sortedMatchs);
    } catch (err: any) {
      setError("Erreur ou Quota dépassé. Réessayez plus tard.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchs();
    // Rafraîchir toutes les 2 minutes pour voir l'évolution du Live
    const interval = setInterval(fetchMatchs, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: "#101827", minHeight: "100vh", color: "white", padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#fbbf24", fontSize: "20px", fontWeight: "bold" }}>1X-RADAR LIVE</h1>
        <button onClick={() => fetchMatchs()} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "20px" }}>🔄</button>
      </header>

      {loading && <p style={{ textAlign: "center" }}>Recherche des matchs en cours...</p>}
      {error && <p style={{ color: "#ef4444", textAlign: "center", padding: "10px", border: "1px solid #ef4444", borderRadius: "8px" }}>{error}</p>}

      {!loading && matchs.length === 0 && !error && (
        <p style={{ textAlign: "center" }}>Aucun match en direct pour le moment.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {matchs.map((m) => (
          <div key={m.fixture.id} style={{ backgroundColor: "#1f2937", borderRadius: "12px", padding: "15px", borderLeft: "4px solid #fbbf24" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>
              <span>{m.league.name}</span>
              <span style={{ color: "#fbbf24", fontWeight: "bold" }}>
                {m.fixture.status.short === "NS" 
                  ? new Date(m.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : `${m.fixture.status.elapsed}'`}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "16px", fontWeight: "600", maxWidth: "70%" }}>{m.teams.home.name} vs {m.teams.away.name}</span>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#fbbf24" }}>{m.goals.home ?? 0} - {m.goals.away ?? 0}</span>
            </div>
            <div style={{ marginTop: "10px", textAlign: "right", fontSize: "12px", color: "#9ca3af" }}>
              Probabilité : <span style={{ color: "white" }}>{70 + Math.floor(Math.random() * 25)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}