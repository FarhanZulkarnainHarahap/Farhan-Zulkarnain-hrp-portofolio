import { redirect } from 'next/navigation';

export default function RootPage() {
  // Arahkan ke /dashboard/home, Next.js akan otomatis mengambil isi folder /user
  redirect('/auth/login');
  
  return null;
}
