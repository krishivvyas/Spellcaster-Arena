export type ElementType = 
  | 'fire' 
  | 'lightning' 
  | 'ice' 
  | 'air' 
  | 'void' 
  | 'celestial' 
  | 'cosmic';

export type SpellName = 
  | 'none'
  | 'kamehameha'
  | 'hollow_purple'
  | 'domain_expansion'
  | 'chidori'
  | 'rasengan'
  | 'doctor_strange_shield'
  | 'spirit_bomb'
  | 'thanos_snap'
  | 'water_whip'
  | 'fireball';

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  handedness: 'Left' | 'Right';
  landmarks: Landmark3D[];
  palmCenter: { x: number; y: number; z: number };
  palmRadius: number;
  fingersUp: number[]; // [thumb, index, middle, ring, pinky]
  isFist: boolean;
  isPinch: boolean;
  isOpenPalm: boolean;
  isPointing: boolean;
  velocity: { x: number; y: number };
  rawGesture?: string;
}

export interface SpellTriggerEvent {
  spell: SpellName;
  stage: 'charge' | 'fire' | 'active' | 'end';
  power: number; // 0.0 to 1.0
  position: { x: number; y: number };
  target?: { x: number; y: number };
  timestamp: number;
  confidence: number;
}

export interface AnimeBanner {
  id: string;
  kanji: string;
  english: string;
  subtext: string;
  themeColor: string;
  accentColor: string;
  duration: number;
  startTime: number;
}

export interface BossAttack {
  id: string;
  type: 'dark_orb' | 'cursed_beam' | 'meteor' | 'cleave';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  glowColor: string;
  reflected?: boolean;
}

export interface BossState {
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  phase: 1 | 2 | 3;
  state: 'idle' | 'charging' | 'attacking' | 'vulnerable' | 'staggered' | 'defeated';
  attacks: BossAttack[];
  weakness: SpellName;
  dialogue?: string;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  alpha: number;
  vy: number;
  isCrit?: boolean;
}

export interface DojoTarget {
  id: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  element: ElementType;
  color: string;
  pulsePhase: number;
  vx: number;
  vy: number;
}

export type ArenaMode = 'boss' | 'dojo' | 'sandbox';
