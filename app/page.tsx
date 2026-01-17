"use client";

import { useState, useEffect } from "react";

// Liste des IDs des ligues les plus fiables (Top Europe + Major Latam)
const ELITE_LEAGUES = [39, 140, 135, 78, 61, 2, 3, 848, 143, 71, 13]; 

export default function RadarProPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatchs = async () => {
    try {
      const today = new Date().toLocaleDateString('en-CA');
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?date=${today}&status=1H`, // Uniquement 1ère mi-temps
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", // <--- METS TA CLÉ ICI
            "x-rapidapi-host": "v3.football.api-sports.io",
          },
        }
      );

      const data = await response.json();
      const allMatchs = data.response || [];

      // FILTRAGE STRICT
      const filtered = allMatchs.filter((m: any) => {
        const isElite = ELITE_LEAGUES.includes(m.league.id);
        const isEarly = m.fixture.status.elapsed >= 1 && m.fixture.status.elapsed <= 40;
        const lowScore = (m.goals.home + m.goals.away) <= 2; // Éviter les matchs déjà pliés
        return isElite && isEarly && lowScore;
      });

      setMatchs(filtered);
    } catch (err) {
      console.error("Erreur de mise à jour");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchs();
    const interval = setInterval(fetchMatchs, 60000); // Rafraîchissement chaque minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "white", padding: "15px", fontFamily: 'Segoe UI', maxWidth: "500px", margin: "0 auto" }}>
      <header style={{ borderBottom: "2px solid #fbbf24", marginBottom: "20px", paddingBottom: "10px" }}>
        <h1 style={{ color: "#fbbf24", fontSize: "22px", margin: 0 }}>🛡️ RADAR ELITE HT</h1>
        <p style={{ fontSize: "11px", color: "#94a3b8" }}>Filtrage : Ligues Pro | 0-40 min | < 3 buts</p>
      </header>

      {loading && <p style={{ textAlign: "center", color: "#fbbf24" }}>Analyse du flux live...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {matchs.map((m) => {
          // Calcul d'un indice de confiance basé sur le temps et le score
          const confidence = 95 - (m.fixture.status.elapsed * 0.5); 
          
          return (
            <div key={m.fixture.id} style={{ background: "linear-gradient(145deg, #1e293b, #0f172a)", borderRadius: "10px", padding: "15px", border: "1px solid #334155" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "10px", color: "#38bdf8", fontWeight: "bold", textTransform: "uppercase" }}>{m.league.name}</span>
                <span style={{ background: "#fbbf24", color: "#000", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "900" }}>{m.fixture.status.elapsed}'</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "15px", fontWeight: "bold", flex: 1 }}>{m.teams.home.name}</div>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#fbbf24", padding: "0 15px" }}>{m.goals.home} - {m.goals.away}</div>
                <div style={{ fontSize: "15px", fontWeight: "bold", flex: 1, textAlign: "right" }}>{m.teams.away.name}</div>
              </div>

              <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold" }}>SÛRETÉ : {confidence.toFixed(0)}%</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>Conseil : Over 0.5 HT</span>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && matchs.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "50px", color: "#94a3b8" }}>
          <p>Aucun match d'élite ne remplit les critères de sécurité actuellement.</p>
          <p style={{ fontSize: "12px" }}>Repassez pendant les Killzones (15h - 21h).</p>
        </div>
      )}
    </div>
  );
}