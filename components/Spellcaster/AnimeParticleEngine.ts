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
  type: 'flame' | 'spark' | 'smoke' | 'electric' | 'void' | 'dust' | 'rune' | 'debris' | 'lightning' | 'beam';
  angle?: number;
  spin?: number;
  thickness?: number;
}

export class AnimeParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];

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

      if (p.type === 'electric' || p.type === 'flame' || p.type === 'void' || p.type === 'lightning') {
        this.ctx.globalCompositeOperation = 'screen';
      } else {
        this.ctx.globalCompositeOperation = 'source-over';
      }

      if (p.type === 'lightning') {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p.x + p.vx * p.life * 10, p.y + p.vy * p.life * 10);
          this.ctx.lineWidth = p.thickness || 2;
          this.ctx.strokeStyle = p.color;
          this.ctx.stroke();
          continue;
      }

      this.ctx.beginPath();
      if (p.type === 'rune' && p.angle !== undefined) {
         this.ctx.save();
         this.ctx.translate(p.x, p.y);
         this.ctx.rotate(p.angle);
         this.ctx.font = `${p.size}px monospace`;
         this.ctx.fillText('X', 0, 0); // Simplified rune
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
    this.ctx.strokeStyle = hand.handedness === 'Left' ? 'rgba(0, 255, 255, 0.4)' : 'rgba(255, 0, 255, 0.4)';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = this.ctx.strokeStyle;
    this.ctx.shadowBlur = 15;
    
    // Draw palm center
    const cx = hand.palmCenter.x * width;
    const cy = hand.palmCenter.y * height;
    
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Draw joints
    hand.landmarks.forEach(lm => {
       const lx = lm.x * width;
       const ly = lm.y * height;
       this.ctx.beginPath();
       this.ctx.arc(lx, ly, 3, 0, Math.PI * 2);
       this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
       this.ctx.fill();
    });
    
    this.ctx.shadowBlur = 0;
  }

  private emitSpellParticles(hand: HandData, spell: SpellName, width: number, height: number) {
    const cx = hand.palmCenter.x * width;
    const cy = hand.palmCenter.y * height;
    const time = Date.now() / 1000;
    
    if (spell === 'kamehameha') {
       // Kamehameha: Huge bright cyan core with intense outward energy
       this.ctx.save();
       this.ctx.translate(cx, cy);
       // Huge Beam of light shooting UP (assuming hands are pointing forward)
       this.ctx.beginPath();
       this.ctx.rect(-80, -height * 1.5, 160, height * 1.5);
       const gradient = this.ctx.createLinearGradient(0, 0, 0, -height);
       gradient.addColorStop(0, '#ffffff');
       gradient.addColorStop(0.1, 'rgba(0, 255, 255, 0.9)');
       gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
       this.ctx.fillStyle = gradient;
       this.ctx.fill();

       this.ctx.beginPath();
       this.ctx.arc(0, 0, 40 + Math.sin(time * 30) * 10, 0, Math.PI * 2);
       this.ctx.fillStyle = '#ffffff';
       this.ctx.shadowColor = '#00ffff';
       this.ctx.shadowBlur = 50;
       this.ctx.fill();
       
       // Core aura
       this.ctx.beginPath();
       this.ctx.arc(0, 0, 70 + Math.cos(time * 20) * 10, 0, Math.PI * 2);
       this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
       this.ctx.fill();
       this.ctx.restore();

       for(let i=0; i<5; i++) {
         const angle = -Math.PI / 2 + (Math.random()-0.5) * 0.5; // Shoot mostly UP
         const speed = 20 + Math.random() * 40;
         this.particles.push({
           x: cx + (Math.random()-0.5)*40,
           y: cy + (Math.random()-0.5)*40,
           vx: Math.cos(angle) * speed,
           vy: Math.sin(angle) * speed,
           life: 1.5 + Math.random()*1.5,
           maxLife: 3.0,
           color: Math.random() > 0.5 ? '#ffffff' : '#00ffff',
           size: 6 + Math.random()*8,
           type: 'flame'
         });
       }
    } else if (spell === 'chidori') {
       // Chidori: Lightning arcs at the index finger tip
       if (hand.landmarks.length > 8) {
         const ix = hand.landmarks[8].x * width;
         const iy = hand.landmarks[8].y * height;
         
         // Core
         this.ctx.beginPath();
         this.ctx.arc(ix, iy, 20 + Math.random()*10, 0, Math.PI*2);
         this.ctx.fillStyle = '#ffffff';
         this.ctx.shadowColor = '#00aaff';
         this.ctx.shadowBlur = 40;
         this.ctx.fill();
         
         // Lightning arcs
         for(let i=0; i<4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(ix, iy);
            let lx = ix, ly = iy;
            for(let j=0; j<5; j++) {
                lx += (Math.random()-0.5)*80;
                ly += (Math.random()-0.5)*80;
                this.ctx.lineTo(lx, ly);
            }
            this.ctx.strokeStyle = Math.random() > 0.5 ? '#ffffff' : '#88ccff';
            this.ctx.lineWidth = 2 + Math.random()*4;
            this.ctx.stroke();
         }
         
         // Sparks
         this.particles.push({
           x: ix, y: iy,
           vx: (Math.random()-0.5)*30, vy: (Math.random()-0.5)*30,
           life: 0.9, maxLife: 0.9, color: '#ffffff', size: 4, type: 'spark'
         });
       }
    } else if (spell === 'doctor_strange_shield') {
       // Doctor Strange: intricate glowing mandala
       this.ctx.save();
       this.ctx.translate(cx, cy);
       this.ctx.strokeStyle = '#ffaa00';
       this.ctx.shadowColor = '#ff5500';
       this.ctx.shadowBlur = 20;
       
       // Outer ring
       this.ctx.rotate(time * 2);
       this.ctx.lineWidth = 4;
       this.ctx.beginPath(); this.ctx.arc(0, 0, 100, 0, Math.PI*2); this.ctx.stroke();
       this.ctx.lineWidth = 1;
       this.ctx.beginPath(); this.ctx.arc(0, 0, 110, 0, Math.PI*2); this.ctx.stroke();
       
       // Runic inner text
       this.ctx.font = 'bold 18px monospace';
       this.ctx.fillStyle = '#ffaa00';
       for (let i = 0; i < 12; i++) {
          this.ctx.rotate(Math.PI / 6);
          this.ctx.fillText('᚛ᚈᚎ', 75, 6);
       }
       
       // Inner geometry
       this.ctx.rotate(-time * 4);
       this.ctx.lineWidth = 3;
       this.ctx.beginPath();
       for(let i=0; i<3; i++) {
           this.ctx.rect(-60, -60, 120, 120);
           this.ctx.rotate(Math.PI/3);
       }
       this.ctx.stroke();
       
       // Inner circles
       this.ctx.beginPath(); this.ctx.arc(0, 0, 45, 0, Math.PI*2); this.ctx.stroke();
       this.ctx.beginPath(); this.ctx.arc(0, 0, 20, 0, Math.PI*2); this.ctx.stroke();
       
       this.ctx.restore();
       
       // Embers flying off
       if (Math.random() < 0.5) {
          const angle = Math.random() * Math.PI * 2;
          this.particles.push({
             x: cx + Math.cos(angle)*100, y: cy + Math.sin(angle)*100,
             vx: (Math.random()-0.5)*2, vy: 1 + Math.random()*3, // Fall down like sparks
             life: 3.0, maxLife: 4.5, color: '#ffaa00', size: 3 + Math.random()*2, type: 'spark'
          });
       }
    } else if (spell === 'rasengan') {
       // Rasengan: Rotating sphere of dense chakra
       this.ctx.save();
       this.ctx.translate(cx, cy);
       
       // Aura
       this.ctx.beginPath();
       this.ctx.arc(0, 0, 60 + Math.sin(time*20)*5, 0, Math.PI*2);
       this.ctx.fillStyle = 'rgba(150, 220, 255, 0.4)';
       this.ctx.shadowColor = '#0088ff';
       this.ctx.shadowBlur = 40;
       this.ctx.fill();

       // Core
       this.ctx.beginPath();
       this.ctx.arc(0, 0, 30, 0, Math.PI*2);
       this.ctx.fillStyle = '#ffffff';
       this.ctx.fill();
       
       // High-speed swirls
       this.ctx.rotate(time * 25);
       this.ctx.beginPath();
       this.ctx.arc(15, 0, 30, 0, Math.PI, false);
       this.ctx.lineWidth = 6;
       this.ctx.strokeStyle = '#ffffff';
       this.ctx.stroke();
       
       this.ctx.rotate(Math.PI/2);
       this.ctx.beginPath();
       this.ctx.arc(15, 0, 30, 0, Math.PI, false);
       this.ctx.stroke();

       this.ctx.restore();
       
       // Fast chakra trails
       for(let i=0; i<4; i++) {
          const angle = Math.random() * Math.PI*2;
          this.particles.push({
            x: cx + Math.cos(angle)*50, y: cy + Math.sin(angle)*50,
            vx: Math.cos(angle + Math.PI/2)*20, vy: Math.sin(angle + Math.PI/2)*20,
            life: 0.9, maxLife: 0.9, color: '#aaddff', size: 4, type: 'spark'
          });
       }
    } else if (spell === 'thanos_snap') {
       // Thanos Snap: Disintegrating ash and golden cosmic dust
       for(let i=0; i<6; i++) {
          const isGold = Math.random() < 0.15;
          this.particles.push({
            x: cx + (Math.random()-0.5)*200, y: cy + (Math.random()-0.5)*200,
            vx: (Math.random()-0.5)*3 + 3, // Drift to the right like ash
            vy: -Math.random()*4 - 1,      // Float up slightly
            life: 6 + Math.random()*9,
            maxLife: 15,
            color: isGold ? '#ffd700' : 'rgba(100, 100, 100, 0.7)',
            size: isGold ? 3 : 4 + Math.random()*5,
            type: 'dust'
          });
       }
    }
  }
}
