
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, Lock, FileEdit, LogIn } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/context/language-provider';
import { useAuditLog, type AuditLogActivityType } from '@/context/audit-log-provider';

const iconMap: Record<AuditLogActivityType, React.ReactNode> = {
  auth: <LogIn className="h-4 w-4" />,
  change: <FileEdit className="h-4 w-4" />,
  security: <Lock className="h-4 w-4" />,
};

export default function AuditLogPage() {
  const { t } = useTranslation();
  const { auditLogs } = useAuditLog();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          {t('auditLog.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('auditLog.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('auditLog.card.title')}</CardTitle>
          <CardDescription>
            {t('auditLog.card.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('auditLog.table.activity')}</TableHead>
                <TableHead>{t('auditLog.table.details')}</TableHead>
                <TableHead>{t('auditLog.table.ip')}</TableHead>
                <TableHead>{t('auditLog.table.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-muted rounded-full">
                          {iconMap[log.type] || <Shield className="h-4 w-4" />}
                        </div>
                        <span className="font-medium">{log.activity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.details}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.ip}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No recent activity found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
