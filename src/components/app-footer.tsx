
'use client';

import { Logo } from './logo';
import { useTranslation } from '@/context/language-provider';

export function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="bg-secondary border-t relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-24 bg-background/30 [mask-image:url('data:image/svg+xml,%3csvg%20xmlns%3d%22http%3a//www.w3.org/2000/svg%22%20viewBox%3d%220%200%201440%20120%22%3e%3cpath%20d%3d%22M1440%2c32L1320%2c64L1200%2c42.7L1080%2c42.7L960%2c21.3L840%2c53.3L720%2c32L600%2c64L480%2c74.7L360%2c64L240%2c32L120%2c42.7L0%2c21.3L0%2c120L120%2c120L240%2c120L360%2c120L480%2c120L600%2c120L720%2c120L840%2c120L960%2c120L1080%2c120L1200%2c120L1320%2c120L1440%2c120Z%22%20fill%3d%22%23fff%22%2f%3e%3c/svg%3e')] mask-repeat: no-repeat mask-size: cover"></div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-8 md:mb-0">
            <Logo />
            <p className="text-sm text-muted-foreground mt-4">
                {t('footer.tagline')}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {t('footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
}
