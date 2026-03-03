'use client';

import React, { useRef, useEffect, useState } from 'react';
import { FloorData, PathNode } from '@/types/map.d';

interface MapCanvasProps {
  floorData: FloorData;
  pathSegments: PathNode[];
  onRoomClick?: (roomId: string) => void;
  selectedRoomId?: string;
  userLocation?: { x: number; y: number };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Regular octagon polygon points centred at (cx, cy) with outer radius r */
function octagonPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI / 4) * i - Math.PI / 8;
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');
}

/** Arrow direction → SVG rotation degrees */
const ENTRY_ROTATION: Record<string, number> = {
  east: 0,
  west: 180,
  south: 90,
  north: 270,
};

// ─── Sub-components ─────────────────────────────────────────────────────────

/**
 * Staircase block driven by a `staircases[]` entry in the JSON.
 * Renders a grid of step-cells with a diagonal highlight line.
 */
function StaircaseBlock({
  x, y, w, h, label,
}: {
  x: number; y: number; w: number; h: number; label: string;
}) {
  const cols = 4;
  const rows = 4;
  const cellW = w / cols;
  const cellH = h / rows;

  return (
    <g>
      {/* Card background */}
      <rect x={x} y={y} width={w} height={h} rx="4"
        fill="#1e293b" stroke="#475569" strokeWidth="1" />

      {/* Step cells — brightness increases bottom-left → top-right */}
      {Array.from({ length: cols }, (_, col) =>
        Array.from({ length: rows }, (_, row) => {
          const t = (col + (rows - 1 - row)) / (cols + rows - 2);
          const v = Math.round(35 + t * 110);
          return (
            <rect
              key={`${col}-${row}`}
              x={x + col * cellW}
              y={y + row * cellH}
              width={cellW}
              height={cellH}
              fill={`rgb(${v},${v},${v})`}
              stroke="#0f172a"
              strokeWidth="0.5"
            />
          );
        })
      )}

      {/* Diagonal step line */}
      <line x1={x} y1={y + h} x2={x + w} y2={y}
        stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />

      {/* Label above the block */}
      <text
        x={x + w / 2} y={y - 7}
        textAnchor="middle" fontSize="10" fontWeight="600"
        fill="#94a3b8" letterSpacing="0.5"
      >
        {label}
      </text>
    </g>
  );
}

function CentralOctagon({
  cx, cy, label, radius = 52,
}: {
  cx: number; cy: number; label: string; radius?: number;
}) {
  return (
    <g>
      {/* Outer glow ring */}
      <polygon
        points={octagonPoints(cx, cy, radius + 9)}
        fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.2"
      />
      {/* Body */}
      <polygon
        points={octagonPoints(cx, cy, radius)}
        fill="#0f172a" stroke="#38bdf8" strokeWidth="2"
        filter="url(#octGlow)"
      />
      {/* Inner dashed ring */}
      <polygon
        points={octagonPoints(cx, cy, radius * 0.62)}
        fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="4,3"
      />
      {/* 8 compass spokes */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (Math.PI / 4) * i;
        return (
          <line
            key={i}
            x1={cx + radius * 0.18 * Math.cos(angle)}
            y1={cy + radius * 0.18 * Math.sin(angle)}
            x2={cx + radius * 0.58 * Math.cos(angle)}
            y2={cy + radius * 0.58 * Math.sin(angle)}
            stroke="#334155" strokeWidth="1"
          />
        );
      })}
      {/* Centre dot */}
      <circle cx={cx} cy={cy} r="5.5" fill="#38bdf8" opacity="0.9" />
      <circle cx={cx} cy={cy} r="2.5" fill="#0f172a" />
      {/* Label */}
      <text
        x={cx} y={cy + radius + 15}
        textAnchor="middle" fontSize="9" fontWeight="600"
        fill="#64748b" letterSpacing="2"
      >
        {label.toUpperCase()}
      </text>
    </g>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function MapCanvas({
  floorData,
  pathSegments,
  onRoomClick,
  selectedRoomId,
  userLocation = { x: 160, y: 100 },
}: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale]         = useState(1);
  const [pan, setPan]             = useState({ x: 0, y: 0 });
  const [isDragging, setIsDrag]   = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const viewBox = floorData.metadata.viewBox;
  const [minX, minY, width, height] = viewBox.split(' ').map(Number);

  // Pull optional arrays from JSON (with safe fallbacks)
  const centerPoints = floorData.center     ?? [];
  const staircases   = floorData.staircases ?? [];
  const entries      = floorData.entries    ?? [];

  // ── Zoom (Ctrl + scroll wheel) ─────────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setScale((s) => Math.max(0.5, Math.min(4, s * (e.deltaY > 0 ? 0.9 : 1.1))));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  // ── Pan ────────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDrag(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setIsDrag(false);

  // ── Auto-pan + zoom to selected room ──────────────────────────────────
  useEffect(() => {
    if (!selectedRoomId || !svgRef.current) return;
    const room = floorData.rooms.find((r) => r.id === selectedRoomId);
    if (!room) return;
    const rect = svgRef.current.getBoundingClientRect();
    setScale(1.5);
    setPan({
      x: -(room.x + room.w / 2) * 1.5 + rect.width  / 2,
      y: -(room.y + room.h / 2) * 1.5 + rect.height / 2,
    });
  }, [selectedRoomId, floorData.rooms]);

  // ─────────────────────────────────────────────────────────────────────
  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-slate-100 dark:bg-slate-900 cursor-grab active:cursor-grabbing select-none"
      viewBox={viewBox}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
        </pattern>

        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1e40af" stopOpacity="0.8" />
        </linearGradient>

        {/* Octagon glow */}
        <filter id="octGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Path glow */}
        <filter id="pathGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        transform={`translate(${pan.x},${pan.y}) scale(${scale})`}
        style={{ transformOrigin: '0 0' }}
      >
        {/* Grid */}
        <rect x={minX} y={minY} width={width} height={height} fill="url(#grid)" />

        {/* Floor border */}
        <rect x={minX} y={minY} width={width} height={height}
          fill="none" stroke="#64748b" strokeWidth="2" />

        

        {/* ── Rooms ── */}
        {floorData.rooms.map((room) => {
          const isSelected = room.id === selectedRoomId;
          const isOnPath   = pathSegments.some(
            (p) =>
              p.x >= room.x && p.x <= room.x + room.w &&
              p.y >= room.y && p.y <= room.y + room.h,
          );

          const fillColor   = isSelected ? '#3b82f6'
                            : isOnPath   ? '#dbeafe'
                            : (room.color ?? '#f1f5f9');
          const strokeColor = isSelected ? '#1e40af'
                            : isOnPath   ? '#0284c7'
                            : '#cbd5e1';

          return (
            <g key={room.id}>
              <rect
                x={room.x} y={room.y} width={room.w} height={room.h}
                fill={fillColor} stroke={strokeColor} strokeWidth="1.5" rx="4"
                className={`transition-colors ${onRoomClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => onRoomClick?.(room.id)}
              />

              {/* Room number — large */}
              <text
                x={room.x + room.w / 2}
                y={room.y + room.h / 2 - 9}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="20" fontWeight="700"
                fill={isSelected ? '#ffffff' : '#1e293b'}
                className="pointer-events-none select-none"
              >
                {room.roomNumber ?? ''}
              </text>

              {/* Room name — small */}
              <text
                x={room.x + room.w / 2}
                y={room.y + room.h / 2 + 12}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="10"
                fill={isSelected ? '#e0f2fe' : '#475569'}
                className="pointer-events-none select-none"
              >
                {room.name}
              </text>
            </g>
          );
        })}

        {/* ── Staircase blocks (from staircases[]) ── */}
        {staircases.map((stair) => (
          <StaircaseBlock
            key={stair.id}
            x={stair.x} y={stair.y}
            w={stair.w} h={stair.h}
            label={stair.label}
          />
        ))}

        {/* ── Central octagon hub (from center[]) ── */}
        {centerPoints.map((c, i) => (
          <CentralOctagon
            key={i}
            cx={c.x} cy={c.y}
            label={c.label ?? 'Hall'}
            radius={52}
          />
        ))}

        {/* ── Navigation path ── */}
        {pathSegments.length > 1 && (
          <polyline
            points={pathSegments.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8,4"
            filter="url(#pathGlow)"
            className="animate-dash"
          />
        )}

        {/* Waypoints */}
        {pathSegments.slice(1, -1).map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r="3" fill="#0284c7" opacity="0.6" />
        ))}

        {/* ── User location dot ── */}
        {userLocation && (
          <g>
            <circle cx={userLocation.x} cy={userLocation.y} r="12"
              fill="#3b82f6" opacity="0.15" />
            <circle cx={userLocation.x} cy={userLocation.y} r="6"
              fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
          </g>
        )}
      </g>
    </svg>
  );
}