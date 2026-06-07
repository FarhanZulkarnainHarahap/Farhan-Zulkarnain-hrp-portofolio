import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the admin login entry route.
  redirect('/auth/login');
  
  return null;
}
