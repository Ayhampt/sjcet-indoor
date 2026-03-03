'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, MapPin, Navigation } from 'lucide-react';
import { NavigationNode, Room } from '@/types/map.d';

interface NodeSelectorProps {
  nodes: NavigationNode[];
  rooms: Room[];
  onSelectNode: (node: NavigationNode | Room) => void;
  label?: string;
  placeholder?: string;
  showNodeType?: boolean;
}

export function NodeSelector({
  nodes,
  rooms,
  onSelectNode,
  label = 'Select a location',
  placeholder = 'Choose a node or room...',
  showNodeType = false,
}: NodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Combine nodes and rooms for selection
  const allItems = useMemo(() => {
    return [
      ...nodes.map((node) => ({
        id: node.id,
        name: node.label || node.id,
        type: 'node' as const,
        nodeType: node.nodeType || node.type,
        node,
      })),
      ...rooms.map((room) => ({
        id: room.id,
        name: `Room ${room.roomNumber} - ${room.name}`,
        type: 'room' as const,
        nodeType: room.type,
        room,
      })),
    ];
  }, [nodes, rooms]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return allItems;

    const query = searchQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
    );
  }, [searchQuery, allItems]);

  const handleSelect = (item: typeof allItems[0]) => {
    if (item.type === 'node' && item.node) {
      onSelectNode(item.node);
    } else if (item.type === 'room' && item.room) {
      onSelectNode(item.room);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  const getNodeTypeLabel = (nodeType?: string) => {
    if (!nodeType) return '';
    
    switch (nodeType) {
      case 'junction':
        return 'Junction';
      case 'stairs_only':
        return 'Stairs Only';
      case 'accessible_directly':
        return 'Direct Access';
      case 'stair_node':
        return 'Stair Node';
      case 'qr_point':
        return 'QR Point';
      case 'portal':
        return 'Portal';
      default:
        return nodeType.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  };

  const getNodeTypeColor = (nodeType?: string) => {
    switch (nodeType) {
      case 'junction':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'stairs_only':
      case 'stair_node':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'qr_point':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'portal':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Dropdown button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 text-left bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-between gap-2"
        >
          <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
            {/* Search input */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder="Search nodes or rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                autoFocus
              />
            </div>

            {/* Items list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredItems.length > 0 ? (
                <div className="py-1">
                  {/* Group by type */}
                  {filteredItems.filter((item) => item.type === 'node').length > 0 && (
                    <>
                      <p className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Nodes
                      </p>
                      {filteredItems
                        .filter((item) => item.type === 'node')
                        .map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.id}</p>
                              </div>
                              {showNodeType && item.nodeType && (
                                <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${getNodeTypeColor(item.nodeType)}`}>
                                  {getNodeTypeLabel(item.nodeType)}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                    </>
                  )}

                  {filteredItems.filter((item) => item.type === 'room').length > 0 && (
                    <>
                      <p className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Rooms
                      </p>
                      {filteredItems
                        .filter((item) => item.type === 'room')
                        .map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.id}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Navigation className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No results found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
