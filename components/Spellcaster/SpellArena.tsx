"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { HandData, SpellName, SpellTriggerEvent, ArenaMode, AnimeBanner } from "./types";
import { AnimeParticleEngine } from "./AnimeParticleEngine";
import { AnimeCombatEngine } from "./AnimeCombatEngine";
import { animeAudio } from "./AnimeAudioSynth";

export default function SpellArena() {
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const particleEngineRef = useRef<AnimeParticleEngine | null>(null);
  const combatEngineRef = useRef<AnimeCombatEngine | null>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  const [connected, setConnected] = useState(false);
  const [activeSpell, setActiveSpell] = useState<SpellName>('none');
  const [banners, setBanners] = useState<AnimeBanner[]>([]);
  const [mode, setMode] = useState<ArenaMode>('boss');
  
  const handsRef = useRef<HandData[]>([]);
  const latestFrameRef = useRef<HTMLImageElement | null>(null);
  
  // Game Loop
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = time;
    const deltaTime = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;
    
    if (canvasRef.current && particleEngineRef.current && combatEngineRef.current) {
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      
      // Update Combat Engine
      combatEngineRef.current.update(deltaTime, width, height);
      
      // Draw frame to video canvas
      if (videoCanvasRef.current && latestFrameRef.current) {
         const vctx = videoCanvasRef.current.getContext('2d');
         if (vctx) {
            vctx.clearRect(0, 0, width, height);
            vctx.drawImage(latestFrameRef.current, 0, 0, width, height);
         }
      }
      
      // Render Particles and HUD
      particleEngineRef.current.updateAndDraw(
        deltaTime,
        handsRef.current,
        activeSpell,
        combatEngineRef.current.boss,
        combatEngineRef.current.floatingTexts,
        width,
        height
      );
    }
    
    // Update banners
    setBanners(prev => prev.filter(b => time - b.startTime < b.duration));
    
    requestRef.current = requestAnimationFrame(animate);
  }, [activeSpell]);

  // WebSocket Connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket("ws://localhost:8765");
    
    ws.onopen = () => setConnected(true);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "frame") {
           // We expect data.image to be a base64 Data URL string
           if (!latestFrameRef.current) {
             latestFrameRef.current = new Image();
           }
           latestFrameRef.current.src = data.image;
        } else if (data.type === "spell_state") {
           // New enhanced payload
           handsRef.current = data.hands || [];
           
           if (data.gestures && data.gestures.length > 0) {
              const mainGesture = data.gestures[0];
              if (mainGesture !== activeSpell && mainGesture !== 'none') {
                 handleSpellTrigger(mainGesture);
              }
              setActiveSpell(mainGesture as SpellName);
           } else {
              setActiveSpell('none');
           }
        } else if (data.type === "gesture") {
           // Fallback for original backend
           const gestureData = data;
           // Map old gestures to spells
           let mapped: SpellName = 'none';
           if (gestureData.gesture === 'fist') mapped = 'kamehameha';
           else if (gestureData.gesture === 'two_palms') mapped = 'doctor_strange_shield';
           else if (gestureData.gesture === 'index_up') mapped = 'chidori';
           else if (gestureData.gesture === 'thumbs_up') mapped = 'rasengan';
           else if (gestureData.gesture === 'pinch') mapped = 'thanos_snap';
           
           if (mapped !== activeSpell && mapped !== 'none') {
              handleSpellTrigger(mapped);
           }
           setActiveSpell(mapped);
        }
      } catch (e) {}
    };
    ws.onclose = () => {
      setConnected(false);
      setTimeout(connectWebSocket, 3000);
    };
    wsRef.current = ws;
  }, [activeSpell]);
  
  const handleSpellTrigger = (spell: SpellName) => {
    if (!combatEngineRef.current) return;
    
    // Audio and Banners
    let kanji = "";
    let english = "";
    let color = "";
    
    switch (spell) {
      case 'kamehameha':
        kanji = "ã‹ã‚ã¯ã‚æ³¢"; english = "KAMEHAMEHA"; color = "#00ffff";
        animeAudio.playKamehamehaBeam();
        break;
      case 'hollow_purple':
        kanji = "è™šå¼ã€ŒèŒˆã€"; english = "HOLLOW PURPLE"; color = "#aa00ff";
        animeAudio.playHollowPurpleBlast();
        break;
      case 'domain_expansion':
        kanji = "é ˜åŸŸå±•é–‹"; english = "DOMAIN EXPANSION"; color = "#ffffff";
        animeAudio.playDomainExpansion();
        break;
      case 'chidori':
        kanji = "åƒé³¥"; english = "CHIDORI"; color = "#aaaaff";
        animeAudio.playChidori();
        break;
      case 'doctor_strange_shield':
        kanji = "è­·å°å‰£"; english = "ELDRITCH SHIELD"; color = "#ffaa00";
        animeAudio.playEldritchShield();
        break;
      case 'thanos_snap':
        kanji = "å´©å£Š"; english = "INFINITY SNAP"; color = "#ffff00";
        animeAudio.playThanosSnap();
        break;
    }
    
    if (kanji) {
      setBanners(prev => [...prev, {
        id: Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9),
        kanji,
        english,
        subtext: "Legendary Magic",
        themeColor: color,
        accentColor: "white",
        duration: 2000,
        startTime: performance.now()
      }]);
    }
    
    // Combat
    const event: SpellTriggerEvent = {
       spell,
       stage: 'fire',
       power: 1.0,
       position: { x: 0, y: 0 },
       timestamp: Date.now(),
       confidence: 1.0
    };
    combatEngineRef.current.handleSpellHit(event);
  };

  useEffect(() => {
    // Init engines
    animeAudio.init();
    if (canvasRef.current) {
      particleEngineRef.current = new AnimeParticleEngine(canvasRef.current);
    }
    combatEngineRef.current = new AnimeCombatEngine();
    if (mode === 'boss') {
      combatEngineRef.current.startBossFight();
    }
    
    connectWebSocket();
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(requestRef.current);
      wsRef.current?.close();
    };
  }, [connectWebSocket, animate, mode]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans">
      {/* Background Camera Layer */}
      <canvas 
        ref={videoCanvasRef} 
        width={1280} 
        height={720} 
        className="absolute top-0 left-0 w-full h-full object-cover opacity-70 blur-[2px]" 
      />
      
      {/* VFX and Particles Layer */}
      <canvas 
        ref={canvasRef} 
        width={1280} 
        height={720} 
        className="absolute top-0 left-0 w-full h-full object-cover mix-blend-screen" 
      />
      
      {/* HUD Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-4 flex flex-col justify-between">
         {/* Top Bar */}
         <div className="flex justify-between items-start">
            <div>
               <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 filter drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                  SPELLCASTER ARENA
               </h1>
               <div className="flex items-center gap-2 mt-2">
                 <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_#00ff00]' : 'bg-red-500'}`} />
                 <span className="text-sm font-bold uppercase tracking-widest text-gray-300">
                    {connected ? 'Neural Link Active' : 'Connecting...'}
                 </span>
               </div>
            </div>
            
            <div className="bg-black/50 border border-white/20 p-4 rounded-xl backdrop-blur-md">
               <div className="text-sm text-gray-400 uppercase tracking-widest mb-1">Active Spell</div>
               <div className="text-xl font-bold text-cyan-400">{activeSpell.toUpperCase().replace('_', ' ')}</div>
            </div>
         </div>
         
         {/* Boss Health Bar */}
         {mode === 'boss' && combatEngineRef.current?.boss && combatEngineRef.current.boss.state !== 'defeated' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1/3">
               <div className="text-center font-bold text-red-400 tracking-widest text-lg mb-1 drop-shadow-[0_0_5px_red]">
                  {combatEngineRef.current.boss.title.toUpperCase()}
               </div>
               <div className="h-4 bg-gray-900 rounded-full border-2 border-red-900 overflow-hidden relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300 shadow-[0_0_10px_red]"
                    style={{ width: `${(combatEngineRef.current.boss.hp / combatEngineRef.current.boss.maxHp) * 100}%` }}
                  />
               </div>
            </div>
         )}
         
         {/* Bottom Controls (Pointer Events Enabled here if needed) */}
         <div className="flex gap-4 pointer-events-auto">
            <button className="px-6 py-2 bg-purple-600/50 hover:bg-purple-500 border border-purple-400 rounded-full font-bold transition-all"
                    onClick={() => { animeAudio.init(); setMode('boss'); }}>
               BOSS DUEL
            </button>
            <button className="px-6 py-2 bg-blue-600/50 hover:bg-blue-500 border border-blue-400 rounded-full font-bold transition-all"
                    onClick={() => { animeAudio.init(); setMode('sandbox'); }}>
               SANDBOX
            </button>
            <a href="/controller" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full font-bold transition-all">
               EXIT ARENA
            </a>
         </div>
      </div>
      
      {/* Anime Banners Layer */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
         {banners.map(banner => (
            <div key={banner.id} 
                 className="absolute w-full h-48 bg-black/80 border-y-4 flex flex-col items-center justify-center animate-slide-in-out"
                 style={{ borderColor: banner.themeColor, boxShadow: `0 0 30px ${banner.themeColor}` }}>
               <div className="text-[100px] font-black tracking-[0.2em] opacity-20 absolute" style={{ color: banner.themeColor }}>
                  {banner.kanji}
               </div>
               <div className="text-6xl font-black italic tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)] relative z-10">
                  {banner.english}
               </div>
               <div className="text-xl font-bold tracking-[0.5em] mt-2 relative z-10" style={{ color: banner.themeColor }}>
                  {banner.subtext.toUpperCase()}
               </div>
            </div>
         ))}
      </div>
      
      {/* Global Styles for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInOut {
          0% { transform: translateX(100vw) skewX(-15deg); opacity: 0; }
          10% { transform: translateX(0) skewX(-15deg); opacity: 1; }
          90% { transform: translateX(0) skewX(-15deg); opacity: 1; }
          100% { transform: translateX(-100vw) skewX(-15deg); opacity: 0; }
        }
        .animate-slide-in-out {
          animation: slideInOut 2s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
      `}} />
    </main>
  );
}
