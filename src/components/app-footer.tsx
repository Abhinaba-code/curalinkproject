import { Logo } from './logo';

export function AppFooter() {
  return (
    <footer className="bg-slate-900 text-slate-100">
      <div className="container mx-auto flex justify-between items-center px-4 py-8">
        <div>
          <Logo className="text-white" />
          <p className="text-sm text-slate-300 mt-2">
            &copy; {new Date().getFullYear()} CuraLink. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
