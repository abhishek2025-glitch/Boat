The html.index is now working. You follow this prompt :-  ################################################################################
#
#   M A E L S T R O M
#   "Survive the Sea. Outlast the Storm. Rule the Deep."
#
#   Web Game Design Prompt — Full Production Document
#   Asset Base : Kenney Pirate Kit (CC0 1.0)
#   Format     : Browser Web Game (Three.js / WebGL)
#   Genre      : Naval Survivor Roguelite + .io Leaderboard Layer
#   Trend Ref  : Vampire Survivors × Agar.io × Diep.io
#   Target     : $10,000/month revenue
#   Version    : 1.0
#
################################################################################


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 1 — GAME IDENTITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

identity:

  title: "MAELSTROM"
  subtitle: "Survive the Sea. Outlast the Storm."

  one_line_pitch: >
    A pirate naval survivor where you pilot a lone ship through endless
    enemy fleets, auto-fire cannons, collect treasure upgrades, and grow
    into an unstoppable armada — all in your browser, in under 30 minutes.

  genre_tags:
    - "Roguelite Survivor (Vampire Survivors format)"
    - "Naval Action"
    - ".io Leaderboard"
    - "Auto-Battler"
    - "Browser / WebGL"

  trend_analysis: >
    VAMPIRE SURVIVORS became the #1 indie game trend of 2023–2025 with
    300M+ downloads. Its formula — move to survive, auto-attack, collect
    upgrades — is the most replicated genre on web platforms right now.
    NO PIRATE NAVAL VERSION dominates this space yet. That is the gap.
    MAELSTROM fills it. Add a global leaderboard (.io layer) and daily
    challenge mode and you have three viral sharing hooks baked in at launch.

  comparable_titles:
    - title: "Vampire Survivors"
      lesson: "Auto-combat loop is addictive and infinitely replayable"
    - title: "Agar.io"
      lesson: "Leaderboard + grow mechanic = obsessive short sessions"
    - title: "Diep.io"
      lesson: "Ship/tank upgrades mid-session feel rewarding immediately"
    - title: "Krunker.io"
      lesson: "Browser-native keeps friction at zero — no install needed"
    - title: "Survivor.io (mobile)"
      lesson: "Proved naval/arena survivor is massively monetizable"

  platform:
    primary: "Browser (WebGL via Three.js or Babylon.js)"
    hosting:
      - "Custom domain: playmaelstrom.com (owned, SEO authority)"
      - "itch.io (community discovery, pay-what-you-want)"
      - "CrazyGames.com (portal deal — CPM revenue share)"
      - "Poki.com (portal deal — $1–$3 CPM, top tier)"
      - "Newgrounds (nostalgia audience + organic traffic)"
      - "GameMonetize.com (embed licensing)"
    secondary: "Mobile browser (responsive controls)"
    future: "PWA installable — feels like native app without store"

  session_length:
    target: "8–20 minutes per run"
    rationale: >
      Long enough to feel invested. Short enough to play during lunch.
      Death sends you to upgrade screen immediately — no dead time.
      "One more run" psychology is the core addiction loop.

  art_direction:
    style: "Low-poly cartoon 3D — isometric top-down camera"
    color_palette:
      sea: "#1a6fa8 deep ocean blue with animated Perlin noise waves"
      sand: "#e8c97d warm sandy islands"
      ships: "Warm terracotta brown (Kenney default colormap.png)"
      ghost: "#4dff9b toxic green glow — instantly recognizable"
      ui: "Dark navy + gold — classic pirate aesthetic"
    lighting: "Single directional light, soft shadows, cartoon rim light on player ship"
    camera:
      type: "Isometric top-down, slight tilt (35° angle)"
      zoom: "Dynamic — zooms out as player grows fleet, zooms in during close combat"
      follow: "Smooth lerp follow on player flagship — never snaps"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 2 — CORE GAMEPLAY LOOP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

core_loop:

  philosophy: >
    The player MOVES. Everything else is AUTOMATIC.
    Cannons auto-fire at nearest enemy. Ships auto-follow the flagship.
    Player's only job: dodge, position, choose upgrades.
    This is why Vampire Survivors works — it strips input to the pure
    strategic layer. MAELSTROM does the same on open ocean.

  loop_diagram: |
    ┌─────────────────────────────────────────────────────┐
    │  START RUN → Pilot lone Sloop on open ocean         │
    │       ↓                                             │
    │  SURVIVE → Enemy ships swarm from all directions    │
    │       ↓                                             │
    │  AUTO-FIRE → Cannons shoot nearest enemies          │
    │       ↓                                             │
    │  COLLECT → Doubloons drop from defeated ships       │
    │       ↓                                             │
    │  LEVEL UP → Choose 1 of 3 upgrade cards             │
    │       ↓                                             │
    │  GROW → Unlock new ship types, weapons, abilities   │
    │       ↓                                             │
    │  BOSS WAVE → Giant Ghost Ship at minute 8, 16, 24   │
    │       ↓                                             │
    │  DIE or SURVIVE 30 MIN → Score posted to leaderboard│
    │       ↓                                             │
    │  META UPGRADE → Spend Skulls on permanent buffs     │
    │       ↓                                             │
    │  SHARE SCORE → Viral loop begins                    │
    └─────────────────────────────────────────────────────┘

  moment_to_moment:

    movement:
      scheme: "WASD or Arrow Keys — direct ship control"
      mobile: "Virtual joystick (left thumb) — auto-rendered on touch devices"
      feel: >
        Ship has momentum — not instant stop/start. Feels like a real vessel
        cutting through water. Turning radius differs per ship class.
        Small ships turn fast. Galleons are sluggish but unstoppable.
      water_effect: >
        Animated foam/wake trail follows ship using particle system.
        Ship rocks slightly on procedural wave noise — pure atmosphere.

    auto_combat:
      cannon_fire:
        logic: "Target nearest enemy within range. Fire at set interval. No player input."
        projectile: "cannon-ball.glb — physics arc trajectory, slight gravity"
        visual: "Muzzle flash particle + screen shake on fire (subtle)"
        miss_mechanic: "Enemies dodge slowly — player can improve aim via upgrades"
      fleet_formation:
        logic: >
          As player acquires more ships, they orbit the flagship in formation.
          3 ships = triangle. 5 ships = pentagon. 10 ships = double ring.
          Each fleet ship has its own auto-fire targeting the nearest enemy.
        assets:
          - "boat-row-small.glb (Tier 1 — weak but fast, row-boat flankers)"
          - "ship-pirate-small.glb (Tier 2 — standard attack ship)"
          - "ship-pirate-medium.glb (Tier 3 — heavy broadside)"
          - "ship-pirate-large.glb (Tier 4 — flagship class)"

    enemy_waves:
      spawning: >
        Enemies spawn off-screen in all directions. Wave intensity scales
        every 60 seconds. New enemy TYPES introduced every 3 minutes to
        prevent monotony. The sea always feels alive and escalating.
      enemy_types:
        rowboat_raider:
          model: "boat-row-small.glb"
          role: "Swarm unit — weak, fast, attacks in packs of 10–20"
          behavior: "Beeline straight at player — no dodging"
          drops: "1 Doubloon on death"
          intro: "Minute 0 — present from start"
        sloop_hunter:
          model: "ship-small.glb"
          role: "Skirmisher — medium speed, aimed cannon shots"
          behavior: "Circles player at mid-range, fires cannon every 2 sec"
          drops: "5 Doubloons + 10% chance Chest fragment"
          intro: "Minute 2"
        navy_frigate:
          model: "ship-medium.glb"
          role: "Tank — slow, high HP, fires cannon volleys"
          behavior: "Slow approach, fires 3 cannons simultaneously"
          drops: "15 Doubloons + 25% chance Chest"
          intro: "Minute 5"
        armada_galleon:
          model: "ship-large.glb"
          role: "Elite — very high HP, deploys rowboat minions on death"
          behavior: "Flanking approach, fire-and-reposition"
          drops: "40 Doubloons + guaranteed Chest + Blueprint shard"
          intro: "Minute 10"
        ghost_ship_elite:
          model: "ship-ghost.glb"
          role: "BOSS — appears at minute 8, 16, 24 wave peaks"
          behavior: "Phases through obstacles, spawns ghost-rowboat minions"
          special: "Normal cannonballs deal 50% damage — upgrades needed"
          drops: "200 Doubloons + 3 Chests + guaranteed Rare upgrade card"
          visual: >
            Green emission shader on ship-ghost.glb. Screen edge vignette turns
            teal. Warning icon 10 seconds before spawn. Boss health bar appears
            at top of screen. Epic boss music sting plays.
          intro: "Minute 8 (boss wave)"

    upgrade_system:
      trigger: "Every 100 Doubloons collected → Level Up screen"
      card_count: "Choose 1 of 3 randomly drawn upgrade cards"
      display: >
        Game PAUSES. Three glowing cards appear center screen.
        Each card shows: icon, name, description, rarity color border.
        Rarity: Common (grey), Rare (blue), Epic (purple), Legendary (gold).
        Player clicks/taps card. Game resumes immediately.
      upgrade_categories:

        fleet_expansion:
          name: "Grow Your Armada"
          upgrades:
            - name: "Recruit Rowboats"
              rarity: "Common"
              effect: "Add 2 boat-row-small.glb flankers to fleet"
              icon: "boat-row-small.glb render"
            - name: "Press-Gang Sloops"
              rarity: "Rare"
              effect: "Add 1 ship-pirate-small.glb to fleet orbit"
              icon: "ship-pirate-small.glb render"
            - name: "Commandeer a Brigantine"
              rarity: "Epic"
              effect: "Add 1 ship-pirate-medium.glb — fires double broadside"
              icon: "ship-pirate-medium.glb render"
            - name: "The Flagship Arrives"
              rarity: "Legendary"
              effect: "Add 1 ship-pirate-large.glb — fires 4-cannon volley"
              icon: "ship-pirate-large.glb render"

        weapon_upgrades:
          name: "Arm Your Fleet"
          upgrades:
            - name: "Extra Cannon"
              rarity: "Common"
              effect: "Add +1 cannon to flagship — fires at second-nearest enemy"
              icon: "cannon.glb render"
            - name: "Mobile Cannon"
              rarity: "Rare"
              effect: >
                Deploy cannon-mobile.glb on deck — rotates 360° to track enemies.
                Independent targeting from main cannons.
              icon: "cannon-mobile.glb render"
            - name: "Cannonball Storm"
              rarity: "Epic"
              effect: "Flagship fires 8 cannon-balls in spread pattern — 3 sec cooldown"
              icon: "cannon-ball.glb render (cluster)"
            - name: "Ghost Breaker Rounds"
              rarity: "Legendary"
              effect: "All cannons deal +100% damage to ship-ghost.glb enemies"
              icon: "cannon-ball.glb (green glowing variant)"

        ship_upgrades:
          name: "Upgrade Your Hull"
          upgrades:
            - name: "Reinforce Mast"
              rarity: "Common"
              effect: "Flagship HP +20%. Visual: mast-ropes.glb appears more taut."
              icon: "mast.glb render"
            - name: "Ram Prow"
              rarity: "Rare"
              effect: >
                Flagship deals collision damage to enemies on contact.
                Visual: rocks-a.glb jagged metal prow attachment appears on ship.
              icon: "rocks-a.glb (stylized as metal ram)"
            - name: "Stolen Sails"
              rarity: "Epic"
              effect: "+35% movement speed. Visual: flag-pirate-high.glb flies on mast."
              icon: "flag-pirate-high.glb render"
            - name: "Ghost Hull"
              rarity: "Legendary"
              effect: >
                Flagship becomes semi-transparent (ghost shader) for 8 seconds
                every 30 seconds. While phased: invincible, passes through enemies.
                Visually identical to ship-ghost.glb — players recognize it instantly.
              icon: "ship-ghost.glb render (player-colored)"

        area_abilities:
          name: "Special Powers"
          upgrades:
            - name: "Barrel Bomb"
              rarity: "Common"
              effect: >
                Every 10 seconds, drop 3 barrel.glb mines behind ship.
                Enemies that collide take 50 damage. Barrel model rolls
                slightly before settling on water surface.
              icon: "barrel.glb render"
            - name: "Cannon Tower Deploy"
              rarity: "Rare"
              effect: >
                Tap to place tower-complete-small.glb on water. It auto-fires
                for 20 seconds then sinks. Max 2 active at once.
              icon: "tower-complete-small.glb render"
            - name: "Treasure Lure"
              rarity: "Epic"
              effect: >
                Drop chest.glb decoy — nearby enemies are magnetically
                drawn to it for 5 seconds. Perfect for clustering enemy groups.
              icon: "chest.glb render"
            - name: "Maelstrom Vortex"
              rarity: "Legendary"
              effect: >
                Activate: a massive ocean vortex spawns — sucks in all nearby
                enemies, deals massive damage, sinks rowboats instantly.
                30-second cooldown. Screen shakes. Particle storm.
              icon: "custom vortex swirl icon"

    boss_encounters:
      ghost_ship_boss:
        model: "ship-ghost.glb (2× scale)"
        health_bar: "Displayed at top of screen with ghost skull icon"
        phase_1:
          hp_range: "100%–60%"
          behavior: "Circles player slowly, fires 3-spread ghost cannon-balls"
          minions: "Spawns 5× boat-row-small.glb ghost-painted rowboats every 30 sec"
        phase_2:
          hp_range: "60%–30%"
          behavior: "Charges at player periodically — must dodge"
          minions: "Spawns 2× ship-small.glb ghost variants"
          new_attack: "Drops barrel.glb mines in player's path"
        phase_3:
          hp_range: "30%–0%"
          behavior: "Enrages — speed doubles, fires 6-spread shots"
          visual: >
            ship-ghost.glb turns bright red tint. mast-ropes.glb whip violently.
            All nearby flags (flag-pirate-high.glb) animate chaotically.
        death_sequence: >
          Boss explodes into 20 chest.glb fragments that scatter across water.
          Player ship animation plays victory cannon salute (3 shots).
          XP surge fills level-up bar. Boss kill message posted to leaderboard.

    wave_timeline:
      minute_0_2:
        enemies: ["boat-row-small.glb swarms (10–15 units)"]
        intensity: "Gentle — tutorial feel without being a tutorial"
        music: "Calm sea shanty theme"
      minute_2_5:
        enemies: ["boat-row-small.glb", "ship-small.glb (2–3 units)"]
        intensity: "Moderate — player should feel slightly pressured"
      minute_5_8:
        enemies: ["ship-small.glb", "ship-medium.glb (1–2 units)"]
        intensity: "Challenging — upgrade choices become critical"
      minute_8:
        event: "GHOST SHIP BOSS — First Appearance"
        intensity: "High — boss + swarm simultaneously"
        music: "Boss battle sting"
      minute_8_16:
        enemies: ["All previous types + ship-large.glb Armada Galleon"]
        intensity: "Very High — requires good fleet composition"
        special: "Wreck fields begin appearing — ship-wreck.glb as terrain obstacles"
      minute_16:
        event: "GHOST SHIP BOSS — Second Appearance (harder)"
      minute_16_24:
        enemies: ["All types + Ghost-painted variants of all ships"]
        intensity: "Extreme"
        visual: "Sea color darkens — storm clouds particle layer added"
      minute_24:
        event: "GHOST SHIP BOSS — Third Appearance (mega boss)"
        special: "Two ghost ships simultaneously"
      minute_30:
        event: "SURVIVE! — Victory Screen. Score locked to leaderboard."
        music: "Victory fanfare"
        message: "ONLY 0.3% of players survive 30 minutes. You are a legend."


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 3 — META-PROGRESSION (BETWEEN RUNS)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

meta_progression:

  currency: "Skulls (earned each run based on score — persists on death)"

  skull_earning:
    - "1 Skull per 100 Doubloons collected in a run"
    - "5 Skulls for first boss kill per session"
    - "10 Skulls for surviving 10 minutes"
    - "25 Skulls for 20 minutes"
    - "50 Skulls for full 30-minute survival (extremely rare)"

  upgrade_tree:
    description: >
      Between runs, player spends Skulls on a permanent upgrade tree.
      This is the roguelite meta-layer — each run feels slightly stronger.
      Prevents the game from feeling 'unfair' to new players.
    tree_nodes:
      hull_reinforcement:
        cost: "10 Skulls"
        effect: "Flagship starts with +15% HP"
        icon: "tower-base.glb (stone = armor)"
      starting_fleet:
        cost: "20 Skulls"
        effect: "Start every run with 1 extra boat-row-small.glb"
        icon: "boat-row-small.glb"
      treasure_magnet:
        cost: "15 Skulls"
        effect: "Doubloon pickup radius +30%"
        icon: "chest.glb"
      cannon_master:
        cost: "25 Skulls"
        effect: "All cannons deal +10% base damage"
        icon: "cannon.glb"
      ghost_ward:
        cost: "30 Skulls"
        effect: "Ghost Ship boss spawns 60 seconds later per run"
        icon: "ship-ghost.glb (crossed out)"
      island_anchor:
        cost: "40 Skulls"
        effect: "Unlock Island Anchor ability — drop tower-complete-large.glb that lasts 60 sec"
        icon: "tower-complete-large.glb"
      flag_bearer:
        cost: "50 Skulls"
        effect: "Flagship flies flag-pirate-high.glb — enemies within range have -15% accuracy"
        icon: "flag-pirate-high.glb"
      ghost_hull_mastery:
        cost: "100 Skulls"
        effect: "Ghost Hull legendary upgrade now appears in every 5th upgrade pool"
        icon: "ship-ghost.glb (player variant)"

  starting_ship_unlocks:
    description: >
      Spend Skulls to unlock new starting ships. Each changes playstyle.
      All unlocked via gameplay — never behind a paywall.
    ships:
      the_sloop:
        model: "ship-pirate-small.glb"
        cost: "Starter — free"
        playstyle: "Balanced — recommended for new players"
        passive: "None"
      the_rowboat_gang:
        model: "boat-row-large.glb (oversized flagship)"
        cost: "30 Skulls"
        playstyle: "Swarm — starts with 6 rowboats instead of cannons"
        passive: "Rowboats respawn 5 seconds after sinking"
      the_wraith:
        model: "ship-ghost.glb (player-controlled)"
        cost: "150 Skulls"
        playstyle: "Glass cannon — low HP, phases through enemies once per minute"
        passive: "Ghost cannon-balls deal +50% damage"
        visual_note: >
          Player using ship-ghost.glb as their ship is immediately recognizable
          on death screen and leaderboard. Social prestige skin — drives Skull
          grinding organically.
      the_armada_commander:
        model: "ship-large.glb (repainted)"
        cost: "200 Skulls"
        playstyle: "Fortress — very slow but starts with full tower-complete-small.glb escort"
        passive: "Flagship cannot be destroyed until fleet is fully eliminated"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 4 — .IO LAYER / SOCIAL VIRALITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

io_layer:

  global_leaderboard:
    display: "Top 10 all-time + Top 10 today shown on main menu"
    entries_show: "Player name, ship used, survival time, score, date"
    update_frequency: "Real-time (WebSocket push)"
    backend: "Supabase (free tier covers 500MB — sufficient for 100K+ players)"
    anti_cheat: "Server-side score validation — client sends run replay hash"
    viral_hook: >
      Seeing YOUR name on a global leaderboard in a browser game is a powerful
      sharing trigger. Players screenshot and post to Twitter/Reddit/Discord.
      Leaderboard entry shown prominently after every run — not hidden.

  daily_challenge:
    name: "The Daily Maelstrom"
    description: >
      Every day at midnight UTC, a new FIXED seed run is generated.
      Same seed for ALL players worldwide that day.
      All players experience the exact same enemy patterns, upgrade cards,
      and boss spawn timing. Level playing field.
    sharing_hook: >
      After completing daily challenge, player gets a shareable card showing:
      - Their score vs global average
      - Specific achievements ("Survived the Ghost Fleet!" )
      - Emoji-style visualization of their upgrade path
      Format inspired by Wordle sharing cards — proven viral template.
    example_share_text: |
      🏴‍☠️ MAELSTROM Daily #47
      ⚓ Survived: 18:32
      ⚔️  Score: 47,220
      🎯 Fleet: ⛵⛵🚢🚢🏴
      💀 Killed by: Ghost Ship Boss (Phase 2)
      playmaelstrom.com

  ghost_replay:
    description: >
      After your run ends, a ghost of your last run automatically plays
      in the background of the main menu — your own ship-ghost.glb tinted
      version sailing the route you took. Purely atmospheric but deeply
      personal. Players notice it and feel attached to their run.
    top_player_ghosts: >
      Top 3 leaderboard runs are visible as ghost-ship.glb outlines
      drifting on the main menu sea. Players can see legends' paths.
      Creates aspiration and community identity.


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 5 — GAME MODES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

game_modes:

  classic_survival:
    name: "Open Ocean"
    description: "Survive as long as possible. No time limit."
    unlock: "Default — available immediately"
    scoring: "Doubloons collected × survival multiplier"
    leaderboard: "All-time + Daily"

  treasure_hunt:
    name: "The Treasure Run"
    description: >
      A procedurally generated island appears at the map center. It is
      ringed by castle-wall.glb, tower-complete-large.glb defenders, and
      cannon.glb emplacements. Player must break through defenses and
      reach the chest.glb at the center. Timer = 10 minutes. Enemy ships
      attack from the sea simultaneously. Score = speed of capture.
    assets_used:
      - "castle-wall.glb, castle-gate.glb (island perimeter)"
      - "tower-complete-large.glb, tower-complete-small.glb (auto-defense)"
      - "cannon.glb (wall-mounted emplacement)"
      - "chest.glb (win condition — center of island)"
      - "patch-sand.glb, palm-straight.glb (island terrain)"
      - "structure-platform-dock.glb (island dock — extra enemy spawn point)"
    unlock: "Survive 10 minutes in Open Ocean mode"

  ghost_fleet:
    name: "Curse of the Deep"
    description: >
      HARD MODE. All enemies are replaced with ghost ship variants.
      Player starts with Ghost Breaker rounds active. Eerie green filter
      on entire game. Constant haunting soundtrack. No wreck loot drops —
      only bottle.glb (map fragments) that extend run timer. Survive
      20 minutes to unlock The Wraith starting ship permanently.
    visual: >
      Sea turns dark teal. Sky becomes overcast particle layer.
      All enemy ships use ship-ghost.glb shader (translucent green).
      bottle.glb glows on water surface for dramatic visibility.
    unlock: "Kill Ghost Ship Boss 3 times in any mode"

  island_fortress:
    name: "Defend the Fort"
    description: >
      Player builds a castle BEFORE the wave starts. Given 60 seconds and
      a fixed budget of 1000 Gold. Place castle-wall.glb, tower-base/middle/top.glb
      segments, cannon.glb emplacements, structure-fence.glb perimeter.
      Then enemy fleet attacks in 10 waves. Fortress must survive all 10.
      Dragging and placing modular buildings mid-wave is allowed but costs extra.
    builder_phase:
      duration: "60 seconds"
      budget: "1000 Gold"
      placeable_assets:
        - "castle-wall.glb — 50 Gold per segment"
        - "castle-gate.glb — 100 Gold (required at least 1)"
        - "castle-window.glb — 75 Gold (adds cannon slot to wall)"
        - "tower-base.glb — 150 Gold"
        - "tower-middle.glb — 100 Gold (requires base)"
        - "tower-top.glb — 125 Gold (requires middle)"
        - "tower-roof.glb — 50 Gold (decorative, adds 10% fire rate)"
        - "structure-fence.glb — 25 Gold (weak outer perimeter)"
        - "cannon.glb — 200 Gold (placed on wall-window or ground)"
        - "tower-watch.glb — 100 Gold (doubles cannon range nearby)"
    wave_phase:
      waves: 10
      wave_1_3: "boat-row-small.glb swarms (easy)"
      wave_4_6: "ship-small.glb + ship-medium.glb (medium)"
      wave_7_9: "ship-large.glb + rowboat hordes (hard)"
      wave_10: "ship-ghost.glb BOSS final assault"
    unlock: "Complete The Treasure Run mode"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 6 — WORLD & VISUAL DESIGN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

world_design:

  ocean:
    description: >
      Infinite tiling ocean with animated Perlin noise vertex displacement.
      No static floor — the sea MOVES. Ship wakes trail behind all vessels.
      Foam particles at wave crests.
    color: "Deep blue #1a6fa8 in normal zones, teal #0d4a3e in Curse mode"
    horizon: "Subtle fog gradient — objects fade at distance, creates depth"
    time_of_day: >
      Real-time clock affects lighting. Daytime = bright warm sun.
      After midnight = night mode — darker ocean, ship lanterns glow,
      ghost ships more visible. Night runs are harder (less visibility)
      but reward +25% Skulls. Purely based on player's local clock.

  environmental_obstacles:
    rock_formations:
      models: ["rocks-a.glb", "rocks-b.glb", "rocks-c.glb",
               "rocks-sand-a.glb", "rocks-sand-b.glb", "rocks-sand-c.glb"]
      placement: "Randomly scattered on map — act as cover and obstacles"
      mechanic: >
        Ships that collide with rocks take damage. Player can use rocks
        strategically — lead enemies into rock clusters.
        Enemy AI pathfinds around rocks but swarm units don't (exploit them).

    shipwrecks:
      model: "ship-wreck.glb"
      placement: >
        Spawn at location where any large ship (ship-large.glb or boss) dies.
        Persist for the rest of the run. Build up into a dramatic graveyard.
      mechanic: >
        Wrecks are solid obstacles — block cannon-balls and ship movement.
        They can be used as temporary cover. After minute 15, the map becomes
        littered with wrecks from both sides — tactically complex terrain.
      loot: "Always contain a few barrel.glb and crate.glb pickups — reward investigation"

    drift_debris:
      models: ["crate.glb", "barrel.glb", "crate-bottles.glb"]
      placement: "Randomly floating on sea surface — scattered constantly"
      mechanic: "Pick up by sailing through. Grants 5–25 Doubloons or 1 Skull"
      visual: "Gentle bobbing animation on wave offset — very satisfying to collect"

    treasure_islands:
      models:
        terrain: ["patch-sand.glb", "patch-grass.glb", "patch-sand-foliage.glb",
                  "patch-grass-foliage.glb"]
        flora: ["palm-bend.glb", "palm-straight.glb", "palm-detailed-bend.glb",
                "palm-detailed-straight.glb", "grass.glb", "grass-patch.glb", "grass-plant.glb"]
        props: ["hole.glb", "chest.glb", "barrel.glb"]
      placement: "1–3 per map, procedurally generated each run"
      mechanic: >
        Islands are magnetic loot points — sail near to collect chest.glb drops.
        But islands also attract enemy ships which use them as rally points.
        Risk/reward: do you sail toward the island for loot and face more enemies?

    flag_markers:
      models: ["flag.glb", "flag-pirate.glb", "flag-high.glb", "flag-pirate-high.glb",
               "flag-pennant.glb", "flag-pirate-pennant.glb",
               "flag-pirate-high-pennant.glb", "flag-high-pennant.glb"]
      placement: "Appear on islands and at boss spawn locations"
      mechanic: >
        Pirate flags mark enemy territory — more enemies spawn near pirate flags.
        Navy flags mark armada territory — ship-large.glb patrols in that zone.
        Player can destroy flags (sail through) — removes spawn bonus for that zone.
        Planting your own flag.glb on an island is a visual landmark — helps
        orient the player on the infinite map.

    bottle_messages:
      model: "bottle.glb + bottle-large.glb"
      placement: "Float randomly on surface, glow softly for visibility"
      mechanic: >
        Collecting bottle.glb reveals a random upgrade card (bonus, in addition
        to normal level-up). bottle-large.glb is rarer — reveals a rare or epic card.
        Visual: bottle bobs dramatically, emits sparkle particles.
        Sound: satisfying 'uncork' pop on pickup.

    tools_as_power_ups:
      tool_shovel:
        model: "tool-shovel.glb"
        appears: "On treasure islands near hole.glb markers"
        mechanic: "Pick up to trigger a dig animation — reveals buried chest.glb instantly"
        visual: "Shovel sticks upright in sand, glows gold when collectible"
      tool_paddle:
        model: "tool-paddle.glb"
        appears: "Floating on ocean surface randomly"
        mechanic: "Pick up: all rowboat-class fleet units get +40% speed for 20 seconds"
        visual: "Paddle floats flat on surface, spins slowly"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 7 — FULL ASSET MAP (All 71 Models Accounted For)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

asset_map:

  ships:
    player_ships:
      - model: "ship-pirate-small.glb"
        use: "Default starting flagship — Sloop class"
      - model: "ship-pirate-medium.glb"
        use: "Fleet ship (Rare upgrade card) + Brigantine class unlock"
      - model: "ship-pirate-large.glb"
        use: "Fleet ship (Legendary card) + Armada Commander meta-unlock"
      - model: "ship-ghost.glb"
        use: "The Wraith starting ship (meta-unlock) + boss enemy"
    enemy_ships:
      - model: "ship-small.glb"
        use: "Sloop Hunter enemy (Minute 2+)"
      - model: "ship-medium.glb"
        use: "Navy Frigate enemy (Minute 5+)"
      - model: "ship-large.glb"
        use: "Armada Galleon elite enemy (Minute 10+)"
      - model: "ship-wreck.glb"
        use: "Persistent battlefield wreck / Ruins Island feature"
    utility:
      - model: "boat-row-small.glb"
        use: "Rowboat Raider swarm enemy / fleet flanker upgrade"
      - model: "boat-row-large.glb"
        use: "Rowboat Gang starting flagship (meta-unlock)"

  weapons:
    - model: "cannon.glb"
      use: "Fixed ship cannon / tower emplacements / Island Fortress mode"
    - model: "cannon-mobile.glb"
      use: "Mobile Cannon Rare upgrade card / enemy ship armament"
    - model: "cannon-ball.glb"
      use: "Physics projectile for all cannon types — core visual of combat"

  fortifications:
    - model: "castle-wall.glb"
      use: "Island Fortress builder mode — perimeter wall"
    - model: "castle-gate.glb"
      use: "Island Fortress — required entry gate (1 min), Treasure Hunt ring"
    - model: "castle-door.glb"
      use: "Secondary entrance in Treasure Hunt island"
    - model: "castle-window.glb"
      use: "Wall cannon slot in Island Fortress mode"
    - model: "tower-base.glb"
      use: "Tier 1 tower in Island Fortress builder"
    - model: "tower-base-door.glb"
      use: "Alternate tower base variant in Island Fortress (cosmetic)"
    - model: "tower-middle.glb"
      use: "Tier 2 tower body in builder"
    - model: "tower-middle-windows.glb"
      use: "Tier 3 tower body with archer slots"
    - model: "tower-top.glb"
      use: "Tier 3 tower crown"
    - model: "tower-roof.glb"
      use: "Tier 4 tower decorative roof (+fire rate bonus)"
    - model: "tower-complete-small.glb"
      use: "Deployable Cannon Tower Rare upgrade (placed on water)"
    - model: "tower-complete-large.glb"
      use: "Island Anchor Legendary meta-upgrade / Treasure Hunt defender"
    - model: "tower-watch.glb"
      use: "Watchtower in Island Fortress mode (doubles cannon range nearby)"

  structures:
    - model: "structure.glb"
      use: "Island center building in Treasure Hunt / Island Fortress"
    - model: "structure-roof.glb"
      use: "Barracks roof in Treasure Hunt island"
    - model: "structure-fence.glb"
      use: "Outer perimeter in Island Fortress (weak, cheap)"
    - model: "structure-fence-sides.glb"
      use: "Fence corner connector in Island Fortress builder"
    - model: "structure-platform.glb"
      use: "Elevated dock section in Treasure Hunt island"
    - model: "structure-platform-small.glb"
      use: "Small raised platform in island environments"
    - model: "structure-platform-dock.glb"
      use: "Enemy spawn dock in Treasure Hunt / Island Fortress"
    - model: "structure-platform-dock-small.glb"
      use: "Small dock on procedural islands"
    - model: "platform.glb"
      use: "Bridge connector between structures on islands"
    - model: "platform-planks.glb"
      use: "Wooden walkway on dock environments — atmosphere"
    - model: "mast.glb"
      use: "Breakable ship component — shoot mast to slow enemy ship"
    - model: "mast-ropes.glb"
      use: "Mast rigging animation — whips violently during Ghost Ship boss"

  terrain:
    - model: "patch-sand.glb"
      use: "Base tile for all procedural islands"
    - model: "patch-sand-foliage.glb"
      use: "Beach trim tile on islands"
    - model: "patch-grass.glb"
      use: "Island elevated interior tile"
    - model: "patch-grass-foliage.glb"
      use: "Dense foliage tile in island center"
    - model: "grass.glb"
      use: "Scattered grass detail decoration"
    - model: "grass-patch.glb"
      use: "Grass cluster decoration on islands"
    - model: "grass-plant.glb"
      use: "Individual plant decoration"
    - model: "rocks-a.glb"
      use: "Ocean rock formation obstacle (cluster type A)"
    - model: "rocks-b.glb"
      use: "Ocean rock formation obstacle (cluster type B)"
    - model: "rocks-c.glb"
      use: "Ocean rock formation obstacle (cluster type C)"
    - model: "rocks-sand-a.glb"
      use: "Sandy beach boulder — island edge obstacle"
    - model: "rocks-sand-b.glb"
      use: "Sandy rock cluster — island edge"
    - model: "rocks-sand-c.glb"
      use: "Sandy boulder — island scatter"
    - model: "palm-bend.glb"
      use: "Bent palm on islands — atmosphere"
    - model: "palm-straight.glb"
      use: "Straight palm on islands"
    - model: "palm-detailed-bend.glb"
      use: "High-detail palm in Treasure Hunt / Ghost Fleet islands"
    - model: "palm-detailed-straight.glb"
      use: "High-detail straight palm in premium zones"
    - model: "hole.glb"
      use: "Dig result on islands — empty or leads to chest.glb / tool-shovel activation"

  props:
    - model: "chest.glb"
      use: "Primary loot drop from boss kills / island center objective / Treasure Lure ability"
    - model: "barrel.glb"
      use: "Barrel Bomb ability mine / floating debris loot / ship cargo atmosphere"
    - model: "bottle.glb"
      use: "Floating bonus upgrade trigger / bottle-message system"
    - model: "bottle-large.glb"
      use: "Rare upgrade trigger (guaranteed Rare/Epic card)"
    - model: "crate.glb"
      use: "Floating drift debris — minor loot collection"
    - model: "crate-bottles.glb"
      use: "Rum crate drift debris — grants Skull currency on pickup"

  tools:
    - model: "tool-shovel.glb"
      use: "Treasure island pickup — triggers instant buried chest dig"
    - model: "tool-paddle.glb"
      use: "Floating power-up — rowboat fleet speed boost 20 seconds"

  flags:
    - model: "flag.glb"
      use: "Neutral island marker — player can plant as landmark"
    - model: "flag-pirate.glb"
      use: "Enemy pirate territory — spawns nearby enemy bonus"
    - model: "flag-high.glb"
      use: "Tall territory flag in Treasure Hunt / Island Fortress mode"
    - model: "flag-high-pennant.glb"
      use: "Tall pennant — festival event decoration on main menu"
    - model: "flag-pennant.glb"
      use: "Short pennant on island structures"
    - model: "flag-pirate-high.glb"
      use: "Enemy pirate stronghold marker / Stolen Sails upgrade visual on flagship"
    - model: "flag-pirate-high-pennant.glb"
      use: "Ghost Fleet territory marker (teal variant in Curse mode)"
    - model: "flag-pirate-pennant.glb"
      use: "Ship cosmetic — flies from fleet ships on upgrade"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 8 — UI & UX DESIGN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ui_ux:

  main_menu:
    background: >
      Live 3D scene — animated ocean with the player's last ghost-run
      ship-ghost.glb silhouette sailing across. flag-pirate-high.glb
      waves on an island in the background. Atmospheric and inviting.
    buttons:
      - "⚔️  PLAY (Open Ocean)" — primary CTA, biggest button
      - "📅 Daily Challenge #N" — date shown, streak counter visible
      - "🏆 Leaderboard" — shows top 3 names immediately on button
      - "⚙️  Upgrade (Skull Tree)" — skull count shown on button
      - "🎭 Ship Select" — shows unlocked ships as small 3D icons
    no_login_required: >
      Guest play is instant. Zero friction. Name entry is optional.
      Local progress saved in localStorage. Account creation optional
      (for cross-device sync) — never forced.

  hud_during_run:
    elements:
      - position: "Top-left — HP bar (anchor icon) + Shield bar"
      - position: "Top-center — Survival timer (huge, always visible)"
      - position: "Top-right — Doubloon count + next level progress bar"
      - position: "Bottom-center — Minimap (circular, shows wreck/island/flag positions)"
      - position: "Bottom-right — Active fleet count icon (ship icons in a row)"
    design_rules:
      - "HUD never blocks more than 15% of screen"
      - "All HUD elements semi-transparent dark background — readable on ocean"
      - "Timer turns red at Minute 25 — urgency visual"
      - "Fleet ship icons pulse when a fleet ship is destroyed"

  upgrade_card_screen:
    layout: "3 cards horizontally centered. Background blurs. Game pauses."
    card_anatomy:
      - "Large 3D render of the relevant GLB model (rotating slowly)"
      - "Rarity color border (grey / blue / purple / gold)"
      - "Upgrade name in pirate-style font"
      - "Short description (max 15 words)"
      - "Rarity label bottom-right"
    animation: "Cards fly in from top. Each card wobbles slightly. Hover = enlarge."
    keyboard: "Press 1, 2, 3 to select cards instantly — power users love this"

  death_screen:
    layout: "Dramatic. Ship-wreck.glb animates sinking center screen."
    elements:
      - "SURVIVAL TIME — large gold number"
      - "SCORE — with comparison to personal best"
      - "FLEET COMPOSITION at death — row of ship icons"
      - "UPGRADES TAKEN — card icons in order chosen"
      - "SKULLS EARNED THIS RUN — with total"
      - "RANK ON TODAY'S LEADERBOARD — e.g. #143 of 2,841 today"
      - "SHARE BUTTON — copies Wordle-style emoji block to clipboard"
      - "PLAY AGAIN — immediately restarts, no menu visit needed"
    tone: "Defiant, not sad. 'The sea claims another legend… for now.'"

  leaderboard_screen:
    tabs: "🌍 All Time | 📅 Today | 👥 Friends (optional login)"
    entry_format: "Rank | Ship icon | Name | Time | Score | Date"
    player_entry_highlight: "Your entry is highlighted gold regardless of rank"
    ghost_preview: "Click any top-10 entry to watch their ghost-run replay"

  performance:
    target_fps: "60 FPS on Chrome desktop, 30 FPS on mobile browser"
    loading_time: "Under 3 seconds initial load (GLB streaming, lazy-load distant assets)"
    offline_capable: "PWA cache — playable without internet after first load"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 9 — AUDIO DESIGN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

audio:

  music:
    main_menu: "Slow sea shanty — acoustic guitar, fiddle, light percussion"
    open_ocean_minute_0_10: "Upbeat adventure — Celtic folk, building energy"
    open_ocean_minute_10_20: "Tension builds — orchestra swells, faster tempo"
    open_ocean_minute_20_30: "Epic — full orchestral, choir, 'this is the final push' energy"
    ghost_ship_boss: "Horror-adventure sting — organ, strings, dramatic brass"
    victory_30min: "Full triumphant fanfare — rare, special, memorable"
    island_fortress_build_phase: "Calm strategic music — soft flute over ambient waves"
    island_fortress_wave_phase: "Same as Open Ocean but starts at minute 10 intensity"
    source_recommendation: >
      Use royalty-free tracks from Incompetech (Kevin MacLeod — CC BY),
      Pixabay Music, or commission 1 original theme ($100–300 on Fiverr).

  sfx:
    cannon_fire: "Deep boom — satisfying, slightly reverberant"
    cannon_ball_flight: "Short whistle arc"
    cannon_ball_hit_ship: "Wooden crunch + splash"
    cannon_ball_hit_rock: "Stone crack"
    ship_sink: "Creak + splash + bubbles — 2 second sequence"
    doubloon_collect: "Coin clink — pitch rises with combo"
    chest_open: "Lock click + treasure jingle"
    level_up: "Short fanfare sting — instantly satisfying"
    upgrade_card_select: "Deep 'whoosh' + resonant chime"
    ghost_ship_appear: "Distant foghorn + choral whisper"
    boss_death: "Explosion + dramatic orchestra hit"
    bottle_pickup: "Cork pop + sparkle"
    shovel_dig: "Thud + sand scrape"
    flag_planted: "Cloth unfurl + creak"
    mast_break: "Crack + wood splinter"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 10 — TECHNICAL IMPLEMENTATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

technical:

  stack:
    renderer: "Three.js r160+ (WebGL 2.0)"
    loader: "GLTFLoader (Three.js built-in) for all .glb assets"
    physics: "Cannon.js (lightweight, browser-compatible) for cannon-ball arcs"
    audio: "Howler.js (cross-browser Web Audio API wrapper)"
    backend: "Supabase (PostgreSQL + real-time WebSocket for leaderboard)"
    build: "Vite (fastest bundler for browser games — hot reload in dev)"
    language: "TypeScript for type safety on game state machine"
    alternative_renderer: "Babylon.js (if Three.js performance insufficient on mobile)"

  asset_loading:
    strategy: "Progressive streaming — load player ship + ocean first (instant play), load enemies in background"
    format: "All .glb (binary GLTF — smallest file size, fastest parse)"
    texture: "Single colormap.png atlas (already in kit) — 1 draw call for all models"
    total_asset_size_estimate: "~3MB compressed (GLBs are already small)"
    caching: "Service Worker caches all assets — instant load on repeat visits"

  performance_optimizations:
    instancing: >
      Three.js InstancedMesh for rowboat swarms (up to 30 identical meshes
      rendered in a single draw call — critical for wave performance).
    lod:
      near: "Full GLB model (within 20 units)"
      far: "Flat sprite billboard (beyond 20 units) — saves GPU on distant ships"
    object_pool: >
      cannon-ball.glb instances are pooled (never destroyed, just repositioned).
      Pool size: 100 cannonballs. Prevents garbage collection hitches.
    culling: "Frustum culling on all off-screen objects — Three.js built-in"
    target_draw_calls: "< 100 per frame on mid-range device"

  save_system:
    local: "localStorage — instant, no auth needed (Skulls, unlocks, high score)"
    cloud: "Supabase (optional — unlocked on account creation)"
    leaderboard: "Supabase table — score, ship_used, survival_time, player_name, date"
    daily_challenge: "Supabase stores daily seed + aggregate stats for sharing card"

  anti_cheat:
    method: "Server validates run by replaying deterministic simulation"
    seed: "All runs use seeded RNG — replay-verifiable"
    score_cap: "Scores exceeding theoretical maximum are flagged automatically"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 11 — MONETIZATION (PATH TO $10K/MONTH)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

monetization:

  philosophy: >
    Free. No paywalls. No energy timers. No pay-to-win.
    Revenue comes from players who LOVE the game and WANT to support it.
    The Ghost Ship is the symbol of this — earn it through 150 Skulls
    OR buy a cosmetic shortcut. Power is never sold. Identity is.

  stream_1_portal_licensing:
    name: "Web Game Portal Deals"
    description: >
      License the game to Poki, CrazyGames, Coolmath, GameDistribution.
      They host it on their platforms and pay CPM (per-thousand-plays).
    rates:
      poki: "$1.50–$3.00 CPM (highest quality traffic)"
      crazygames: "$1.00–$2.50 CPM"
      gamedistribution: "$0.50–$1.50 CPM + revenue share on ads"
    target_monthly_plays_at_scale: "2,000,000 plays/month"
    estimated_monthly_revenue: "$3,000–$6,000"
    notes: >
      Poki and CrazyGames accept games with 1,000+ daily players.
      Quality web games regularly hit 5M–20M plays/month on these platforms.
      A single viral Reddit or TikTok post can drive 500K plays in a week.

  stream_2_rewarded_ads:
    name: "Rewarded Video Ads (Own Site)"
    provider: "Google AdSense + AdMob Web (or Admix.in for gaming-specific)"
    placement:
      - "After death screen: 'Watch ad to continue run with 50% HP' (once per run)"
      - "On meta-upgrade screen: 'Watch ad for +5 free Skulls' (twice per day)"
      - "Optional banner at very bottom of page (never overlapping game)"
    cpm_estimate: "$2–$5 CPM on gaming audiences"
    target_monthly_impressions: "500,000"
    estimated_monthly_revenue: "$1,000–$2,500"
    player_experience: >
      Ads are 100% optional. 'No thanks' always available.
      Never interrupts active gameplay — only on death/upgrade screens.
      Players who hate ads can pay for Premium to remove them.

  stream_3_premium_cosmetics:
    name: "The Black Market (Cosmetic Shop)"
    payment: "Stripe (one-time) or Ko-fi (tip-based)"
    items:
      ghost_ship_pack:
        name: "The Wraith Pack"
        price: "$2.99"
        contents:
          - "Unlock The Wraith starting ship immediately (no grind)"
          - "Ghost cannon trail particle effect (green)"
          - "Haunted sea effect on ocean surface"
        note: "Best seller — The Wraith is the most coveted ship visually"
      armada_pack:
        name: "Admiral's Bundle"
        price: "$3.99"
        contents:
          - "Royal Navy skin for player fleet (ship-large.glb white sail variant)"
          - "Gold flag-high.glb pennant on flagship"
          - "Golden cannon-ball trail particle"
      cursed_pack:
        name: "The Cursed Pirate"
        price: "$2.99"
        contents:
          - "Red-tinted skull flag variants for all flags"
          - "Blood-red cannon-ball trail"
          - "Skeleton crew silhouettes on fleet ships"
      starter_pack:
        name: "Buccaneer's Bounty"
        price: "$4.99"
        contents:
          - "100 Skulls (saves ~2 hours of normal grinding)"
          - "The Wraith ship immediate unlock"
          - "All 3 flag cosmetic packs"
        display: "Shown ONCE after first boss kill — perfect timing for impulse purchase"
    target_monthly_conversions: 600
    average_order_value: "$3.20"
    estimated_monthly_revenue: "$1,920"

  stream_4_ad_free_premium:
    name: "Sailor's Oath (Ad-Free)"
    price: "$1.99 one-time payment"
    contents:
      - "Remove all ads permanently"
      - "Exclusive name color on leaderboard (gold text)"
      - "Small supporter badge next to name"
    target_monthly_conversions: 400
    estimated_monthly_revenue: "$796"

  stream_5_itch_io:
    name: "itch.io Pay-What-You-Want"
    description: >
      Post on itch.io with suggested price $0 (PWYW). Dedicated indie
      gaming community. Many players pay $2–$5 voluntarily for games they enjoy.
    target_monthly_revenue: "$300–$800"

  total_monthly_projection:
    portal_licensing: "$4,000 (conservative mid-range)"
    rewarded_ads: "$1,500"
    cosmetic_shop: "$1,920"
    ad_free_premium: "$796"
    itch_io: "$500"
    total: "$8,716 (month 6 conservative)"
    upside: >
      One viral TikTok or Reddit post (r/WebGames, r/indiegaming) routinely
      drives 500K–2M plays in a single week. At $2 CPM that's $1,000–$4,000
      from a single post. The daily challenge sharing mechanic is engineered
      specifically to generate this viral potential repeatedly.
    month_9_target: "$12,000–$18,000 (after portal deals established + viral hits)"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 12 — VIRAL GROWTH MECHANICS (ZERO-BUDGET MARKETING)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

viral_growth:

  daily_challenge_sharing:
    mechanic: "After daily run, one-click copy of emoji score card (like Wordle)"
    why_it_works: >
      Wordle made 3 billion impressions from this single mechanic.
      Everyone who shares is a free advertisement.
      The competitive element ('I beat you today') drives friend challenges.
    platforms:
      - "Twitter/X — emoji cards are native format"
      - "Discord — paste in gaming servers"
      - "Reddit — r/WebGames, r/indiegaming daily challenge threads"
      - "WhatsApp — challenge group chats"

  ghost_replay_sharing:
    mechanic: "After any record run, player can share a URL to their ghost replay"
    example_url: "playmaelstrom.com/replay/abc123"
    why_it_works: >
      Clicking the link loads the game and immediately plays the ghost run.
      Viewer is immediately playing while watching. Conversion rate from
      'watch replay' to 'start own run' is extremely high.

  leaderboard_prestige:
    mechanic: "Top 10 names are permanently visible on main menu to all visitors"
    why_it_works: >
      People will play MORE to get their name visible to strangers.
      Top players will tell friends: 'Look, I'm #3 in the world!'
      Those friends will try to beat them. Competitive social loop.

  the_wraith_effect:
    mechanic: >
      The Wraith ship (ship-ghost.glb as player ship) is immediately
      recognizable. When a player using The Wraith appears on the
      leaderboard, other players see the ghost ship icon and ask 'how do
      I get THAT ship?' — drives grinding or cosmetic purchase.
    impact: "Every leaderboard top-10 Wraith user is a live advertisement"

  content_creator_targeting:
    platforms:
      tiktok:
        content_type: "30-second gameplay clips — ghost ship boss fight highlights"
        hook: "Under 30 second to understand, visually dramatic"
        target_creators: "Web game TikTok niche (100K–500K followers)"
        outreach: "DM with free Skull pack code"
      youtube:
        content_type: "10-minute 'I tried to survive 30 minutes' challenge video"
        hook: "Only 0.3% of players complete it — YouTubers love impossible challenges"
        target_creators: "Indie game reviewers, browser game channels"
      reddit:
        posts:
          - subreddit: "r/WebGames"
            angle: "Made a pirate naval Vampire Survivors for browser — playmaelstrom.com"
          - subreddit: "r/indiegaming"
            angle: "Devlog: Built a web game using CC0 Kenney assets — here's how it went"
          - subreddit: "r/gamedev"
            angle: "Technical breakdown: Three.js instanced mesh for 1000+ enemy ships at 60fps"

  seo_strategy:
    target_keywords:
      - "pirate browser game"
      - "naval survivor game"
      - "play pirate game online"
      - "free pirate ship game"
      - "web game pirate"
      - "vampire survivors pirate"
    on_page:
      - "Game title in H1: MAELSTROM - Free Pirate Naval Survivor Game"
      - "Meta description: Survive endless pirate fleets in your browser. Auto-fire cannons, grow your fleet, defeat ghost ship bosses. No download needed."
      - "Structured data: VideoGame schema markup"
    content_marketing:
      - "Devlog on Medium/Substack — 'How I Built a Viral Web Game in 8 Weeks'"
      - "Kenney community post — credits assets, gets featured on kenney.nl community"
      - "GitHub repo (MIT) — indie dev community discovers, stars, links to it"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 13 — DEVELOPMENT ROADMAP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

roadmap:

  week_1_2:
    name: "Ocean & Ship Prototype"
    deliverables:
      - "Three.js scene with animated ocean (Perlin noise)"
      - "ship-pirate-small.glb loading and sailing with WASD"
      - "cannon.glb auto-targeting nearest point with cannon-ball.glb physics arc"
      - "Basic enemy (boat-row-small.glb) that moves toward player"
      - "Doubloon drop on enemy death (sphere placeholder)"
    milestone: "Core feel validated — is sailing this ship FUN?"

  week_3_4:
    name: "Full Combat Loop"
    deliverables:
      - "All enemy ship types loading and spawning"
      - "Damage system + HP bars"
      - "Doubloon collection with pickup radius"
      - "Level-up trigger + 3-card upgrade screen (placeholder cards)"
      - "Fleet formation system (orbit ships around flagship)"
      - "Death screen with score"

  week_5_6:
    name: "All Assets + Game Feel"
    deliverables:
      - "All 71 GLB assets loaded and assigned to game roles"
      - "ship-ghost.glb boss with custom shader"
      - "All upgrade cards implemented (16 total)"
      - "ship-wreck.glb persistent battlefield wrecks"
      - "Treasure islands with chest.glb / hole.glb / tool-shovel.glb"
      - "Particle effects: cannon fire, explosions, coin pickup, boss death"
      - "Sound effects (Howler.js) for all events"

  week_7_8:
    name: "Meta, Modes & Polish"
    deliverables:
      - "Skull meta-upgrade tree fully implemented"
      - "Island Fortress builder mode"
      - "Treasure Hunt mode"
      - "Ghost Fleet mode"
      - "Wave timeline balanced and playtested"
      - "Mobile touch controls validated"
      - "60fps on mid-range hardware confirmed"

  week_9_10:
    name: "Online Features"
    deliverables:
      - "Supabase leaderboard integration"
      - "Daily Challenge seed system"
      - "Share card generation (emoji + text)"
      - "Ghost replay system"
      - "Player name entry + localStorage save"
      - "Anti-cheat server validation"

  week_11_12:
    name: "Monetization & Launch"
    deliverables:
      - "Stripe payment integration for cosmetics"
      - "Ad integration (Google AdSense + rewarded video)"
      - "itch.io page live with screenshots + trailer GIF"
      - "CrazyGames / Poki submission"
      - "playmaelstrom.com live with SEO meta tags"
      - "Reddit launch post (r/WebGames)"
      - "Devlog article published"

  total_development_time: "12 weeks (3 months solo developer)"

  cost_breakdown:
    assets_kenney_pirate_kit: "$0 (CC0 license)"
    three_js: "$0 (open source)"
    supabase: "$0 (free tier up to 500MB + 2GB bandwidth)"
    hosting_domain: "$12/year domain + $0 Netlify/Vercel hosting"
    stripe_fees: "2.9% + $0.30 per transaction (no upfront cost)"
    itch_io: "$0 (10% revenue share)"
    audio_sfx: "$50–100 (Freesound.org + 1-2 commissioned)"
    marketing: "$0 (all organic)"
    total_cash_to_launch: "< $150"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 14 — SUCCESS METRICS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

kpis:
  launch_week:
    target_plays: 5000
    target_revenue: "$50–200"
    focus: "Validate fun factor. Read Reddit comments obsessively. Fix D1 dropoff."

  month_1:
    target_plays: 50000
    target_revenue: "$500–1000"
    key_milestone: "First portal deal submitted to CrazyGames/Poki"

  month_3:
    target_plays: 500000
    target_revenue: "$3,000–5,000"
    key_milestone: "Daily Challenge sharing driving organic viral loops"

  month_6:
    target_plays: "2,000,000+"
    target_revenue: "$8,000–12,000"
    key_milestone: "Both Poki + CrazyGames deals active"

  month_9:
    target_plays: "5,000,000+"
    target_revenue: "$12,000–20,000"
    key_milestone: "One viral hit (Reddit/TikTok) has already happened by now statistically"

  north_star_metric: >
    Average session = 12+ minutes (signals genuine engagement).
    If avg session < 8 minutes, the upgrade loop needs tuning before scaling.

  retention_benchmark:
    same_day_return: "> 35% of players who play once return same day"
    daily_challenge_completion: "> 20% of active players complete daily challenge"
    rationale: >
      These two metrics predict long-term monetization potential better than
      any other signal. Nail these and $10K/month follows naturally.


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 15 — LICENSE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

license:
  kenney_pirate_kit: "CC0 1.0 Universal — Public Domain"
  commercial_use: "Fully permitted. No attribution required (credit voluntarily)."
  modifications: "All shaders, recolors, rescales fully allowed"
  monetization: "Permitted — including ads, IAP, portal revenue sharing"
  three_js: "MIT License"
  supabase: "Apache 2.0"
  legal_risk: "ZERO — all core dependencies are open source or public domain"

################################################################################
# END — MAELSTROM WEB GAME DESIGN PROMPT v1.0
# "The sea has no mercy. Neither do your cannons."
################################################################################

create and bind the game html and the game files are present in repo because I cannot modify or change the file place again. So as per the repo create the game file and structure and the game should be fully focused and functional without any bugs and problem. Do a deep Research and analysis and thinking on it and create the game. And thin twice before creating the game and don't hallucinate. And also remember that I will not change the code structure just for index.html. and fix the errors and problems.


And also the game that is created is looks like vague and not loading the game assets

Game link:- https://abhishek2025-glitch.github.io/boat/

_______
Important install for you:-
DO A DEEP RESEARCH AND THINKING AND ANALYSIS ON IT AND MAKE THE GAME PLAYABLE SHOULD LOOK ATTRACTIVE AND ABLE TO EARN 10000$/MONTH.
DON'T HALLUCINATE AND THINK TWICE BEFORE CREATING THE GAME.
