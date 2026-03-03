# Path Validation Fix: Enforcing Stair-Only Access

## Problem
The pathfinding algorithm was finding direct routes to rooms 101, 108, and 110 instead of enforcing stair-only access. The validation warnings indicated:
```
"Node SP_G_JUNCTION_101 (Room 101 Stair Access) requires stair access but path doesn't use stairs"
```

## Root Cause
1. The `dijkstraWithConstraints` function wasn't properly checking if the destination required stairs
2. The `isEdgeAllowedByConstraints` function wasn't blocking direct edges when targeting stair-only destinations
3. The constraint logic was backwards - it was only applied when `allowStairsOnly: true` in some cases

## Solution

### 1. Enhanced Dijkstra's Algorithm (pathfinding.ts)
- Added detection of whether the destination node requires stairs
- Pass `endNodeRequiresStairs` flag to the constraint checking function
- This ensures the constraint is always enforced when the destination requires stairs

### 2. Improved Constraint Logic (pathfinding.ts)
- Updated `isEdgeAllowedByConstraints` to block direct edges when destination requires stairs
- Blocks transitions to "accessible_directly" junctions when targeting stair-only rooms
- Always allows stair edges when destination requires stairs

### 3. Updated use-navigation Hook (use-navigation.ts)
- Identify stair-only rooms: `['SP_G_101', 'SP_G_108', 'SP_G_110']`
- Set `allowStairsOnly: true` for these rooms
- Set `preferDirectAccess: false` for stair-only rooms

## How It Works

When navigating to a stair-only room (101, 108, or 110):

1. The algorithm detects `endNodeRequiresStairs = true`
2. During pathfinding, it rejects direct edges and hallway edges leading to direct-access junctions
3. Only stair-type edges are considered valid
4. The path is forced to go through the appropriate staircase node
5. Validation passes without warnings

## Graph Structure
```
Start → Hall Junctions → Stair Node A/B → Room Junction (Stairs-only) → Room
```

## Testing
Routes to:
- Room 101: Must go through STAIR_NODE_A → JUNCTION_101
- Room 108: Must go through STAIR_NODE_A or B → STAIR_108
- Room 110: Must go through STAIR_NODE_B → JUNCTION_110

Routes to (unaffected):
- Rooms 103-107: Can use direct hall junctions or stairs (flexible)
