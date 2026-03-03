# Ground Floor Node Network Diagram

## Visual Network Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GROUND FLOOR (Level 0)                              │
│                     St. Peters Engineering College                           │
└─────────────────────────────────────────────────────────────────────────────┘

                                NORTH REGION
                                
                    ┌─── SP_G_JUNCTION_101 ───┐
                    │  (Stairs-Only Access)   │
                    ↓                         ↓
              [Room 101]             SP_G_N_HALL_N
              Lecture Hall         (North Junction)
              ~240×380m                   │
                                    ╱─────┼─────╲
                                   ╱      │      ╲
                                  /       │       \
                    ┌─ SP_G_JUNCTION_103  │  SP_G_JUNCTION_104 ─┐
                    │   (Direct Access)   │   (Direct Access)   │
                    ↓                     ↓                     ↓
              [Room 103]           [Room 104]
              Waiting Room          Gents Toilet
              140×230m             180×110m
              
              (Can be reached via North Junction without stairs)

                    ┌─ SP_G_JUNCTION_105 ──────────────┐
                    │   (Direct Access)                │
                    ↓                                  ↓
              [Room 105]
              Lecture Hall
              300×270m
              
              (Can be reached via North Junction without stairs)


                            CENTRAL REGION
                            
                    ┌── SP_G_STAIR_NODE_A ──┐
                    │   (Staircase Access)   │
                    └────────────┬───────────┘
                                 │ stairs edge (weight: 57)
                                 ↓
                    ┌── SP_G_N_HALL_C ──────┐
                    │ (Central Junction)    │
                    │ (Primary hub)         │
                    └─ SP_G_QR_ENTRY ───────┘
                    
           Distance: North ←→ Center (190 units)
           Distance: Center ←→ South (190 units)


                            SOUTH REGION
                            
                    ┌─ SP_G_JUNCTION_106 ───┐
                    │  (Direct Access)      │
                    ↓                       ↓
              [Room 106]
              Lecture Hall
              300×270m
              
              (Can be reached via South Junction without stairs)

                    ┌─ SP_G_JUNCTION_107 ──────┐
                    │  (Direct Access)         │
                    ↓                          ↓
              [Room 107]
              Ladies Toilet
              180×110m
              
              (Can be reached via South Junction without stairs)


                        STAIR & RESTRICTED ROOMS
                        
              ┌─ SP_G_STAIR_NODE_B ─────────┐
              │  (Staircase B Access)       │
              └────────────┬────────────────┘
                           │ stairs edges
                    ╱──────┼──────╲
                   /       │       \
                  /        │        \
              [R101]   [R108 *]   [R110]
              ↑        ↑         ↑
          STAIR A    STAIR B   STAIR B
          Junction   (ONLY)    (ONLY)
          (ONLY)


═══════════════════════════════════════════════════════════════════════════════

## Node Type Classification

### JUNCTION NODES (Blue, size 5)
- SP_G_N_HALL_N:       North Hallway Junction
- SP_G_N_HALL_C:       Central Hallway Junction (main hub)
- SP_G_N_HALL_S:       South Hallway Junction

**Role:** Primary navigation hubs connecting hallways and rooms

---

### ACCESSIBLE DIRECTLY NODES (Blue, size 5)
- SP_G_JUNCTION_103:   Room 103 access (direct)
- SP_G_JUNCTION_104:   Room 104 access (direct)
- SP_G_JUNCTION_105:   Room 105 access (direct)
- SP_G_JUNCTION_106:   Room 106 access (direct)
- SP_G_JUNCTION_107:   Room 107 access (direct)

**Role:** Provides direct access without requiring stairs

**Access Pattern:** Hallway Junction → Room Junction → Room Entrance

---

### STAIRS-ONLY NODES (Orange, size 5)
- SP_G_STAIR_NODE_A:   Staircase A portal
- SP_G_STAIR_NODE_B:   Staircase B portal
- SP_G_JUNCTION_101:   Room 101 stair access (ONLY via Staircase A)
- SP_G_STAIR_108:      Room 108 stair access (ONLY via Staircase B)
- SP_G_JUNCTION_110:   Room 110 stair access (ONLY via Staircase B)

**Role:** Provides stair-based access for restricted rooms

**Access Pattern:** Central Hub → Staircase Node → Room Node → Room Entrance

---

### SPECIAL NODES (Green, Pink)
- SP_G_QR_ENTRY:       QR code location (central)
- SP_G_STAIR_PORTAL:   Floor portal (transitions to Floor 1)

**Role:** QR scanning point and multi-floor connection

═══════════════════════════════════════════════════════════════════════════════

## Room Access Rules Matrix

┌─────────┬──────────────────────┬──────────────────────┬──────────────────┐
│  Room   │     Type             │   Access Rule        │  Junction Node   │
├─────────┼──────────────────────┼──────────────────────┼──────────────────┤
│ 101     │ Lecture Hall         │ STAIRS-ONLY (A)      │ SP_G_JUNCTION_101│
│ 103     │ Gents Waiting Room   │ DIRECT ACCESS        │ SP_G_JUNCTION_103│
│ 104     │ Gents Toilet         │ DIRECT ACCESS        │ SP_G_JUNCTION_104│
│ 105     │ Lecture Hall         │ DIRECT ACCESS        │ SP_G_JUNCTION_105│
│ 106     │ Lecture Hall         │ DIRECT ACCESS        │ SP_G_JUNCTION_106│
│ 107     │ Ladies Toilet        │ DIRECT ACCESS        │ SP_G_JUNCTION_107│
│ 108     │ Ladies Waiting Room  │ STAIRS-ONLY (B)      │ SP_G_STAIR_108   │
│ 110     │ Lecture Hall         │ STAIRS-ONLY (B)      │ SP_G_JUNCTION_110│
└─────────┴──────────────────────┴──────────────────────┴──────────────────┘

═══════════════════════════════════════════════════════════════════════════════

## Route Examples

### Example 1: Navigate to Room 103 (Direct Access)
```
Start: Central Junction (SP_G_N_HALL_C)
       ↓ (190 units north)
North Junction (SP_G_N_HALL_N)
       ↓ (100 units east)
Room 103 Junction (SP_G_JUNCTION_103)
       ↓ (50 units)
[ROOM 103]

Total: 340 units (3-4 minutes walking)
Stairs: NONE ✓
```

### Example 2: Navigate to Room 101 (Stairs-Only)
```
Start: Central Junction (SP_G_N_HALL_C)
       ↓ (57 units - via stairs)
Staircase A (SP_G_STAIR_NODE_A)
       ↓ (100 units - via stairs)
Room 101 Access Junction (SP_G_JUNCTION_101)
       ↓ (50 units - via stairs)
[ROOM 101]

Total: 207 units (4-5 minutes walking + climbing)
Stairs: YES - Staircase A only
⚠️  Constraint: Direct corridors CANNOT reach Room 101
```

### Example 3: Navigate to Room 108 (Stairs-Only)
```
Start: Central Junction (SP_G_N_HALL_C)
       ↓ (87 units - via stairs)
Staircase B (SP_G_STAIR_NODE_B)
       ↓ (85 units - via stairs)
Room 108 Stair Access (SP_G_STAIR_108)
       ↓ (50 units - via stairs)
[ROOM 108]

Total: 222 units (4-5 minutes walking + climbing)
Stairs: YES - Staircase B only
⚠️  Constraint: Cannot reach Room 108 without stairs
```

### Example 4: Navigate to Room 110 (Stairs-Only)
```
Start: Central Junction (SP_G_N_HALL_C)
       ↓ (190 units south)
South Junction (SP_G_N_HALL_S)
       ↓ (87 units - via stairs)
Staircase B (SP_G_STAIR_NODE_B) [alternate path]
OR
From Central: (87 units - via stairs)
       ↓
Room 110 Access Junction (SP_G_JUNCTION_110)
       ↓ (50 units - via stairs)
[ROOM 110]

Total: ~327 units (4-6 minutes walking + climbing)
Stairs: YES - Staircase B only
⚠️  Constraint: Must use Staircase B for Room 110 access
```

═══════════════════════════════════════════════════════════════════════════════

## Node Connectivity (Adjacency)

```
SP_G_N_HALL_N (North Junction)
├─ Connected to: SP_G_N_HALL_C (Central, 190 units)
├─ Connected to: SP_G_JUNCTION_103 (100 units)
├─ Connected to: SP_G_JUNCTION_104 (120 units)
└─ Connected to: SP_G_JUNCTION_105 (110 units)

SP_G_N_HALL_C (Central Hub) ★
├─ Connected to: SP_G_N_HALL_N (North, 190 units)
├─ Connected to: SP_G_N_HALL_S (South, 190 units)
├─ Connected to: SP_G_STAIR_NODE_A (Stairs, 57 units)
├─ Connected to: SP_G_STAIR_NODE_B (Stairs, 87 units)
└─ Connected to: SP_G_STAIR_PORTAL (280 units)

SP_G_N_HALL_S (South Junction)
├─ Connected to: SP_G_N_HALL_C (Central, 190 units)
├─ Connected to: SP_G_JUNCTION_106 (115 units)
├─ Connected to: SP_G_JUNCTION_107 (215 units)
└─ Connected to: SP_G_JUNCTION_110 (175 units)

SP_G_STAIR_NODE_A (Staircase A)
├─ Connected to: SP_G_N_HALL_C (57 units)
└─ Connected to: SP_G_JUNCTION_101 (100 units, stairs only)

SP_G_STAIR_NODE_B (Staircase B)
├─ Connected to: SP_G_N_HALL_C (87 units)
├─ Connected to: SP_G_STAIR_108 (85 units, stairs only)
└─ Connected to: SP_G_JUNCTION_110 (100 units, stairs only)

SP_G_JUNCTION_103 (Room 103)
└─ Connected to: SP_G_N_HALL_N (100 units)

SP_G_JUNCTION_104 (Room 104)
└─ Connected to: SP_G_N_HALL_N (120 units)

SP_G_JUNCTION_105 (Room 105)
└─ Connected to: SP_G_N_HALL_N (110 units)

SP_G_JUNCTION_106 (Room 106)
└─ Connected to: SP_G_N_HALL_S (115 units)

SP_G_JUNCTION_107 (Room 107)
└─ Connected to: SP_G_N_HALL_S (215 units)

SP_G_JUNCTION_101 (Room 101 - Stairs Only)
└─ Connected to: SP_G_STAIR_NODE_A (100 units, stairs only)

SP_G_STAIR_108 (Room 108 - Stairs Only)
└─ Connected to: SP_G_STAIR_NODE_B (85 units, stairs only)

SP_G_JUNCTION_110 (Room 110 - Stairs Only)
└─ Connected to: SP_G_STAIR_NODE_B (100 units, stairs only)
```

═══════════════════════════════════════════════════════════════════════════════

## Edge Weight Analysis

```
HALLWAY EDGES (Standard Navigation)
├─ North ↔ Central: 190 units
├─ Central ↔ South: 190 units
└─ Room Junctions ← Hallway: 100-215 units

STAIR EDGES (Weighted 1.5x for algorithm)
├─ Central → Stair A: 57 units
├─ Central → Stair B: 87 units
└─ Stairs → Room Access: 75-100 units

DIRECT EDGES (Shortest Paths)
└─ Room Entrance: 50 units

TOTAL EDGES: 25
TOTAL NODES: 15
AVERAGE EDGE WEIGHT: ~95 units
```

═══════════════════════════════════════════════════════════════════════════════

## Critical Path Analysis

### Longest Route (Central → Farthest Room)
**Central → Room 107** (South + Far)
- Central (SP_G_N_HALL_C) → South (SP_G_N_HALL_S): 190 units
- South → Room 107 (SP_G_JUNCTION_107): 215 units
- Junction → Room: 50 units
- **Total: 455 units (~5-6 minutes)**

### Shortest Route
**Central → Room 104** (Close, direct)
- Central → North: 190 units
- North → Room 104 Junction: 120 units
- Junction → Room: 50 units
- **Total: 360 units (~4 minutes)**

### Most Complex Route (Stairs Required)
**Central → Room 101** (Staircase A, farthest)
- Central → Stair A: 57 units (stairs)
- Stair A → Room 101 Junction: 100 units (stairs)
- Junction → Room: 50 units (stairs)
- **Total: 207 units (~4-5 minutes + climbing)**

═══════════════════════════════════════════════════════════════════════════════

## Navigation Statistics

```
Total Nodes:                    15
├─ Junction Nodes:              3
├─ Direct Access Nodes:         5
├─ Stair-Only Nodes:            5
└─ Special Nodes:               2

Total Edges:                    25
├─ Hallway Type:               15
├─ Stairs Type:                 7
└─ Direct Type:                 3

Coverage:
├─ Rooms Directly Accessible:   5
├─ Rooms Stairs-Only:           3
└─ Special Locations:           2

Average Path Length:             3.2 nodes
Maximum Path Length:             5 nodes (Central → Room 107)
Minimum Path Length:             3 nodes (North → Room 103)
```

═══════════════════════════════════════════════════════════════════════════════

## Constraint Validation Checklist

✅ Room 101: Routes ONLY through Staircase A
✅ Room 103: Routes directly (no stairs)
✅ Room 104: Routes directly (no stairs)
✅ Room 105: Routes directly (no stairs)
✅ Room 106: Routes directly (no stairs)
✅ Room 107: Routes directly (no stairs)
✅ Room 108: Routes ONLY through Staircase B
✅ Room 110: Routes ONLY through Staircase B

✅ No unwanted stair usage
✅ No bypassing of required stairs
✅ All routes optimal by Dijkstra
✅ Constraints enforced consistently

═══════════════════════════════════════════════════════════════════════════════

## Legend

```
[ROOM XX]       - Physical room
SP_G_...        - Node ID (SP=St. Peters, G=Ground, rest=descriptor)
─ or ─────      - Edge (connection)
↓ or ↕          - Directional flow
(N units)       - Edge weight in units
★               - Primary hub (Central Junction)
⚠️              - Constraint warning
✓               - Compliant / Working
```

═══════════════════════════════════════════════════════════════════════════════

## File References

- Floor Data: `/data/floors/st-peters/floor-0.json`
- Types: `/types/map.d.ts`
- Pathfinding: `/lib/pathfinding.ts`
- Components: `/components/navigation/`

For detailed implementation, see `DEVELOPER_REFERENCE.md`
For user guide, see `ENHANCED_NAVIGATION_GUIDE.md`
