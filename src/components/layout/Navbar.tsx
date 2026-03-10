import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { NavbarClient } from './NavbarClient';

export async function Navbar() {
  const user = await getCurrentUser();
  const navUser = user ? { name: user.name, email: user.email } : null;
  return <NavbarClient user={navUser} />;
}
