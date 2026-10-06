import { useEffect, useRef, useState } from "react";

import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

import { createWorker } from "tesseract.js";

function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const workerRef = useRef(null);

  const startingRef = useRef(false);
  const stoppedRef = useRef(false);
  const mountedRef = useRef(true);

  // IMPORTANT:
  // Keep latest OCR text in ref.
  const ocrTextRef = useRef("");

  const ocrIntervalRef = useRef(null);
  const ocrRunningRef = useRef(false);

  // Prevent sending multiple times
  const submittedRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [ocrStatus, setOcrStatus] = useState(
    "Starting camera..."
  );
  const [detectedText, setDetectedText] = useState("");

  /*
  ============================================================
  STOP EVERYTHING
  ============================================================
  */

  const stopScanner = async () => {
    stoppedRef.current = true;

    if (ocrIntervalRef.current) {
      clearInterval(ocrIntervalRef.current);
      ocrIntervalRef.current = null;
    }

    if (workerRef.current) {
      try {
        await workerRef.current.terminate();
      } catch (error) {
        console.log(
          "OCR worker terminate error:",
          error
        );
      }

      workerRef.current = null;
    }

    const scanner = scannerRef.current;

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (error) {
        console.log(
          "Scanner stop error:",
          error
        );
      }

      try {
        await scanner.clear();
      } catch (error) {
        console.log(
          "Scanner clear error:",
          error
        );
      }

      scannerRef.current = null;
    }

    const reader =
      document.getElementById("barcode-reader");

    if (reader) {
      reader.innerHTML = "";
    }
  };

  /*
  ============================================================
  SEND RESULT
  ============================================================
  */

  const submitScanResult = async ({
    barcode = "",
    ocrText = "",
  }) => {
    if (!mountedRef.current) return;

    if (stoppedRef.current) return;

    if (submittedRef.current) return;

    const cleanBarcode =
      barcode?.toString().trim() || "";

    const cleanOCR =
      ocrText?.toString().trim() || "";

    /*
    Need at least one useful value
    */

    if (!cleanBarcode && !cleanOCR) {
      return;
    }

    /*
    OCR should contain enough useful text.
    Avoid submitting tiny/random OCR results.
    */

    if (
      !cleanBarcode &&
      cleanOCR.length < 8
    ) {
      return;
    }

    submittedRef.current = true;

    console.log(
      "FINAL SCAN RESULT:",
      {
        barcode: cleanBarcode,
        ocrText: cleanOCR,
      }
    );

    await stopScanner();

    if (mountedRef.current) {
      onScan({
        barcode: cleanBarcode,
        ocrText: cleanOCR,
      });
    }
  };

  /*
  ============================================================
  OCR
  ============================================================
  */

  const runOCR = async () => {
    if (!mountedRef.current) return;

    if (stoppedRef.current) return;

    if (ocrRunningRef.current) return;

    if (submittedRef.current) return;

    const video =
      document.querySelector(
        "#barcode-reader video"
      );

    if (!video) {
      return;
    }

    if (
      video.readyState < 2 ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return;
    }

    ocrRunningRef.current = true;

    try {
      setOcrStatus(
        "Reading product label..."
      );

      /*
      ========================================================
      CAPTURE CAMERA
      ========================================================
      */

      const canvas =
        document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context =
        canvas.getContext("2d");

      /*
      Improve OCR image
      */

      context.filter =
        "contrast(1.4) brightness(1.1)";

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const imageData =
        canvas.toDataURL(
          "image/jpeg",
          0.95
        );

      /*
      ========================================================
      CREATE OCR WORKER
      ========================================================
      */

      if (!workerRef.current) {
        const worker =
          await createWorker("eng");

        workerRef.current = worker;
      }

      /*
      ========================================================
      OCR
      ========================================================
      */

      const result =
        await workerRef.current.recognize(
          imageData
        );

      const text =
        result?.data?.text || "";

      const cleanText =
        text.trim();

      if (
        !mountedRef.current ||
        stoppedRef.current
      ) {
        return;
      }

      if (cleanText) {
        console.log(
          "OCR RESULT:",
          cleanText
        );

        /*
        IMPORTANT:
        Save latest OCR in REF
        */

        ocrTextRef.current =
          cleanText;

        setDetectedText(
          cleanText
        );

        setOcrStatus(
          "Product information detected."
        );

        /*
        ======================================================
        AUTO SUBMIT OCR
        ======================================================

        If no barcode is detected,
        OCR alone can continue the process.

        Wait until OCR has reasonable
        amount of information.
        */

        if (
          cleanText.length >= 15
        ) {
          await submitScanResult({
            barcode: "",
            ocrText: cleanText,
          });
        }
      }
    } catch (error) {
      console.error(
        "OCR Error:",
        error
      );

      if (mountedRef.current) {
        setOcrStatus(
          "Move the phone label closer and keep it steady."
        );
      }
    } finally {
      ocrRunningRef.current =
        false;
    }
  };

  /*
  ============================================================
  START CAMERA
  ============================================================
  */

  useEffect(() => {
    mountedRef.current = true;

    stoppedRef.current = false;

    submittedRef.current = false;

    let scanner = null;

    const startScanner =
      async () => {
        if (
          startingRef.current ||
          scannerRef.current
        ) {
          return;
        }

        startingRef.current =
          true;

        try {
          const reader =
            document.getElementById(
              "barcode-reader"
            );

          if (!reader) {
            throw new Error(
              "Barcode reader element not found"
            );
          }

          reader.innerHTML = "";

          scanner =
            new Html5Qrcode(
              "barcode-reader"
            );

          scannerRef.current =
            scanner;

          await scanner.start(
            {
              facingMode:
                "environment",
            },

            {
              fps: 10,

              qrbox: {
                width: 320,
                height: 220,
              },

              aspectRatio:
                1.7777778,

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

            /*
            ==================================================
            BARCODE DETECTED
            ==================================================
            */

            async (decodedText) => {
              if (
                !mountedRef.current ||
                stoppedRef.current
              ) {
                return;
              }

              console.log(
                "BARCODE DETECTED:",
                decodedText
              );

              /*
              Get latest OCR text
              from REF
              */

              const latestOCR =
                ocrTextRef.current;

              await submitScanResult({
                barcode:
                  decodedText,

                ocrText:
                  latestOCR,
              });
            },

            () => {
              // Ignore scanner errors
            }
          );

          if (
            !mountedRef.current ||
            stoppedRef.current
          ) {
            await stopScanner();

            return;
          }

          setCameraReady(
            true
          );

          setOcrStatus(
            "Camera ready. Keep the complete phone label visible."
          );

          /*
          ====================================================
          OCR START
          ====================================================
          */

          ocrIntervalRef.current =
            setInterval(() => {
              runOCR();
            }, 3500);

          /*
          First OCR after camera starts
          */

          setTimeout(() => {
            runOCR();
          }, 1500);
        } catch (error) {
          console.error(
            "Camera start error:",
            error
          );

          if (
            mountedRef.current
          ) {
            alert(
              "Unable to start camera.\n\n" +
                "Please allow camera permission and make sure another application is not using the camera."
            );

            onClose();
          }
        } finally {
          startingRef.current =
            false;
        }
      };

    startScanner();

    /*
    ============================================================
    CLEANUP
    ============================================================
    */

    return () => {
      mountedRef.current =
        false;

      stoppedRef.current =
        true;

      if (
        ocrIntervalRef.current
      ) {
        clearInterval(
          ocrIntervalRef.current
        );

        ocrIntervalRef.current =
          null;
      }

      if (scanner) {
        const cleanup =
          async () => {
            try {
              if (
                scanner.isScanning
              ) {
                await scanner.stop();
              }
            } catch {}

            try {
              await scanner.clear();
            } catch {}

            if (
              scannerRef.current ===
              scanner
            ) {
              scannerRef.current =
                null;
            }
          };

        cleanup();
      }
    };
  }, []);

  /*
  ============================================================
  CLOSE
  ============================================================
  */

  const handleClose =
    async () => {
      await stopScanner();

      onClose();
    };

  /*
  ============================================================
  UI
  ============================================================
  */

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">

      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">

        {/* HEADER */}

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Scan Product
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Show the complete phone label to the camera.
          </p>
        </div>

        {/* CAMERA */}

        <div
          id="barcode-reader"
          className="min-h-[380px] overflow-hidden rounded-2xl bg-black"
        />

        {/* STATUS */}

        <div className="mt-4 rounded-xl bg-gray-50 p-4">

          <div className="flex items-center gap-2">

            <div
              className={`h-2.5 w-2.5 rounded-full ${
                cameraReady
                  ? "bg-green-500"
                  : "animate-pulse bg-yellow-500"
              }`}
            />

            <p className="text-sm font-medium text-gray-700">
              {ocrStatus}
            </p>

          </div>

        </div>

        {/* OCR */}

        {detectedText && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">

            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Detected Text
            </p>

            <p className="mt-2 max-h-32 overflow-auto whitespace-pre-line text-sm text-gray-700">
              {detectedText}
            </p>

          </div>
        )}

        {/* INSTRUCTION */}

        <div className="mt-4 rounded-xl bg-yellow-50 p-4 text-center">

          <p className="text-sm font-semibold text-gray-700">
            Move the label closer and keep it steady.
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Make sure the model and 8GB/128GB text
            are sharp and readable.
          </p>

        </div>

        {/* CLOSE */}

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