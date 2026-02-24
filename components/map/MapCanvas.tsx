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

export function MapCanvas({
  floorData,
  pathSegments,
  onRoomClick,
  selectedRoomId,
  userLocation = { x: 160, y: 100 },
}: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const viewBox = floorData.metadata.viewBox;
  const [minX, minY, width, height] = viewBox.split(' ').map(Number);

  // Handle pinch zoom for mobile
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.5, Math.min(3, scale * delta));

      setScale(newScale);
    };

    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [scale]);

  // Handle pan
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Auto-pan to selected room
  useEffect(() => {
    if (!selectedRoomId || !svgRef.current) return;

    const selectedRoom = floorData.rooms.find((r) => r.id === selectedRoomId);
    if (!selectedRoom) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();

    // Calculate center of room in SVG coordinates
    const roomCenterX = selectedRoom.x + selectedRoom.w / 2;
    const roomCenterY = selectedRoom.y + selectedRoom.h / 2;

    // Calculate pan to center the room
    const svgCenterX = rect.width / 2 / scale;
    const svgCenterY = rect.height / 2 / scale;

    setPan({
      x: -roomCenterX * scale + svgCenterX,
      y: -roomCenterY * scale + svgCenterY,
    });

    setScale(1.5); // Zoom in on selection
  }, [selectedRoomId, floorData.rooms]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-slate-100 dark:bg-slate-900 cursor-grab active:cursor-grabbing select-none"
      viewBox={viewBox}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <g
        transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}
        style={{ transformOrigin: '0 0' }}
      >
        {/* Floor background with grid pattern */}
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Grid background */}
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Floor outline */}
        <rect
          x={minX}
          y={minY}
          width={width}
          height={height}
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          className="dark:stroke-slate-700"
        />

        {/* Render rooms */}
        {floorData.rooms.map((room) => {
          const isSelected = room.id === selectedRoomId;
          const isOnPath = pathSegments.some((p) => {
            // Check if any path point is near this room
            return (
              p.x >= room.x &&
              p.x <= room.x + room.w &&
              p.y >= room.y &&
              p.y <= room.y + room.h
            );
          });

          return (
            <g key={room.id}>
              <rect
                x={room.x}
                y={room.y}
                width={room.w}
                height={room.h}
                fill={
                  isSelected
                    ? '#3b82f6'
                    : isOnPath
                      ? '#dbeafe'
                      : '#f1f5f9'
                }
                stroke={
                  isSelected
                    ? '#1e40af'
                    : isOnPath
                      ? '#0284c7'
                      : '#cbd5e1'
                }
                strokeWidth="1.5"
                rx="4"
                className={`dark:fill-slate-800 dark:stroke-slate-700 transition-colors ${
                  onRoomClick ? 'cursor-pointer hover:opacity-80' : ''
                }`}
                onClick={() => onRoomClick?.(room.id)}
              />

              {/* Room label */}
              <text
                x={room.x + room.w / 2}
                y={room.y + room.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-semibold pointer-events-none select-none"
                fill={isSelected ? '#ffffff' : '#334155'}
              >
                {room.name}
              </text>

              {/* Room ID label (small) */}
              <text
                x={room.x + room.w / 2}
                y={room.y + room.h / 2 + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] pointer-events-none select-none"
                fill={isSelected ? '#f1f5f9' : '#94a3b8'}
              >
                {room.id}
              </text>
            </g>
          );
        })}

        {/* Navigation path */}
        {pathSegments.length > 1 && (
          <>
            {/* Glow effect */}
            <defs>
              <filter id="pathGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

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
          </>
        )}

        

        {/* Waypoints along path */}
        {pathSegments.slice(1, -1).map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="#0284c7"
            opacity="0.6"
          />
        ))}
      </g>
    </svg>
  );
}
