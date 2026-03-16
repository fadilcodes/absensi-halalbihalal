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
          
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="Loop Logo" style="width: 120px; height: auto;" />
          </div>

          <h2 style="color: #05b3db; text-align: center; margin-top: 0;">Konfirmasi Pembayaran Berhasil!</h2>
          <p>Dear <b>${name}</b>,</p>
          <p>Salam dari Loop Institute of Coaching</p>
          <p>Selamat Anda telah terdaftar pada <b>"Halal Bihalal & Loop Gathering #samaloop 2026"</b>.</p>
          
          <div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; margin: 15px 0; border: 1px dashed #cbd5e1; text-align: center;">
             <p style="margin: 0; color: #334155; font-size: 15px;">
               🗓️ <b>Sabtu, 25 April 2026</b><br/>
               ⏰ <b>13.30 - 17.00 WIB</b>
             </p>
          </div>
          
          <div style="background-color: #f0f7ff; padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #05b3db;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;"><b>Kategori:</b> ${priceInfo.label}</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #1e3a8a;"><b>Nominal:</b> ${priceInfo.price}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #3b82f6;"><i>${priceInfo.note}</i></p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="https://maps.app.goo.gl/aemSb8KeY6CMLcmn8" 
               style="display: inline-block; width: 80%; background-color: #334155; color: white; padding: 14px 0; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; margin-bottom: 12px;">
               📍 LIHAT LOKASI (ASTON HOTEL)
            </a>
            <br/>
            <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=Halal+Bihalal+%26+Loop+Gathering+2026&dates=20260425T063000Z/20260425T100000Z&details=Jangan+lupa+bawa+QR+Code+Tiket+kamu+untuk+Gate+Scanner!&location=ASTON+Hotel" 
               style="display: inline-block; width: 80%; background-color: #05b3db; color: white; padding: 14px 0; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px;">
               📅 SAVE THE DATE! (13.30 - 17.00 WIB)
            </a>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 13px; color: #64748b; margin-bottom: 10px;">Tunjukkan QR Code ini di Gate:</p>
            <img src="${qrCodeUrl}" alt="QR Code Tiket" style="border: 5px solid #2563eb; padding: 10px; border-radius: 10px; width: 180px;" />
            <p style="font-size: 11px; color: #999; margin-top: 10px; font-family: monospace;">ID: ${userId}</p>
          </div>

          <div style="margin-bottom: 20px; font-size: 14px;">
            Salam hormat,<br/>
            <b>Loop Institute of Coaching</b>
          </div>

          <div style="background-color: #fff7ed; padding: 15px; border-radius: 10px; font-size: 13px; color: #9a3412; border: 1px solid #ffedd5;">
            <b>Penting:</b><br/>
            <ul style="margin-top: 5px; padding-left: 20px;">
              <li>Datang 15 menit lebih awal untuk proses Check-in.</li>
              <li>Simpan tiket ini (screenshot) untuk cadangan sinyal buruk.</li>
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