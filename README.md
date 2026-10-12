#### write a prompt for a offline mobile PWA chess program that is as smart as possible. Suggest cool features
```

Act as an expert full-stack web and systems engineer specializing in WebAssembly (Wasm), high-performance client-side PWAs, and chess software development.

Build a mobile-first, fully offline Progressive Web App (PWA) chess engine named "DeepPocket". The application must deliver the strongest possible chess AI running purely client-side on mobile browsers without requiring any backend server.

### 1. Architecture & Engine Requirements
- Engine Integration: Run a compiled WebAssembly port of Stockfish 16+ (using WebAssembly SIMD and Web Workers / SharedArrayBuffer where supported, with an automatic fallback to single-threaded Wasm for restricted mobile environments).
- Performance & UI Decoupling: Ensure all UCI communication runs in a dedicated Web Worker so engine calculations never block the 60/120fps UI render thread.
- Memory & Battery Optimization: Provide dynamic hash table sizing (e.g., 16MB default on mobile, scalable to 128MB+), configurable depth/node limits, and automatic engine throttling to prevent battery drain and thermal throttling on smartphones.
- State & Move Validation: Use `chess.js` (or a high-performance bitboard equivalent) for board state, move legality, FEN/PGN import/export, and threefold repetition checks.

### 2. Offline PWA Infrastructure
- Service Worker & Cache: Use Workbox / CacheFirst strategy to cache the core app shell, assets, audio files, and all Wasm/NNUE binaries locally upon initial load.
- Local Storage & State: Persist game history, ongoing games, custom opening repertoires, and analysis trees via IndexedDB (using Dexie.js or idb).
- Manifest: Standard PWA manifest configured for `display: "standalone"`, portrait default with landscape rotation lock option, touch icon sets, and offline installability.

### 3. Core Gameplay & Visuals
- Board UI: Responsive board built for touch screens with tap-to-move, drag-and-drop piece snapping, legal move dots, premove indicators, and tactile haptic vibration (via the Navigator Haptic API on supported devices).
- Adaptive ELO Calibration: Calibrate difficulty levels smoothly using Stockfish UCI parameters (`UCI_LimitStrength` + `UCI_Elo` from 800 to 3500+).

### 4. Advanced & "Cool" Feature Set
Please implement the following features:
1. Real-Time Evaluation Bar & Best Line Preview: Live visual bar with engine score (+/- centipawns or mate in N) and dynamic ghost arrows indicating the engine's predicted best lines.
2. Offline Post-Game Review ("Coach Mode"):
   - Instant move classification (Brilliant, Best, Excellent, Inaccuracy, Mistake, Blunder) modeled like major chess platforms.
   - "Why was this a blunder?" interactive prompt showing the engine refutation line.
3. Offline Opening Book & Repertoire Trainer:
   - Pack an embedded Polyglot opening book (or lightweight JSON table) for instant, natural opening play without consuming initial CPU time.
   - An interactive explorer showing ECO codes, opening names, and win/draw rates.
4. "What If" Branching & Retract Mode:
   - Tap any move in the notation pane to branch off into a speculative analysis subline without overwriting the master game tree.
5. "Personalities" & Playstyles:
   - Configurable engine aggression parameters (Aggressive/Tactical, Positional/Grinding, Blunder-prone beginner).
6. Local 2-Player Pass-and-Play:
   - Auto-rotating board view toggle or dual-clock face-to-face mode for playing with someone in person.
7. Lightweight Endgame Tablebases:
   - Provide an option to preload compressed local 3-piece and select 4-piece endgame tablebase heuristics.

### Deliverables
1. Step-by-step tech stack breakdown and recommended libraries (e.g., Stockfish.wasm, Chessground/react-chessboard, Vite/Svelte/React).
2. Service Worker setup for caching heavy Wasm and NNUE evaluation weights cleanly.
3. A functional proof-of-concept showing the Web Worker bridge handling UCI commands (`position`, `go depth`, `uciok`) alongside the board UI.
```

#### what needs to be done to comply with the stockfish license?
```
Stockfish is licensed under the GNU General Public License version 3 (GPLv3) (or any later version). When distributing Stockfish—including compiled WebAssembly binaries (.wasm) and JavaScript glue code (.js) loaded by mobile browsers in a PWA—you must fulfill specific obligations.
Here is what is required to comply with the Stockfish license:
1. Provide the Corresponding Source Code (GPLv3 §6)
Because delivering .wasm and minified .js to client browsers constitutes conveying an executable/object-code form:
What is required: You must make the Corresponding Source code readily accessible to anyone who receives the software under GPLv3 terms.
What this includes:
The C++ source code of the Stockfish engine version used to compile the binary.
The build scripts, Emscripten compilation flags, and glue code used to produce the WebAssembly binary.
Any modifications you made to the engine source code.
How to comply: If you use an unmodified public release (such as Niklas Fiekas's stockfish.js or official Stockfish), provide a direct, permanent link in your app’s UI to the exact source repository and revision used. If you made custom engine changes, you must host your modified source in a public repository (e.g., GitHub) under GPLv3 and link to it.
2. Retain Copyright Notices and Attribute the Authors (GPLv3 §4 & §5)
You must preserve and prominently display all original copyright notices.
Required credits:
Copyright © 2008–2026 by Tord Romstad, Marco Costalba, Joona Kiiski, Gary Linscott, and the Stockfish developers.
WebAssembly compilation and JavaScript port by Niklas Fiekas and community contributors.
In-App Placement: Provide an "About / Open Source Licenses" section in the UI (e.g., within Settings) acknowledging Stockfish and linking to its official project.
3. Include the Full GPLv3 License Text
A complete copy of the GPLv3 license text (COPYING.txt or LICENSE.txt) must be distributed with the application.
In a web application/PWA, this means the file must be directly servable (e.g. at /engine/LICENSE.txt) and linked from within the UI so users can inspect it.
4. Prominently Mark Any Modifications (GPLv3 §5a)
If you alter Stockfish's C++ source code (such as changing evaluation heuristics, modifying the UCI command set, or altering NNUE loading logic), you must explicitly state that the files were modified, along with the date and nature of the changes.
5. Architectural Isolation vs. App Copyleft
A common concern is whether using Stockfish forces your entire frontend codebase (React UI, proprietary styling, database code) to be open-sourced under GPLv3.
UCI as an Independent Process Boundary:
In DeepPocket, Stockfish runs as a decoupled binary inside a dedicated Web Worker.
The main application communicates with Stockfish exclusively over standard asynchronous message passing via the public Universal Chess Interface (UCI) protocol (sending text strings like position ... and go depth 12).
Under the Free Software Foundation’s (FSF) guidelines, communicating with a GPL program as a separate worker/subprocess over standard IPC or command-line protocols is generally considered separate, independent programs rather than a single derivative work.
However: The engine worker files themselves (stockfish.wasm, stockfish.wasm.js, stockfish.js) are strictly covered by GPLv3 and cannot be closed-source or re-licensed.
6. No Additional Restrictions (GPLv3 §10)
You cannot impose DRM, non-commercial restrictions, or terms that prohibit users from extracting, inspecting, modifying, or recompiling the Stockfish engine portion of the software.
What Has Been Configured in DeepPocket:
Full License Text: The complete GPLv3 text has been placed at /public/engine/LICENSE.txt.
In-App Attribution: The Engine & App Settings modal includes a dedicated Stockfish GPLv3 Compliance card with:
Full author copyright notice.
Link to view the license text directly (/engine/LICENSE.txt).
Direct links to the upstream Official Stockfish Repository and the stockfish.js WebAssembly Repository.
Decoupled Web Worker Bridge: All UCI communication is strictly isolated in a Web Worker, maintaining clean boundaries.

```
