'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: { nodeId: string; nodeName: string; type: 'start' | 'destination' }) => void;
  scanType: 'start' | 'destination';
  isOpen: boolean;
  onClose: () => void;
}

// Mock QR code data mapping (in production, use jsQR or similar library)
const QR_CODE_MAP: Record<string, { nodeId: string; nodeName: string }> = {
  'QR_SP_G_CENTER': { nodeId: 'SP_G_QR_ENTRY', nodeName: 'Ground Floor Center' },
  'QR_SP_G_NORTH': { nodeId: 'SP_G_N_HALL_N', nodeName: 'North Hallway' },
  'QR_SP_G_SOUTH': { nodeId: 'SP_G_N_HALL_S', nodeName: 'South Hallway' },
  'QR_SP_G_STAIR_A': { nodeId: 'SP_G_STAIR_NODE_A', nodeName: 'Staircase A' },
  'QR_SP_G_STAIR_B': { nodeId: 'SP_G_STAIR_NODE_B', nodeName: 'Staircase B' },
  'QR_SP_1_CENTER': { nodeId: 'SP_1_QR_ENTRY', nodeName: 'First Floor Center' },
};

export function QRScanner({ onScan, scanType, isOpen, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [manualInput, setManualInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    // Simulate QR code reading (in production, use jsQR library)
    setTimeout(() => {
      const qrCode = `QR_SP_G_${['CENTER', 'NORTH', 'SOUTH', 'STAIR_A', 'STAIR_B'][Math.floor(Math.random() * 5)]}`;
      const data = QR_CODE_MAP[qrCode];

      if (data) {
        setScanResult({ success: true, message: `Located: ${data.nodeName}` });
        setTimeout(() => {
          onScan({ ...data, type: scanType });
          handleClose();
        }, 1500);
      } else {
        setScanResult({ success: false, message: 'QR code not recognized' });
      }

      setIsScanning(false);
    }, 1500);
  };

  const handleManualInput = () => {
    if (!manualInput.trim()) return;

    const data = QR_CODE_MAP[manualInput.toUpperCase()];
    if (data) {
      onScan({ ...data, type: scanType });
      handleClose();
    } else {
      setScanResult({ success: false, message: 'QR code not found in system' });
    }
  };

  const handleClose = () => {
    setManualInput('');
    setScanResult(null);
    setIsScanning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Scan {scanType === 'start' ? 'Starting Point' : 'Destination'} QR Code
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Camera preview / scan area */}
        <div className="mb-6 p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg flex flex-col items-center justify-center gap-4 min-h-64">
          {isScanning ? (
            <>
              <Loader className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Scanning...</p>
            </>
          ) : scanResult ? (
            <>
              {scanResult.success ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <AlertCircle className="w-12 h-12 text-red-500" />
              )}
              <p className={`text-sm font-medium ${scanResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {scanResult.message}
              </p>
            </>
          ) : (
            <>
              <Camera className="w-12 h-12 text-blue-400" />
              <p className="text-slate-600 dark:text-slate-400 text-sm text-center">
                Point camera at QR code to scan
              </p>
            </>
          )}
        </div>

        {/* Upload button */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            {isScanning ? 'Scanning...' : 'Upload QR Image'}
          </button>
        </div>

        {/* Manual input */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Or enter QR code manually:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualInput()}
              placeholder="e.g., QR_SP_G_CENTER"
              className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleManualInput}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Enter
            </button>
          </div>
        </div>

        {/* Available QR codes info */}
        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Available QR codes:</p>
          <div className="flex flex-wrap gap-1">
            {Object.keys(QR_CODE_MAP).map((qr) => (
              <span
                key={qr}
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-400"
              >
                {qr}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
