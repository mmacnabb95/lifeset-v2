"use client";

import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";

interface CheckInResult {
  success: boolean;
  message: string;
  attendanceId?: string;
  timestamp: Date;
  qrCode?: string;
}

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<CheckInResult[]>([]);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef<HTMLDivElement>(null);
  const qrCodeScannerRef = useRef<any>(null);

  useEffect(() => {
    loadData();
    return () => {
      // Cleanup scanner on unmount - wrap to avoid removeChild DOM errors
      if (qrCodeScannerRef.current) {
        const scanner = qrCodeScannerRef.current;
        qrCodeScannerRef.current = null;
        try {
          scanner.stop().catch(() => {});
        } catch {
          /* ignore sync DOM errors */
        }
      }
    };
  }, []);

  const loadData = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      // Get user's organisation
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const orgId = userData?.organisationId;

      if (!orgId) {
        setLoading(false);
        return;
      }

      setOrganisationId(orgId);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    if (!scannerRef.current) return;

    setScanning(true);
    // Yield to React so #qr-reader is visible before library injects DOM
    await new Promise((r) => setTimeout(r, 0));

    try {
      // Dynamically import html5-qrcode
      const { Html5Qrcode } = await import("html5-qrcode");
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      
      await html5QrCode.start(
        { facingMode: "user" }, // Use front camera (works on laptops; "environment" = back camera for phones)
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code detected
          handleQRCodeDetected(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (they're frequent during scanning)
        }
      );

      qrCodeScannerRef.current = html5QrCode;
    } catch (error: any) {
      setScanning(false);
      console.error("Error starting scanner:", error);
      alert(`Failed to start camera: ${error.message}\n\nMake sure you grant camera permissions.`);
    }
  };

  const stopScanner = async () => {
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop();
        // Don't call clear() - it can cause removeChild errors when React has re-rendered
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
      qrCodeScannerRef.current = null;
    }
    setScanning(false);
  };

  const handleQRCodeDetected = async (qrCode: string) => {
    // Stop scanner temporarily to prevent multiple scans
    await stopScanner();

    const user = getCurrentUser();
    if (!user || !organisationId) {
      addResult({
        success: false,
        message: "Error: Not authenticated or no organisation",
        timestamp: new Date(),
        qrCode,
      });
      return;
    }

    try {
      // Get Firebase Auth token
      const idToken = await user.getIdToken();

      const url = "https://us-central1-lifeset-v2.cloudfunctions.net/validateQRCheckIn";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          qrCode,
          classId: null,
        }),
      });

      let data: { success?: boolean; error?: string; message?: string; attendanceId?: string };
      try {
        data = await response.json();
      } catch {
        addResult({
          success: false,
          message: `Server error (${response.status}). Ensure the Cloud Function is deployed: cd functions && npm run deploy`,
          timestamp: new Date(),
          qrCode,
        });
        return;
      }

      if (response.ok && data.success) {
        addResult({
          success: true,
          message: data.message || "Check-in successful!",
          attendanceId: data.attendanceId,
          timestamp: new Date(),
          qrCode,
        });
      } else {
        const errMsg = data.message || data.error || "Check-in failed";
        addResult({
          success: false,
          message: errMsg,
          timestamp: new Date(),
          qrCode,
        });
      }
    } catch (error: any) {
      console.error("Error validating QR code:", error);
      const isNetworkError = error?.message === "Failed to fetch" || error?.name === "TypeError";
      const hint = isNetworkError
        ? " Check network, CORS, or deploy the function: cd functions && npm run deploy"
        : "";
      addResult({
        success: false,
        message: `Error: ${error.message || "Failed to validate QR code"}${hint}`,
        timestamp: new Date(),
        qrCode,
      });
    }

    // Restart scanner after a short delay
    setTimeout(() => {
      startScanner();
    }, 2000);
  };

  const addResult = (result: CheckInResult) => {
    setResults((prev) => [result, ...prev].slice(0, 10)); // Keep last 10 results
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!organisationId) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">QR Scanner</h1>
          <p className="mt-2 text-sm text-gray-600">
            Scan QR codes to check in members
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            You need to belong to an organisation to use the QR scanner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">QR Scanner</h1>
        <p className="mt-2 text-sm text-gray-600">
          Scan member QR codes to check them in
        </p>
      </div>

      {/* Scanner Controls */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Camera Scanner</h2>
          {!scanning ? (
            <button
              onClick={startScanner}
              className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark focus:outline-none focus:ring-2 focus:ring-lifeset-primary"
            >
              Start Scanner
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Stop Scanner
            </button>
          )}
        </div>

        {/* QR Code Scanner - use dedicated empty container to avoid removeChild DOM conflicts with React */}
        <div className="relative w-full min-h-[300px]">
          <div
            id="qr-reader"
            ref={scannerRef}
            className={`w-full min-h-[300px] ${scanning ? "block" : "hidden"}`}
          />
          {!scanning && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg text-gray-500"
              aria-hidden="true"
            >
              <p className="text-lg mb-2">📷</p>
              <p>Click &quot;Start Scanner&quot; to begin scanning QR codes</p>
              <p className="text-sm mt-2">Make sure to grant camera permissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recent Check-ins ({results.length})
        </h2>
        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No check-ins yet. Scan a QR code to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  result.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl ${result.success ? "✅" : "❌"}`}></span>
                      <span
                        className={`font-medium ${
                          result.success ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {result.message}
                      </span>
                    </div>
                    {result.qrCode && (
                      <p className="text-xs text-gray-600 mt-1 font-mono">
                        Code: {result.qrCode.substring(0, 20)}...
                      </p>
                    )}
                    {result.attendanceId && (
                      <p className="text-xs text-gray-600 mt-1">
                        Attendance ID: {result.attendanceId}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

