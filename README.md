# 🧙‍♂️ Spellcaster Arena

**Turn your webcam into an Anime & Pop-Culture Magic Battleground!**

Spellcaster Arena uses **MediaPipe 3D Hand Tracking** and a high-performance **Next.js WebGL/Canvas Particle Engine** to let you cast iconic spells from your favorite anime and movies in real-time using just your hands. No VR headset or controllers required—just you, your hands, and your browser.

---

## 🌟 Legendary Powers & Gestures

Make sure your hands are clearly visible to your webcam. Use the following exact hand signs to trigger these epic, visually stunning attacks:

| Power | Exact Gesture to Perform | Effect |
|---|---|---|
| **💥 Kamehameha** (*Dragon Ball*) | **The Fist:** Close all fingers on one hand into a tight fist and hold it for half a second. | Fire a massive, screen-spanning laser beam with lightning coils. |
| **⚡ Chidori** (*Naruto*) | **The Index:** Keep your hand closed, but extend *only* your Index finger pointing up. | Shoot crackling procedural electrical arcs from your fingertips. |
| **🌀 Rasengan** (*Naruto*) | **The Thumb:** Keep your hand closed, but extend *only* your Thumb pointing out (Thumbs Up). | Conjure a roaring high-speed swirling blue chakra orb. |
| **✨ Eldritch Shield** (*Dr. Strange*) | **Two Open Palms:** Hold *both* hands up to the camera with all five fingers wide open on each hand. | Summon glowing, spinning runic magic shields to deflect Boss attacks. |
| **🫰 Infinity Snap** (*Thanos*) | **The Pinch:** Bring your thumb and index finger tips together (pinch) while keeping other fingers closed. | Dissolve targets into floating dust particles with a golden flash. |

> **Pro-Tip:** Make sure your background isn't too cluttered and the lighting is decent so the MediaPipe AI can track your fingers accurately!

*(All spells feature zero-dependency procedurally generated Web Audio sound effects!)*

---

## 🎮 Game Modes

1. **Boss Duel ("Shadow Ryomen")**: Battle an AI boss that fires dark orbs and meteors at you. Raise your **Eldritch Shield** to deflect projectiles, and counter-attack with a **Kamehameha** or **Chidori**!
2. **Jutsu Dojo**: Practice your jutsu execution and aim on flying mystic targets to build your combo multiplier and rank up from *Genin* to *Grand Archmage*.
3. **Freeform Sandbox**: Test spells with infinite mana and no cooldowns in an open particle playground.

---

## 🚀 How to Run (Local Setup)

The system requires two components running simultaneously: the Python Computer Vision backend and the Next.js frontend.

### 1. Start the Python Backend
Install the dependencies if you haven't already:
```bash
pip install -r requirements.txt
```
Then run the gesture tracking server:
```bash
python gesture_controller.py
```
*(Pro Tip: You can use your phone camera over WiFi instead of a webcam by running `python gesture_controller.py --phone`)*

### 2. Start the Frontend Arena
In a separate terminal, install the Node dependencies:
```bash
npm install
```
Then start the Next.js server:
```bash
npm run dev
```

### 3. Play!
Open your browser and navigate to: **[http://localhost:3000/spellcaster](http://localhost:3000/spellcaster)**

---

## 🛠️ Tech Stack (100% Free & Open-Source)

- **Computer Vision**: [MediaPipe](https://github.com/google-ai-edge/mediapipe) & [OpenCV](https://opencv.org/)
- **Frontend Framework**: [Next.js](https://nextjs.org/) & React
- **VFX & Rendering**: HTML5 Canvas & Custom Particle Physics Engine
- **Audio**: Procedural Web Audio API Synthesizer (No MP3s used!)
- **Communication**: WebSockets (Sub-millisecond latency for real-time 3D landmark streaming)

---

> Made with ❤️ by **LaughingHermit** 
