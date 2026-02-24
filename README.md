# NaviCampus V3 - Indoor Navigation System

A smart indoor navigation system for St. Peters Engineering College built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Provides real-time pathfinding, multi-floor support, and mobile-responsive design.

## Features

### Core Navigation
- **Dijkstra's Algorithm**: Optimized shortest path calculation with support for multi-floor navigation
- **Real-time Pathfinding**: Calculate routes between any two rooms on campus
- **Multi-floor Support**: Seamless navigation across ground floor, first floor, and second floor
- **Vertical Navigation**: Automatic detection of stairs/elevators with floor change indicators

### User Interface
- **Interactive SVG Maps**: Full-screen floor plans with pinch-to-zoom and pan controls
- **Floor Switcher**: Vertical floating button panel for quick floor navigation (44px × 44px touch targets)
- **Search Functionality**: Search rooms, labs, and facilities with real-time filtering
- **Live Navigation Status**: Real-time ETA, distance, and turn-by-turn directions
- **Mobile Responsive**: Optimized for all screen sizes with adaptive layouts

### Mobile Features
- Safe areas avoiding notch overlap
- Bottom sheet interface for navigation details
- Floating action button for quick access
- Touch-optimized buttons (minimum 44×44px)
- Auto-pan to selected destination

### Visual Design
- Modern dark mode support
- Animated path rendering with "marching ants" effect
- Pulsing blue dot for user location
- Smooth transitions and micro-interactions
- Clean, professional UI inspired by Google Maps

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 11
- **Build**: Turbopack (Next.js default)
- **Package Manager**: npm

## Project Structure

```
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main application page
│   └── globals.css          # Global styles and animations
├── components/
│   ├── map/
│   │   └── MapCanvas.tsx    # Interactive SVG map renderer
│   ├── ui/
│   │   ├── Sidebar.tsx      # Search and navigation panel
│   │   └── FloorSwitcher.tsx # Floor navigation control
│   ├── DestinationCard.tsx  # Desktop destination preview
│   ├── NavigationBottomSheet.tsx # Mobile navigation details
│   ├── LoadingSkeleton.tsx  # Loading state UI
│   └── ResponsiveWrapper.tsx # Mobile detection wrapper
├── lib/
│   ├── dijkstra.ts          # Pathfinding algorithm
│   ├── graph-builder.ts     # Graph construction utilities
│   └── use-navigation.ts    # React hook for navigation logic
├── types/
│   └── map.d.ts             # TypeScript definitions
└── data/
    ├── buildings/
    │   └── st-peters.json   # Building metadata
    └── floors/
        └── st-peters/
            ├── floor-0.json # Ground floor data
            ├── floor-1.json # First floor data
            └── floor-2.json # Second floor data
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ayhampt/sjcet-indoor.git
cd sjcet-indoor
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Usage

### Searching for a Room
1. Use the search bar to find a specific room, lab, or facility
2. Results display room name, ID, type, and floor level
3. Click on a result to start navigation

### Navigating Between Rooms
1. Search for your destination or click a room on the map
2. The system calculates the shortest path using Dijkstra's algorithm
3. View turn-by-turn directions in the sidebar or bottom sheet
4. The map shows your path with an animated dashed line
5. Your location is marked with a pulsing blue dot

### Switching Floors
- Use the vertical floor switcher on the right side of the screen
- Click a floor button to see that floor's layout
- If your path crosses floors, a warning indicator appears

### Mobile Usage
1. Tap the search icon to access the search bar
2. Bottom sheet displays navigation details
3. Floating action button shows quick access to directions
4. Floor switcher remains accessible at all times

## API Reference

### `useNavigation(options)`

Main React hook for navigation logic.

**Options:**
- `floorsData`: Array of `FloorData` objects
- `startFloor`: Starting floor number (default: 0)

**Returns:**
- `currentFloor`: Currently displayed floor
- `navigationState`: Active navigation with path and ETA
- `selectedDestination`: Currently selected destination room
- `searchQuery`: Current search text
- `searchResults`: Search results
- `visiblePathSegments`: Path segments on current floor
- `nextFloorChange`: Upcoming floor change information
- `instructions`: Turn-by-turn directions
- `navigateTo(room)`: Start navigation to a room
- `clearNavigation()`: Clear current navigation
- `setCurrentFloor(floor)`: Change displayed floor
- `setSearchQuery(query)`: Update search

### `dijkstra(graph, startNodeId, endNodeId)`

Finds the shortest path between two nodes.

**Parameters:**
- `graph`: Adjacency list representation
- `startNodeId`: Starting node ID
- `endNodeId`: Destination node ID

**Returns:**
- `distances`: Map of node IDs to distances
- `previous`: Map for path reconstruction

## Performance Optimization

- SVG rendering optimized with React key management
- Path calculation uses efficient Dijkstra implementation
- Memoized search results and path segments
- Lazy loading of floor data
- Mobile layout adapts to reduce re-renders

## Accessibility

- Semantic HTML elements (main, header, aside)
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast dark mode
- Touch targets minimum 44×44px on mobile
- Screen reader friendly text

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is open source and available under the MIT License.

## Contact

For questions or feedback, please contact:
- Project Lead: [Ayham PT](https://github.com/Ayhampt)
- Institution: St. Peters Engineering College
