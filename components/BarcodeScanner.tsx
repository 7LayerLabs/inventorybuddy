
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const scannerId = 'barcode-scanner';

    const startScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode(scannerId);

        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.7777778,
          },
          (decodedText) => {
            if (!hasScannedRef.current) {
              hasScannedRef.current = true;
              // Vibrate on successful scan if supported
              if (navigator.vibrate) {
                navigator.vibrate(200);
              }
              onScan(decodedText);
            }
          },
          () => {
            // QR code not found - this is called frequently, ignore
          }
        );
        setIsStarting(false);
      } catch (err) {
        console.error('Scanner error:', err);
        setError('Could not access camera. Please ensure camera permissions are granted.');
        setIsStarting(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-lg">Scan Barcode</h2>
            <p className="text-white/60 text-xs">Point camera at barcode</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scanner viewport */}
      <div className="h-full flex items-center justify-center">
        <div id="barcode-scanner" className="w-full max-w-lg" />
      </div>

      {/* Scanning indicator */}
      {isStarting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-bold">Starting camera...</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-6">
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 max-w-sm text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-white font-bold mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-white text-black px-6 py-3 rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom guide */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
          <p className="text-white/80 text-sm">
            Position the barcode within the frame
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
