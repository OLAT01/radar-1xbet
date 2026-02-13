"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, Flame, RefreshCw, Target, Zap, BarChart2 } from "lucide-react";

// Championnats à hauts scores uniquement (Buts garantis)
const ELITE_BUTS = [39, 40, 41, 61, 140, 141, 78, 79, 135, 88, 94, 253, 2, 3, 1];

export default function ProBetV16() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHisto, setRadarHisto] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const analyzeLogic = (m: any) => {
    const away = m.teams.away.name.toLowerCase();
    const home = m.teams.home.name.toLowerCase();
    const giants = ["liverpool", "city", "real", "bayern", "psg", "arsenal", "barca", "inter", "milan", "leverkusen"];
    
    // RÈGLE DOUBLE CHANCE SELON FAVORI
    if (giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) {
        return { dc: "2X", col: "#60a5fa", border: "border-blue-500" }; 
    } else if (!giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) {
        return { dc: "12", col: "#fbbf24", border: "border-yellow-500" }; 
    }
    return { dc: "1X", col: "#4ade80", border: "border-green-500" };
  };

  const fetchData = async (section: string) => {
    setLoading(section);
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const all = data.response || [];

      if (section === 'sauveur') {
        setLeSauveur(all.filter((m: any) => ELITE_BUTS.includes(m.league.id) && m.fixture.status.short === "NS").slice(0, 2));
      }
      if (section === 'coupon') {
        setSingleCoupon(all.filter((m: any) => ELITE_BUTS.includes(m.league.id) && m.fixture.status.short === "NS").slice(3, 6));
      }
      if (section === 'histo') {
        // RÈGLE : Entre 15' et 42' minute ET au moins 1 but marqué
        const histoFilter = all.filter((m: any) => 
          m.fixture.status.elapsed >= 15 && 
          m.fixture