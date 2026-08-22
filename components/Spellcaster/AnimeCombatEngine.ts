import { BossState, FloatingText, SpellTriggerEvent, BossAttack, DojoTarget } from './types';
import { animeAudio } from './AnimeAudioSynth';

export class AnimeCombatEngine {
  public boss: BossState | null = null;
  public floatingTexts: FloatingText[] = [];
  public score: number = 0;
  
  public dojoTargets: DojoTarget[] = [];
  
  public startBossFight() {
    this.boss = {
      name: 'Ryomen',
      title: 'The Cursed Shadow',
      hp: 10000,
      maxHp: 10000,
      shield: 2000,
      maxShield: 2000,
      phase: 1,
      state: 'idle',
      attacks: [],
      weakness: 'kamehameha'
    };
    this.score = 0;
    this.spawnFloatingText("BOSS BATTLE INITIATED", 400, 300, 'red', 40);
    animeAudio.playDomainExpansion(); // Epic start sound
  }

  public update(deltaTime: number, width: number, height: number) {
    if (this.boss) {
      this.updateBoss(deltaTime, width, height);
    }
    
    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * deltaTime * 60;
      ft.alpha -= 0.01 * deltaTime * 60;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private updateBoss(dt: number, width: number, height: number) {
    if (!this.boss || this.boss.state === 'defeated') return;
    
    // Simple Boss AI logic
    if (this.boss.state === 'idle') {
      if (Math.random() < 0.01) {
        this.boss.state = 'attacking';
        // Spawn attack
        this.boss.attacks.push({
          id: Date.now().toString(),
          type: 'dark_orb',
          x: width / 2,
          y: 200,
          vx: (Math.random() - 0.5) * 5,
          vy: 3 + Math.random() * 2,
          radius: 20,
          damage: 10,
          color: 'black',
          glowColor: 'purple'
        });
      }
    }
    
    // Update attacks
    for (let i = this.boss.attacks.length - 1; i >= 0; i--) {
      const atk = this.boss.attacks[i];
      atk.x += atk.vx * dt * 60;
      atk.y += atk.vy * dt * 60;
      
      // If attack goes off screen
      if (atk.y > height + 50 || atk.x < -50 || atk.x > width + 50 || atk.y < -50) {
        this.boss.attacks.splice(i, 1);
        continue;
      }
      
      // Check collision with boss if reflected
      if (atk.reflected && atk.y < 200) {
        this.damageBoss(150, true);
        this.boss.attacks.splice(i, 1);
        animeAudio.playBossHit(true);
      }
    }
    
    // Phase transitions
    if (this.boss.hp < this.boss.maxHp * 0.5 && this.boss.phase === 1) {
      this.boss.phase = 2;
      this.spawnFloatingText("PHASE 2: ENRAGED", width/2 - 100, 300, 'orange', 40);
      animeAudio.playBossHit(true);
    }
    
    if (this.boss.hp <= 0) {
      this.boss.state = 'defeated';
      this.spawnFloatingText("BOSS DEFEATED", width/2 - 120, 300, 'gold', 50);
      animeAudio.playHollowPurpleBlast(); // Massive explosion
    }
  }

  public handleSpellHit(event: SpellTriggerEvent) {
    if (!this.boss || this.boss.state === 'defeated') return;
    
    // Reflect attacks if using shield
    if (event.spell === 'doctor_strange_shield' || event.spell === 'two_palms') {
      let deflected = false;
      this.boss.attacks.forEach(atk => {
        if (!atk.reflected && atk.y > 300) { // If close to player
           atk.reflected = true;
           atk.vy = -atk.vy * 1.5;
           atk.vx = (Math.random() - 0.5) * 2;
           atk.color = 'orange';
           atk.glowColor = 'yellow';
           deflected = true;
        }
      });
      if (deflected) animeAudio.playShieldDeflect();
      return;
    }
    
    // Deal damage to boss
    let damage = 0;
    let isCrit = false;
    
    if (event.spell === 'kamehameha' && event.stage === 'fire') {
      damage = 500 * event.power;
      if (this.boss.weakness === 'kamehameha') isCrit = true;
    } else if (event.spell === 'hollow_purple') {
      damage = 800;
      isCrit = true;
    } else if (event.spell === 'chidori') {
      damage = 150;
    } else if (event.spell === 'rasengan') {
      damage = 250;
    }
    
    if (damage > 0) {
      if (isCrit) damage *= 2;
      this.damageBoss(damage, isCrit);
      animeAudio.playBossHit(isCrit);
    }
  }

  private damageBoss(amt: number, isCrit: boolean) {
    if (!this.boss) return;
    let actualDamage = amt;
    
    if (this.boss.shield > 0) {
       this.boss.shield -= amt;
       if (this.boss.shield < 0) {
         actualDamage = -this.boss.shield;
         this.boss.shield = 0;
       } else {
         actualDamage = 0;
       }
    }
    
    if (actualDamage > 0) {
      this.boss.hp = Math.max(0, this.boss.hp - actualDamage);
    }
    
    this.score += amt;
    this.spawnFloatingText(`-${Math.floor(amt)}`, 400 + (Math.random()-0.5)*100, 200 + (Math.random()-0.5)*50, isCrit ? '#ff00ff' : '#ff5500', isCrit ? 36 : 24, isCrit);
  }

  public spawnFloatingText(text: string, x: number, y: number, color: string, size: number, isCrit: boolean = false) {
    this.floatingTexts.push({
      id: Date.now() + Math.random().toString(),
      text,
      x,
      y,
      color,
      size,
      alpha: 1.0,
      vy: -1,
      isCrit
    });
  }
}
