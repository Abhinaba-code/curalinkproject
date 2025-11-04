import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';

export function PublicHeader() {
  return (
    <div className="container mx-auto flex h-20 items-center justify-between px-4">
      <Logo />
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary">
          About
        </Link>
        <Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-primary">
          FAQ
        </Link>
        <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary">
          Contact
        </Link>
      </nav>
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
