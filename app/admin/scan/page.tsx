"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // --- FITUR SUARA BEEP ---
  const playBeep = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime); // Nada tinggi
    gainNode.gain.setValueAtTime(0.1, context.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.1); // Bunyi cuma 0.1 detik
  };

  useEffect(() => {
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 15, // Ditinggiin dikit biar lebih responsif tapi stabil
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0 
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          () => {} // Ignore scan failure (biar console bersih)
        );
      } catch (err: any) {
        console.error("Gagal start kamera:", err);
        setErrorMsg(`Kamera gagal: ${err.message || "Pastikan izin kamera di-Allow"}`);
      }
    };

    const timeoutId = setTimeout(startScanner, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  async function onScanSuccess(decodedText: string) {
    // FITUR PAUSE: Biar gak double scan pas data lagi ditarik
    if (isProcessing) return;
    setIsProcessing(true);
    
    // Stop scanning visual sementara (Pause)
    if (scannerRef.current) {
        scannerRef.current.pause(true); 
    }

    try {
      const { data: participant, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', decodedText)
        .single();

      playBeep(); // Bunyi pas dapet kode (berhasil/gagal tetep bunyi)

      if (error || !participant) {
        setScanResult({ success: false, message: 'Data gak ketemu!' });
      } else if (!participant.is_paid) {
        setScanResult({ success: false, message: 'Belum bayar, Dil!', name: participant.full_name });
      } else if (participant.is_checked_in) {
        setScanResult({ success: false, message: 'Sudah masuk sebelumnya!', name: participant.full_name });
      } else {
        await supabase
          .from('participants')
          .update({ is_checked_in: true, checked_in_at: new Date().toISOString() })
          .eq('id', decodedText);
        
        setScanResult({ success: true, message: 'Berhasil Check-in!', name: participant.full_name });
      }
    } catch (err) {
      setScanResult({ success: false, message: 'System Error' });
    }
  }

  // --- FITUR RESUME ---
  const handleCloseOverlay = () => {
    setScanResult(null);
    setIsProcessing(false);
    // Lanjut scan lagi setelah tombol diklik
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-6 relative">
      <div className="max-w-md mx-auto">
        <Link href="/admin" className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Kembali ke Admin
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold italic text-blue-400">GATE SCANNER 🚀</h1>
          <p className="text-slate-400 text-sm italic">Point camera to QR Code</p>
        </div>

        <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-500/30 aspect-square flex items-center justify-center">
          {errorMsg ? (
            <div className="p-6 text-center">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <p className="text-sm text-red-400 font-medium">{errorMsg}</p>
              <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 px-4 py-2 rounded-lg text-xs">Refresh</button>
            </div>
          ) : (
            <div id="reader" className="w-full h-full"></div>
          )}
          
          {!errorMsg && !scanResult && (
            <div className="absolute inset-0 border-[60px] border-black/20 pointer-events-none">
               <div className="w-full h-full border-2 border-blue-500/40 rounded-lg animate-pulse"></div>
            </div>
          )}

          {/* Label status pause */}
          {isProcessing && !scanResult && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <p className="text-blue-400 font-bold animate-bounce uppercase">Processing...</p>
            </div>
          )}
        </div>
      </div>

      {scanResult && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300 ${
          scanResult.success ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <div className="bg-white p-8 rounded-full mb-6 shadow-2xl">
            {scanResult.success ? (
              <CheckCircle2 className="text-green-600" size={80} />
            ) : (
              <AlertCircle className="text-red-600" size={80} />
            )}
          </div>
          <h2 className="text-4xl font-black text-center mb-2 uppercase break-words px-4 leading-tight">
            {scanResult.name || 'Gagal'}
          </h2>
          <p className="text-xl font-bold bg-black/20 px-6 py-2 rounded-full uppercase italic text-center">
            {scanResult.message}
          </p>
          <button 
            onClick={handleCloseOverlay}
            className="mt-12 bg-white text-black font-black px-12 py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase"
          >
            Lanjut Scan Next!
          </button>
        </div>
      )}
    </main>
  );
}