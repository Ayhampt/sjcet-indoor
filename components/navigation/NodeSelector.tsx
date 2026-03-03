'use client';

import React, { useState, useMemo } from 'react';
import { NavigationNode, Room } from '@/types/map.d';
import { ChevronDown, MapPin, Waypoints, Grid3x3, Zap } from 'lucide-react';

interface NodeSelectorProps {
  nodes: NavigationNode[];
  rooms: Room[];
  onSelectNode: (node: NavigationNode | Room) => void;
  selectedNodeId?: string;
  label?: string;
  placeholder?: string;
  includeJunctionsOnly?: boolean;
  showNodeType?: boolean;
}

export function NodeSelector({
  nodes,
  rooms,
  onSelectNode,
  selectedNodeId,
  label = 'Select Location',
  placeholder = 'Choose a node or room...',
  includeJunctionsOnly = false,
  showNodeType = true,
}: NodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and organize nodes
  const filteredNodes = useMemo(() => {
    let filtered = nodes;

    if (includeJunctionsOnly) {
      filtered = filtered.filter(
        (n) => n.nodeType === 'junction' || n.nodeType === 'stairs_only' || n.nodeType === 'accessible_directly'
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.id?.toLowerCase().includes(query) ||
          n.label?.toLowerCase().includes(query) ||
          n.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [nodes, searchQuery, includeJunctionsOnly]);

  const filteredRooms = useMemo(() => {
    if (!searchQuery) return rooms;
    const query = searchQuery.toLowerCase();
    return rooms.filter(
      (r) =>
        r.id?.toLowerCase().includes(query) ||
        r.name?.toLowerCase().includes(query) ||
        r.roomNumber?.toLowerCase().includes(query)
    );
  }, [rooms, searchQuery]);

  const getNodeIcon = (node: NavigationNode) => {
    switch (node.nodeType) {
      case 'junction':
        return <Grid3x3 className="w-4 h-4 text-purple-500" />;
      case 'stairs_only':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'accessible_directly':
        return <Waypoints className="w-4 h-4 text-blue-500" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-500" />;
    }
  };

  const selectedItem = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (node) return node;
    return rooms.find((r) => r.id === selectedNodeId);
  }, [selectedNodeId, nodes, rooms]);

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}

      <div className="relative">
        {/* Selector button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <span className="flex items-center gap-2">
            {selectedItem ? (
              <>
                {selectedItem && 'nodeType' in selectedItem && getNodeIcon(selectedItem as NavigationNode)}
                <span className="text-slate-900 dark:text-white font-medium">
                  {(selectedItem as any).label || (selectedItem as any).name || (selectedItem as any).id}
                </span>
              </>
            ) : (
              <span className="text-slate-500">{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
            {/* Search box */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder="Search nodes or rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Navigation nodes section */}
            {filteredNodes.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Navigation Nodes</div>
                {filteredNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      onSelectNode(node);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                      selectedNodeId === node.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    {getNodeIcon(node)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white truncate">{node.label || node.id}</div>
                      {showNodeType && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {node.nodeType || node.type} • {node.description?.substring(0, 30)}...
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Rooms section */}
            {filteredRooms.length > 0 && (
              <div className="py-2 border-t border-slate-200 dark:border-slate-700">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Rooms</div>
                {filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      onSelectNode(room);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                      selectedNodeId === room.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        Room {room.roomNumber}: {room.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{room.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredNodes.length === 0 && filteredRooms.length === 0 && (
              <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                No nodes or rooms found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
