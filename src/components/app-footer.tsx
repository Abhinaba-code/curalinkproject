import Link from 'next/link';
import { Logo } from './logo';

export function AppFooter() {
  return (
    <footer className="bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo className="text-white" />
            <p className="text-sm text-slate-300 mt-2">
              &copy; {new Date().getFullYear()} CuraLink. All rights reserved.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 mt-4 text-sm">
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 mt-4 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-slate-300 hover:text-white"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-300 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-slate-300 hover:text-white">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 mt-4 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-300 hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-300 hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
