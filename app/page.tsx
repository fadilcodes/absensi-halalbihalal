'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import halbil from '../public/halbil.webp'; // Static import

// 1. Inisialisasi Supabase Client (bisa dipindah ke file terpisah nanti)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 2. State untuk menampung data form
  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'Laki-laki', // Default
    age: '',
    email: '',
    whatsapp_number: '',
    city: '',
    category: 'alumni', // Default
  })

  // 3. Fungsi untuk menangani perubahan input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 4. Fungsi untuk submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Masukin data ke Supabase
      const { data, error: supabaseError } = await supabase
        .from('participants')
        .insert([{
          ...formData,
          age: formData.age ? parseInt(formData.age) : null, // Ubah ke number
        }])
        .select() // Biar dapet data yang baru dimasukin (buat ambil UUID)

      if (supabaseError) {
        // Cek kalau email udah kedaftar (error code 23505)
        if (supabaseError.code === '23505') {
          throw new Error('Email ini sudah terdaftar! Silahkan pakai email lain')
        }
        throw supabaseError
      }

      // Kalau sukses, ambil data user pertama (karena insert cuma 1)
      const newUser = data?.[0]

      // Arahkan ke halaman pembayaran sambil bawa data yang dibutuhin (opsional, via query param)
      router.push(`/payment?full_name=${encodeURIComponent(newUser.full_name)}&category=${newUser.category}&id=${newUser.id}`)

    } catch (err: any) {
      setError(err.message || 'Ada masalah ketika daftar. Coba lagi nanti')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Image
          src={halbil}
          alt="Picture of the author"
          />
          <h1 className="pt-5 pb-2 text-3xl font-extrabold text-slate-900 tracking-tight">REGISTRASI</h1>
          <p className=' text-gray-700 text-xl'>Beyond Success: The Wisdom & Meaning of Life</p>
          {/* <h2 className="pt-5 text-3xl font-extrabold text-slate-900 tracking-tight">Registrasi</h2> */}
          {/* <p className="text-slate-600 mt-2 text-lg">Daftar sekarang buat dapet tiket QR-nya!</p> */}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Form Pendaftaran */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Baris 1: Nama & Gender */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
              <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="Contoh: Fadil Muhammad" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-150" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis Kelamin</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-150 bg-white text-gray-700">
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          {/* Baris 2: Usia & Email */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="age" className="block text-sm font-semibold text-slate-700 mb-1.5 ">Usia (Opsional)</label>
              <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} placeholder="Contoh: 25" className="w-full text-gray-700 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-150" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email Aktif</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Contoh: fadil@loop.com" className="w-full px-4 py-3 border text-gray-700 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-150" />
            </div>
          </div>

          {/* Baris 3: No WhatsApp & Kota */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="whatsapp_number" className="block text-sm font-semibold text-slate-700 mb-1.5">Nomor WhatsApp</label>
              <input type="tel" id="whatsapp_number" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} required placeholder="Contoh: 08123456789" className="w-full px-4 py-3 border border-slate-200 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-150" />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-1.5">Kota Domisili (Opsional)</label>
              <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Contoh: Jakarta" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-150" />
            </div>
          </div>

          {/* Baris 4: Kategori */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori Peserta</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange} required className="w-full px-4 py-3 border text-gray-700 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-150 bg-white">
              <option value="alumni">Alumni/Student Loop</option>
              <option value="public">Public</option>
            </select>
            {/* <p className="text-xs text-slate-500 mt-1.5">⚠️ Harga tiket bakal beda-beda tergantung kategori yang lu pilih.</p> */}
          </div>

          {/* Tombol Submit */}
          <div className="pt-6">
            <button type="submit" disabled={loading} className="w-full md:w-auto md:px-10 px-6 py-3.5 bg-[#05b3db] text-white font-bold rounded-xl shadow-md hover:bg-[#04a3c6] focus:ring-4 focus:ring-blue-200 transition-all duration-150 disabled:bg-slate-300 disabled:cursor-not-allowed">
              {loading ? 'Proses Pendaftaran...' : 'Daftar Sekarang & Bayar'}
            </button>
          </div>

        </form>

    

      </div>
    </main>
  )
}