'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, QrCode, MapPin, ArrowRight, AlertCircle, CheckCircle2, Loader, RotateCcw } from 'lucide-react';
import { NavigationNode, Room, FloorData, NavigationState } from '@/types/map.d';
import { NodeSelector } from './NodeSelector';
import { QRScanner } from './QRScanner';

interface NavigationControlPanelProps {
  nodes: NavigationNode[];
  rooms: Room[];
  floorsData: FloorData[];
  currentFloor: number;
  navigationState: NavigationState | null;
  selectedDestination: Room | null;
  onNavigate: (destination: Room | NavigationNode) => void;
  onClearNavigation: () => void;
  distance?: number;
  estimatedTime?: number;
  instructions: string[];
}

type StartPointSource = 'manual' | 'qr' | 'current_location';
type DestinationSource = 'manual' | 'qr' | 'search';

interface NavigationPoint {
  nodeId?: string;
  roomId?: string;
  label: string;
  source: StartPointSource | DestinationSource;
  timestamp: number;
}

export function NavigationControlPanel({
  nodes,
  rooms,
  floorsData,
  currentFloor,
  navigationState,
  selectedDestination,
  onNavigate,
  onClearNavigation,
  distance,
  estimatedTime,
  instructions,
}: NavigationControlPanelProps) {
  const [startPoint, setStartPoint] = useState<NavigationPoint | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<NavigationPoint | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [scanType, setScanType] = useState<'start' | 'destination'>('destination');
  const [showHistory, setShowHistory] = useState(false);

  // Get current nodes for this floor
  const currentFloorData = floorsData.find((f) => f.floorLevel === currentFloor);
  const currentFloorNodes = currentFloorData?.navigation.nodes || [];
  const currentFloorRooms = currentFloorData?.rooms || [];

  // Initialize start point with current floor's central node
  useEffect(() => {
    if (!startPoint && currentFloorNodes.length > 0) {
      const centralNode = currentFloorNodes.find((n) => n.label?.includes('Center') || n.label?.includes('Central'));
      if (centralNode) {
        setStartPoint({
          nodeId: centralNode.id,
          label: centralNode.label || 'Starting Point',
          source: 'current_location',
          timestamp: Date.now(),
        });
      }
    }
  }, [currentFloor]);

  const handleQRScan = (data: { nodeId: string; nodeName: string; type: 'start' | 'destination' }) => {
    const point: NavigationPoint = {
      nodeId: data.nodeId,
      label: data.nodeName,
      source: 'qr',
      timestamp: Date.now(),
    };

    if (data.type === 'start') {
      setStartPoint(point);
    } else {
      setDestinationPoint(point);
    }
  };

  const handleNodeSelect = (node: NavigationNode | Room, pointType: 'start' | 'destination') => {
    const isRoom = 'roomNumber' in node;
    const point: NavigationPoint = {
      ...(isRoom ? { roomId: node.id } : { nodeId: node.id }),
      label: isRoom ? `Room ${(node as Room).roomNumber}` : (node as NavigationNode).label || node.id,
      source: pointType === 'start' ? 'manual' : 'manual',
      timestamp: Date.now(),
    };

    if (pointType === 'start') {
      setStartPoint(point);
    } else {
      setDestinationPoint(point);
    }
  };

  const handleStartNavigation = () => {
    if (!destinationPoint) {
      alert('Please select a destination');
      return;
    }

    // Find the destination room or node
    if (destinationPoint.roomId) {
      const room = rooms.find((r) => r.id === destinationPoint.roomId);
      if (room) {
        onNavigate(room);
      }
    } else if (destinationPoint.nodeId) {
      const node = nodes.find((n) => n.id === destinationPoint.nodeId);
      if (node) {
        onNavigate(node as any);
      }
    }
  };

  const handleSwapPoints = () => {
    const temp = startPoint;
    setStartPoint(destinationPoint);
    setDestinationPoint(temp);
  };

  const getSourceIcon = (source: StartPointSource | DestinationSource) => {
    switch (source) {
      case 'qr':
        return <QrCode className="w-4 h-4 text-blue-500" />;
      case 'manual':
        return <MapPin className="w-4 h-4 text-slate-500" />;
      case 'current_location':
        return <Navigation className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Navigation Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Navigation className="w-5 h-5" />
          <h3 className="font-bold">Smart Navigation</h3>
        </div>
        <p className="text-sm text-blue-100">Select your starting point and destination to find the optimal route</p>
      </div>

      {/* Start Point Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-900 dark:text-white">Starting Point</h4>
          <button
            onClick={() => {
              setScanType('start');
              setQrScannerOpen(true);
            }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Scan QR code"
          >
            <QrCode className="w-5 h-5 text-blue-500" />
          </button>
        </div>

        {startPoint ? (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg mb-3">
            {getSourceIcon(startPoint.source)}
            <div className="flex-1">
              <p className="font-medium text-green-900 dark:text-green-100">{startPoint.label}</p>
              <p className="text-xs text-green-700 dark:text-green-300">{startPoint.source === 'qr' ? 'Scanned' : 'Selected'}</p>
            </div>
            <button
              onClick={() => setStartPoint(null)}
              className="p-1 hover:bg-white/50 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-green-600 dark:text-green-400" />
            </button>
          </div>
        ) : (
          <NodeSelector
            nodes={currentFloorNodes}
            rooms={currentFloorRooms}
            onSelectNode={(node) => handleNodeSelect(node, 'start')}
            label=""
            placeholder="Select a starting node or room..."
            showNodeType={true}
          />
        )}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSwapPoints}
          disabled={!startPoint || !destinationPoint}
          className="p-2.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
          title="Swap start and destination"
        >
          <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 rotate-90" />
        </button>
      </div>

      {/* Destination Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-900 dark:text-white">Destination</h4>
          <button
            onClick={() => {
              setScanType('destination');
              setQrScannerOpen(true);
            }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Scan QR code"
          >
            <QrCode className="w-5 h-5 text-blue-500" />
          </button>
        </div>

        {destinationPoint ? (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg mb-3">
            {getSourceIcon(destinationPoint.source)}
            <div className="flex-1">
              <p className="font-medium text-purple-900 dark:text-purple-100">{destinationPoint.label}</p>
              <p className="text-xs text-purple-700 dark:text-purple-300">{destinationPoint.source === 'qr' ? 'Scanned' : 'Selected'}</p>
            </div>
            <button
              onClick={() => setDestinationPoint(null)}
              className="p-1 hover:bg-white/50 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>
          </div>
        ) : (
          <NodeSelector
            nodes={currentFloorNodes}
            rooms={currentFloorRooms}
            onSelectNode={(node) => handleNodeSelect(node, 'destination')}
            label=""
            placeholder="Select a destination node or room..."
            showNodeType={true}
          />
        )}
      </div>

      {/* Active Navigation Info */}
      {navigationState && selectedDestination && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Navigation Active</h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Route to <strong>{selectedDestination.name}</strong> (Room {selectedDestination.roomNumber})
              </p>
            </div>
          </div>

          {/* Route info */}
          {(distance || estimatedTime) && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {distance && (
                <div className="bg-white dark:bg-slate-800 rounded p-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Distance</p>
                  <p className="font-bold text-green-600 dark:text-green-400">{distance}m</p>
                </div>
              )}
              {estimatedTime && (
                <div className="bg-white dark:bg-slate-800 rounded p-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Estimated Time</p>
                  <p className="font-bold text-green-600 dark:text-green-400">{estimatedTime} min</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClearNavigation}
            className="w-full px-3 py-2 text-sm font-medium text-green-700 dark:text-green-300 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700 border border-green-200 dark:border-green-800 rounded transition-colors"
          >
            Clear Route
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleStartNavigation}
          disabled={!destinationPoint}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Navigation className="w-5 h-5" />
          {navigationState ? 'Update Route' : 'Start Navigation'}
        </button>

        {navigationState && (
          <button
            onClick={onClearNavigation}
            className="px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Instructions preview */}
      {instructions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Navigation Steps
          </h4>
          <div className="space-y-2">
            {instructions.slice(0, 3).map((instruction, idx) => (
              <div key={idx} className="flex gap-2 text-sm text-blue-800 dark:text-blue-200">
                <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">{idx + 1}.</span>
                <span>{instruction}</span>
              </div>
            ))}
            {instructions.length > 3 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                +{instructions.length - 3} more steps
              </button>
            )}
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        scanType={scanType}
        onScan={handleQRScan}
      />
    </div>
  );
}
