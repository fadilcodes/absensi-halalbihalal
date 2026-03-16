import { Resend } from 'resend';
import { NextResponse } from 'next/server';
// Pastikan path import ini sesuai dengan lokasi file pricing.ts lu
import { getPriceDetails } from '../../utils/pricing'; 

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name, userId, category } = await req.json();

    // 1. Ambil detail harga terbaru berdasarkan tanggal eksekusi (Approve)
    const priceInfo = getPriceDetails(category);

    // 2. Link QR Code (Isinya UUID Peserta)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${userId}`;

    const logoUrl = 'https://www.loop-indonesia.com/wp-content/uploads/2021/06/LOGO-LOOP-BARU-2-scaled.png'; // Ganti pake URL logo asli Loop ya, Dil!

    const { data, error } = await resend.emails.send({
      from: 'Loop Institute of Coaching <no-reply@samaloop.com>', 
      to: [email],
      subject: `Tiket Halal Bihalal samaloop 2026 - ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
          
          {/* Logo Section */}
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="Loop Logo" style="width: 120px; height: auto;" />
          </div>

          <h2 style="color: #05b3db; text-align: center; margin-top: 0;">Konfirmasi Pembayaran Berhasil!</h2>
          <p>Dear <b>${name}</b>,</p>
          <p>Salam dari Loop Institute of Coaching</p>
          <p>Selamat Anda telah terdaftar pada "Halal Bihalal & Loop Gathering #samaloop 2026" 
            Sampai berjumpa pada tanggal 25 April 2026
          </p>
          
          <div style="background-color: #f0f7ff; padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #05b3db;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;"><b>Kategori:</b> ${priceInfo.label}</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #1e3a8a;"><b>Nominal:</b> ${priceInfo.price}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #3b82f6;"><i>${priceInfo.note}</i></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <img src="${qrCodeUrl}" alt="QR Code Tiket" style="border: 5px solid #2563eb; padding: 10px; border-radius: 10px; width: 200px;" />
            <p style="font-size: 11px; color: #999; margin-top: 10px; font-family: monospace;">ID: ${userId}</p>
          </div>

          <div>
          Salam hormat,<br/>
          Loop Institute of Coaching
          <br/>

         </div>

          <div style="background-color: #f8fafc; padding: 15px; border-radius: 10px; font-size: 14px; color: #334155;">
            <b>Informasi Penting:</b><br/>
            <ul style="margin-top: 5px; padding-left: 20px;">
              <li>Tunjukkan QR Code ini ke panitia di pintu masuk (Gate).</li>
              <li>Tiket ini berlaku untuk 1 orang sesuai nama terdaftar.</li>
              <li>Simpan tiket ini baik-baik (screenshot disarankan).</li>
            </ul>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">
            Sent with ❤️ by <b>Loop Institute of Coaching</b><br/>
            Jangan membalas email ini secara otomatis.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email tiket sudah terkirim!' }, { status: 200 });
  } catch (err: any) {
    console.error("API Catch Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}