export const getPriceDetails = (category: string) => {
  const today = new Date();
  const superEarlyBirdDeadline = new Date('2026-03-17T23:59:59');
  const earlyBirdDeadline = new Date('2026-03-31T23:59:59');

  const isAlumniOrStudent = category === 'alumni' || category === 'student';

  if (isAlumniOrStudent) {
    if (today <= superEarlyBirdDeadline) {
      return {
        label: 'Alumni/Siswa Loop',
        price: 'Rp. 285.000',
        note: 'Super Early Bird (s/d 17 Maret 2026) + 1 Tiket LLC 2026'
      };
    } else if (today <= earlyBirdDeadline) {
      return {
        label: 'Alumni/Siswa Loop',
        price: 'Rp. 325.000',
        note: 'Early Bird (s/d 31 Maret 2026)'
      };
    } else {
      return {
        label: 'Alumni/Siswa Loop',
        price: 'Rp. 425.000',
        note: 'Regular Price'
      };
    }
  } else {
    if (today <= superEarlyBirdDeadline) {
      return {
        label: 'Umum + FREE 1 Tiket LLC',
        price: 'Rp. 360.000',
        note: 'Super Early Bird (s/d 17 Maret 2026) + 1 Tiket LLC 2026'
      };
    } else if (today <= earlyBirdDeadline) {
      return {
        label: 'Umum + FREE 1 Tiket LLC',
        price: 'Rp. 400.000',
        note: 'Early Bird (s/d 31 Maret 2026) + 1 Tiket LLC 2026'
      };
    } else {
      return {
        label: 'Umum + FREE 1 Tiket LLC',
        price: 'Rp. 500.000',
        note: 'Regular Price + 1 Tiket LLC 2026'
      };
    }
  }
};