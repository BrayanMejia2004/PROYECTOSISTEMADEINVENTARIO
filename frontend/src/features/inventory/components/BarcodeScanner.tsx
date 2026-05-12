import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export const BarcodeScanner = ({ onScan }: { onScan: (barcode: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scanning) return;

    const codeReader = new BrowserMultiFormatReader();
    
    const startScan = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          setError('No se encontró cámara');
          return;
        }

        codeReader.decodeFromVideoDevice(
          videoInputDevices[0].deviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              onScan(result.getText());
              setScanning(false);
              codeReader.reset();
            }
            if (err && err.name !== 'NotFoundException') {
              setError('Error al escanear');
            }
          }
        );
      } catch (err) {
        setError('Error al acceder a la cámara');
      }
    };

    startScan();

    return () => {
      codeReader.reset();
    };
  }, [scanning, onScan]);

  return (
    <div>
      <button
        onClick={() => setScanning(!scanning)}
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        {scanning ? 'Detener' : 'Escanear Código'}
      </button>

      {scanning && (
        <div className="mt-4">
          <video ref={videoRef} className="w-full max-w-md" />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};
