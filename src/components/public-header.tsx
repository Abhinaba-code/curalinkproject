import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';

export function PublicHeader() {
  return (
    <div className="container mx-auto flex h-20 items-center justify-between px-4">
      <Logo />
      <nav className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/auth/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">Get Started</Link>
        </Button>
      </nav>
    </div>
  );
}
