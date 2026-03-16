'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CreditCard, MessageCircle, AlertCircle } from 'lucide-react'
import { getPriceDetails } from '../utils/pricing'; 

function PaymentContent() {
  const searchParams = useSearchParams()
  
  // Ambil data dari URL
  const name = searchParams.get('full_name') || 'Peserta'
  const category = searchParams.get('category') || 'public'
  const userId = searchParams.get('id') || ''


const priceInfo = getPriceDetails(category)

  const handleWhatsApp = () => {
    const waNumber = "6285770916736" // Ganti sama no WA Admin Loop
    const message = `Halo Admin Loop, saya ${name}. Saya sudah mendaftar untuk event Beyond Success: The Wisdom & Meaning of Life (ID: ${userId}). Saya ingin konfirmasi pembayaran kategori ${priceInfo.label} sebesar ${priceInfo.price}. Berikut bukti transfernya:`
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Sapaan Personal */}
        <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold">Hallo, {name}! 🙌</h1>
          <p className="opacity-90 mt-2">Satu langkah lagi buat dapetin tiket. Silakan selesaikan pembayaran sesuai detail di bawah ya.</p>
        </div>

        {/* Ringkasan Biaya */}
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Detail Tiket</h2>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lg font-bold text-slate-900">{priceInfo.label}</p>
              <p className="text-sm text-blue-600 font-medium mt-1">{priceInfo.note}</p>
            </div>
            <p className="text-2xl font-black text-slate-900">{priceInfo.price}</p>
          </div>
        </div>

        {/* Instruksi Rekening */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="text-blue-600" size={20} />
            <h2 className="font-bold text-slate-900">Rekening Pembayaran</h2>
          </div>
          
          <div className="grid gap-3">
            {[
              { bank: 'BCA', acc: '740-1199-300', owner: 'PT. Linkar Indonesia Cendekia' },
              { bank: 'MANDIRI', acc: '124-000-560-8733', owner: 'PT. Linkar Indonesia Cendekia' }
            ].map((item) => (
              <div key={item.bank} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase">{item.bank}</p>
                  <p className="text-lg font-mono font-bold text-slate-800 tracking-wider">{item.acc}</p>
                  <p className="text-xs text-slate-500">a.n {item.owner}</p>
                </div>
                <button 
                  onClick={() => {navigator.clipboard.writeText(item.acc); alert('Rekening disalin!')}}
                  className="text-gray-700 text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                >
                  Salin
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Alert & WhatsApp Button */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
          <p className="text-sm text-amber-800">
            Pastikan transfer sesuai nominal. Setelah transfer <b>wajib</b> kirim bukti bayar ke WhatsApp Admin Loop di bawah ini agar tiket langsung di proses.
          </p>
        </div>

        <button 
          onClick={handleWhatsApp}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
        >
          <MessageCircle size={24} />
          Kirim Bukti Bayar ke WhatsApp
        </button>

        <p className="text-center text-slate-400 text-sm">
          ID Pendaftaran: <span className="font-mono">{userId}</span>
        </p>

      </div>
    </main>
  )
}

// Next.js App Router butuh Suspense kalau pake useSearchParams di 'use client'
export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  )
}