'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string } | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    // Siapkan variabel untuk menampung instance scanner
    let scanner: any = null;

    // Dynamic import untuk menghindari SSR error 'window is not defined'
    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )
      scanner.render(onScanSuccess, onScanFailure)
    }).catch(err => console.error("Gagal load scanner", err))

    let isProcessing = false; 

async function onScanSuccess(decodedText: string) {
  // 1. Kalau lagi proses, jangan mau di-scan lagi
  if (isProcessing) return;
  
  isProcessing = true; // Kunci!
  setIsScanning(true);
  
  try {
    const { data: participant, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', decodedText)
      .single();

    if (error || !participant) {
      setScanResult({ success: false, message: 'Data tidak ditemukan!' });
    } else if (!participant.is_paid) {
      setScanResult({ success: false, message: 'Belum bayar!', name: participant.full_name });
    } else if (participant.is_checked_in) {
      // TAMPILIN INI HANYA JIKA BUKAN DARI PROSES SCAN YANG BARU AJA SUKSES
      setScanResult({ success: false, message: 'Sudah pernah masuk sebelumnya!', name: participant.full_name });
    } else {
      // PROSES CHECK-IN
      const { error: updateError } = await supabase
        .from('participants')
        .update({ 
          is_checked_in: true, 
          checked_in_at: new Date().toISOString() 
        })
        .eq('id', decodedText);

      if (updateError) throw updateError;
      
      // Kasih pesan sukses yang mantap
      setScanResult({ success: true, message: 'Berhasil Check-in! Silakan masuk.', name: participant.full_name });
    }
  } catch (err) {
    setScanResult({ success: false, message: 'Sistem error.' });
  } finally {
    setIsScanning(false);
    
    // 3. Kasih jeda 3 detik sebelum "isProcessing" jadi false lagi
    // Jadi scanner baru bakal aktif lagi setelah 3 detik
    setTimeout(() => {
      isProcessing = false;
    }, 3000); 
  }
}

    function onScanFailure(error: any) {
      // Kita biarin aja biar gak berisik log-nya pas lagi nyari focus kamera
    }

    return () => {
      // Pastikan clear ditangani dengan benar agar tidak return Promise ke useEffect
      if (scanner) {
        scanner.clear().catch((error: any) => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    }
  }, [])

  return (
  <main className="min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden">
    <div className="max-w-md mx-auto">
      <Link href="/admin" className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Kembali
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold italic text-blue-400">SCANNER KEHADIRAN</h1>
        <p className="text-slate-400 text-sm italic">Point camera to QR Code</p>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-500/30">
        <div id="reader"></div>
      </div>
    </div>

    {/* OVERLAY NOTIFIKASI BESAR */}
    {scanResult && (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300 ${
        scanResult.success ? 'bg-green-600' : 'bg-red-600'
      }`}>
        <div className="bg-white p-10 rounded-full mb-6 shadow-2xl animate-bounce">
          {scanResult.success ? (
            <CheckCircle2 className="text-green-600" size={120} />
          ) : (
            <XCircle className="text-red-600" size={120} />
          )}
        </div>
        
        <h2 className="text-5xl font-black text-center text-white mb-4 uppercase tracking-tighter">
          {scanResult.name || 'GAK KENAL'}
        </h2>
        
        <div className="bg-black/20 px-8 py-4 rounded-full backdrop-blur-md">
           <p className="text-2xl font-bold text-white uppercase italic">
            {scanResult.message}
          </p>
        </div>

        <button 
          onClick={() => setScanResult(null)}
          className="mt-12 bg-white text-black font-black px-10 py-4 rounded-xl shadow-xl active:scale-95 transition-all"
        >
          SCAN SELANJUTNYA
        </button>
      </div>
    )}
  </main>
)
}