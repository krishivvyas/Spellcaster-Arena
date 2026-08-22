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

