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

  useEffect(() => {
    const startScanner = async () => {
      try {
        // 1. Pastikan div #reader sudah ada di DOM
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0 
        };

        // 2. Minta akses kamera secara manual (biar browser bangun)
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          (errorMessage) => {
            // Biarkan kosong aja, biar console lu gak penuh sama pesan "QR code not found" pas kamera lagi nyari fokus
          }
        );
      } catch (err: any) {
        console.error("Gagal start kamera:", err);
        setErrorMsg(`Kamera gagal: ${err.message || "Pastikan izin kamera di-Allow"}`);
      }
    };

    // Kasih delay dikit biar React kelar ngerender layout-nya
    const timeoutId = setTimeout(startScanner, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  async function onScanSuccess(decodedText: string) {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const { data: participant, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', decodedText)
        .single();

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

        {/* AREA SCANNER */}
        <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-500/30 aspect-square flex items-center justify-center">
          {errorMsg ? (
            <div className="p-6 text-center">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <p className="text-sm text-red-400 font-medium">{errorMsg}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-blue-600 px-4 py-2 rounded-lg text-xs"
              >
                Coba Segarkan Halaman
              </button>
            </div>
          ) : (
            <div id="reader" className="w-full h-full"></div>
          )}
          
          {/* Garis pemandu biar keren */}
          {!errorMsg && !scanResult && (
            <div className="absolute inset-0 border-[60px] border-black/20 pointer-events-none">
               <div className="w-full h-full border-2 border-blue-500/40 rounded-lg animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY NOTIFIKASI */}
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
          <h2 className="text-4xl font-black text-center mb-2 uppercase">{scanResult.name || 'Gagal'}</h2>
          <p className="text-xl font-bold bg-black/20 px-6 py-2 rounded-full uppercase italic">{scanResult.message}</p>
          <button 
            onClick={() => { setScanResult(null); setIsProcessing(false); }}
            className="mt-12 bg-white text-black font-black px-12 py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase"
          >
            Lanjut Scan Next!
          </button>
        </div>
      )}
    </main>
  );
}