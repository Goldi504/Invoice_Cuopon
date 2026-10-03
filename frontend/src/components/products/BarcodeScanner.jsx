import { useEffect, useRef } from "react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const startingRef = useRef(false);
  const stoppedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let scanner = null;

    const stopScanner = async (instance) => {
      if (!instance) return;

      try {
        if (instance.isScanning) {
          await instance.stop();
        }
      } catch (error) {
        console.log("Scanner stop error:", error.message);
      }

      try {
        await instance.clear();
      } catch (error) {
        console.log("Scanner clear error:", error.message);
      }

      if (scannerRef.current === instance) {
        scannerRef.current = null;
      }
    };

    const startScanner = async () => {
      if (startingRef.current || scannerRef.current) {
        return;
      }

      startingRef.current = true;
      stoppedRef.current = false;

      try {
        const reader = document.getElementById("barcode-reader");

        if (!reader) {
          throw new Error("Barcode reader element not found");
        }

        // Remove any old scanner HTML
        reader.innerHTML = "";

        scanner = new Html5Qrcode("barcode-reader");

        scannerRef.current = scanner;

        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,

            qrbox: {
              width: 280,
              height: 180,
            },

            aspectRatio: 1.7777778,

            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.ITF,
            ],
          },

          async (decodedText) => {
            if (!mounted || stoppedRef.current) {
              return;
            }

            console.log("Barcode / QR detected:", decodedText);

            stoppedRef.current = true;

            await stopScanner(scanner);

            if (mounted) {
              onScan(decodedText);
            }
          },

          () => {
            // Ignore continuous scan errors
          }
        );

        // Component was closed while camera was starting
        if (!mounted || stoppedRef.current) {
          await stopScanner(scanner);
          return;
        }

        console.log("Camera started successfully");
      } catch (error) {
        console.error("Camera start error:", error);

        if (mounted && !stoppedRef.current) {
          alert(
            "Unable to start camera.\n\n" +
              "Please check browser camera permission and make sure another application is not using the camera."
          );

          onClose();
        }
      } finally {
        startingRef.current = false;
      }
    };

    startScanner();

    return () => {
      mounted = false;
      stoppedRef.current = true;

      if (scanner) {
        stopScanner(scanner);
      }
    };
  }, [onScan, onClose]);

  const handleClose = async () => {
    stoppedRef.current = true;

    const scanner = scannerRef.current;

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (error) {
        console.log("Stop camera error:", error.message);
      }

      try {
        await scanner.clear();
      } catch (error) {
        console.log("Clear camera error:", error.message);
      }

      scannerRef.current = null;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Scan Product
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Scan a product barcode or QR code
          </p>
        </div>

        {/* Camera */}
        <div
          id="barcode-reader"
          className="min-h-[350px] overflow-hidden rounded-2xl bg-black"
        />

        {/* Instruction */}
        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-600">
          Keep the QR code or barcode clearly visible inside
          the scanning area.
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Stop Camera & Close
        </button>
      </div>
    </div>
  );
}

export default BarcodeScanner;