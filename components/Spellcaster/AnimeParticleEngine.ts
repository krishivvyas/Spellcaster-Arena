import { HandData, SpellName } from './types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'flame' | 'spark' | 'smoke' | 'electric' | 'void' | 'dust' | 'rune' | 'debris';
  angle?: number;
  spin?: number;
}

export class AnimeParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public updateAndDraw(
    deltaTime: number,
    hands: HandData[],
    activeSpell: SpellName,
    width: number,
    height: number
  ) {
    this.ctx.clearRect(0, 0, width, height);

    // Update & draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= deltaTime;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * deltaTime * 60;
      p.y += p.vy * deltaTime * 60;
      
      if (p.type === 'flame' || p.type === 'smoke') {
        p.vy -= 0.1 * deltaTime * 60; // rise
        p.size *= 0.95;
      }
      if (p.type === 'void') {
        p.size *= 1.05; // expand
      }
      if (p.angle !== undefined && p.spin !== undefined) {
        p.angle += p.spin * deltaTime * 60;
      }

      const alpha = Math.max(0, p.life / p.maxLife);
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;

      if (p.type === 'electric' || p.type === 'flame' || p.type === 'void') {
        this.ctx.globalCompositeOperation = 'screen';
      } else {
        this.ctx.globalCompositeOperation = 'source-over';
      }

      this.ctx.beginPath();
      if (p.type === 'rune' && p.angle !== undefined) {
         this.ctx.save();
         this.ctx.translate(p.x, p.y);
         this.ctx.rotate(p.angle);
         this.ctx.font = `${p.size}px monospace`;
         this.ctx.fillText("X", 0, 0); // Simplified rune
         this.ctx.restore();
      } else {
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 1.0;

    // Draw Hands (Cyber Chakra Overlay)
    hands.forEach(hand => {
       this.drawCyberHand(hand, width, height);
       this.emitSpellParticles(hand, activeSpell, width, height);
    });
  }

  private drawCyberHand(hand: HandData, width: number, height: number) {
    this.ctx.strokeStyle = hand.handedness === 'Left' ? 'rgba(0, 255, 255, 0.6)' : 'rgba(255, 0, 255, 0.6)';
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = this.ctx.strokeStyle;
    this.ctx.shadowBlur = 10;
    
    // Draw palm center
    const cx = hand.palmCenter.x * width;
    const cy = hand.palmCenter.y * height;
    
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Draw connections (simplified for now, ideally use full connections array)
    hand.landmarks.forEach(lm => {
       const lx = lm.x * width;
       const ly = lm.y * height;
       this.ctx.beginPath();
       this.ctx.arc(lx, ly, 4, 0, Math.PI * 2);
       this.ctx.fillStyle = 'white';
       this.ctx.fill();
    });
    
    this.ctx.shadowBlur = 0;
  }

  private emitSpellParticles(hand: HandData, spell: SpellName, width: number, height: number) {
    const cx = hand.palmCenter.x * width;
    const cy = hand.palmCenter.y * height;
    
    if (spell === 'kamehameha') {
       for(let i=0; i<8; i++) {
         this.particles.push({
           x: cx + (Math.random()-0.5)*50,
           y: cy + (Math.random()-0.5)*50,
           vx: (Math.random()-0.5)*3,
           vy: (Math.random()-0.5)*3,
           life: 1.0 + Math.random()*1.0,
           maxLife: 2.0,
           color: 'rgba(0, 255, 255, 0.8)',
           size: 8 + Math.random()*20,
           type: 'flame'
         });
       }
    } else if (spell === 'chidori') {
       // Tip of index finger
       if (hand.landmarks.length > 8) {
         const ix = hand.landmarks[8].x * width;
         const iy = hand.landmarks[8].y * height;
         for(let i=0; i<5; i++) {
           this.particles.push({
             x: ix + (Math.random()-0.5)*10,
             y: iy + (Math.random()-0.5)*10,
             vx: (Math.random()-0.5)*20,
             vy: (Math.random()-0.5)*20,
             life: 0.3 + Math.random()*0.3,
             maxLife: 0.6,
             color: 'rgba(200, 200, 255, 0.9)',
             size: 3 + Math.random()*5,
             type: 'electric'
           });
         }
       }
    } else if (spell === 'doctor_strange_shield') {
       // Draw rotating mandala (simplified)
       const time = Date.now() / 1000;
       this.ctx.save();
       this.ctx.translate(cx, cy);
       this.ctx.rotate(time * 2);
       this.ctx.strokeStyle = 'rgba(255, 150, 0, 0.8)';
       this.ctx.lineWidth = 6;
       this.ctx.shadowColor = 'orange';
       this.ctx.shadowBlur = 20;
       this.ctx.beginPath();
       this.ctx.arc(0, 0, 80, 0, Math.PI * 2);
       this.ctx.stroke();
       // Inner square
       this.ctx.rotate(-time * 4);
       this.ctx.strokeRect(-55, -55, 110, 110);
       this.ctx.restore();
    } else if (spell === 'rasengan') {
       for(let i=0; i<6; i++) {
         const angle = Math.random() * Math.PI * 2;
         const radius = Math.random() * 40;
         this.particles.push({
           x: cx + Math.cos(angle) * radius,
           y: cy + Math.sin(angle) * radius,
           vx: Math.cos(angle + Math.PI/2) * 5, // Orbit velocity
           vy: Math.sin(angle + Math.PI/2) * 5,
           life: 0.8 + Math.random()*0.5,
           maxLife: 1.3,
           color: 'rgba(50, 150, 255, 0.8)',
           size: 4 + Math.random()*8,
           type: 'void',
           spin: 0.1
         });
       }
       // Core sphere
       this.ctx.save();
       this.ctx.translate(cx, cy);
       this.ctx.fillStyle = 'rgba(200, 230, 255, 0.9)';
       this.ctx.shadowColor = '#00aaff';
       this.ctx.shadowBlur = 30;
       this.ctx.beginPath();
       this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
       this.ctx.fill();
       this.ctx.restore();
    } else if (spell === 'thanos_snap') {
       for(let i=0; i<4; i++) {
         this.particles.push({
           x: cx + (Math.random()-0.5)*80,
           y: cy + (Math.random()-0.5)*80,
           vx: 0,
           vy: -1 - Math.random()*2, // float upwards
           life: 2.0 + Math.random()*2.0,
           maxLife: 4.0,
           color: 'rgba(255, 215, 0, 0.7)', // gold dust
           size: 2 + Math.random()*4,
           type: 'spark'
         });
       }
    }
  }
}
