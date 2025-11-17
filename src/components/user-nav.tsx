

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-provider';
import Link from 'next/link';
import {
  User,
  Settings,
  LogOut,
  Edit,
  Users,
  Info,
  HelpCircle,
  Mail,
  History,
  Bell,
  Star,
} from 'lucide-react';
import { useTranslation } from '@/context/language-provider';

export function UserNav() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return null;
  }

  const userInitials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : 'U';
    
  const editProfileLink = user.role === 'patient' ? '/dashboard/create-profile' : '/dashboard/create-researcher-profile';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl} alt={`@${user.name || 'user'}`} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
           {user.isPremium && (
            <Star className="absolute bottom-0 right-0 h-4 w-4 fill-yellow-400 text-yellow-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none flex items-center gap-1">
              {user.name || 'User'}
              {user.isPremium && <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <User className="mr-2 h-4 w-4" />
              <span>{t('userNav.profile')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={editProfileLink}>
              <Edit className="mr-2 h-4 w-4" />
              <span>{t('userNav.editProfile')}</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/dashboard/notifications">
              <Bell className="mr-2 h-4 w-4" />
              <span>{t('dashboard.nav.notifications')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('userNav.settings')}</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <Users className="mr-2 h-4 w-4" />
              <span>{t('userNav.connections')}</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/dashboard/history">
              <History className="mr-2 h-4 w-4" />
              <span>{t('userNav.history')}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
         <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/about">
              <Info className="mr-2 h-4 w-4" />
              <span>{t('userNav.about')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/help">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>{t('userNav.help')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/contact">
              <Mail className="mr-2 h-4 w-4" />
              <span>{t('userNav.contact')}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('userNav.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
