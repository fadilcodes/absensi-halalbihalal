'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, Clock, Search, ExternalLink, Mail } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminDashboard() {
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // 1. Ambil data dari Supabase
  const fetchParticipants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setParticipants(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchParticipants()
  }, [])

  // 2. Fungsi Approve (Update is_paid & trigger email)
  const handleApprove = async (id: string, email: string, name: string, category: string) => {
  const confirmApprove = confirm(`Approve pembayaran untuk ${name}?`);
  if (!confirmApprove) return;

  try {
    // 1. Update status di Supabase
    const { error: dbError } = await supabase
      .from('participants')
      .update({ is_paid: true, paid_at: new Date().toISOString() })
      .eq('id', id);

    if (dbError) throw dbError;

    // 2. Panggil API Kirim Email
    const response = await fetch('./api/send-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, userId: id, category }),
    });

    if (!response.ok) throw new Error('Gagal kirim email');

    alert(`Pembayaran ${name} Berhasil di-Approve & Tiket Terkirim!`);
    fetchParticipants(); // Refresh tabel
  } catch (err) {
    console.error(err);
    alert('Duh, ada error pas proses approval.');
  }

};





  const filteredData = participants.filter(p => 
    p.full_name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard Absensi Loop</h1>
            <p className="text-slate-500">Kelola pendaftaran dan verifikasi pembayaran.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari nama/email..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={fetchParticipants} className="bg-white p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
              🔄
            </button>
          </div>
        </div>

        {/* Statistik Singkat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Total Pendaftar</p>
            <p className="text-3xl font-bold text-slate-900">{participants.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Sudah Bayar</p>
            <p className="text-3xl font-bold text-green-600">{participants.filter(p => p.is_paid).length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Belum Bayar</p>
            <p className="text-3xl font-bold text-amber-600">{participants.filter(p => !p.is_paid).length}</p>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">Nama & Kategori</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">Kontak</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">Status Bayar</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400">Loading data...</td></tr>
                ) : filteredData.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{p.full_name}</p>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{p.email}</p>
                      <p className="text-xs text-slate-400">{p.whatsapp_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      {p.is_paid ? (
                        <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                          <CheckCircle size={16} /> Paid
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 text-sm font-bold">
                          <Clock size={16} /> Pending
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!p.is_paid ? (
                        <button 
                          onClick={() => handleApprove(p.id, p.email, p.full_name, p.category)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                        >
                          Approve Paid
                        </button>
                      ) : (
                        <button className="flex items-center gap-1 mx-auto text-xs font-bold text-slate-400 border border-slate-200 px-4 py-2 rounded-lg cursor-not-allowed">
                          <Mail size={14} /> Resend Ticket
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* SECTION DAFTAR HADIR (YANG SUDAH SCAN) */}
<div className="mt-12 mb-6">
  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
    <span className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
    Live Guest Presence (Sudah Hadir)
  </h2>
</div>

<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-20">
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-green-50 border-b border-green-100">
        <tr>
          <th className="px-6 py-4 text-sm font-bold text-green-800">Nama Peserta</th>
          <th className="px-6 py-4 text-sm font-bold text-green-800">Waktu Kedatangan</th>
          <th className="px-6 py-4 text-sm font-bold text-green-800 text-right">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {participants.filter(p => p.is_checked_in).length === 0 ? (
          <tr><td colSpan={3} className="text-center py-10 text-slate-400 italic">Belum ada tamu yang hadir...</td></tr>
        ) : (
          participants
            .filter(p => p.is_checked_in)
            .map((p) => (
              <tr key={p.id} className="hover:bg-green-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{p.full_name}</p>
                  <p className="text-xs text-slate-500 uppercase">{p.category}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(p.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    IN GATE
                  </span>
                </td>
              </tr>
            ))
        )}
      </tbody>
    </table>
  </div>
</div>
    </main>
    
  )
}