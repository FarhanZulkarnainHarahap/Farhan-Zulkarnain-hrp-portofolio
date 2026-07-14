import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the user dashboard entry route.
  redirect('/home');
  
  return null;
}
