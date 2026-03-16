"use client";
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    // 1. Fungsi buat jalanin scanner
    const scanner = new Html5QrcodeScanner(
      "reader", // Harus sama dengan id div di bawah
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      // Masukin logic Supabase lu di sini kayak tadi
      console.log("QR Terdeteksi:", decodedText);
      // scanner.clear(); // Opsional: Berhenti scan kalau udah dapet
    }

    function onScanFailure(error: any) {
      // Biarin kosong biar nggak menuhin console
    }

    // 2. Fungsi Cleanup (Biar nggak crash pas pindah halaman)
    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-xl font-bold mb-6 italic">SCANNER KEHADIRAN</h1>
        
        {/* BOX SCANNER */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border-4 border-blue-500">
          <div id="reader" className="w-full"></div>
        </div>

        <p className="mt-4 text-slate-400 text-sm">
          Kalau kamera nggak muncul, pastiin izin kamera di browser udah <b>"Allow"</b>.
        </p>
      </div>

      {/* Tampilan hasil scan lu yang kemaren di sini ... */}
    </main>
  );
}