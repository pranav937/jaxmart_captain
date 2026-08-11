import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    const startTime = Date.now();

    return next.handle().pipe(
      tap((responseBody) => {
        // Record Audit Entry for any mutating HTTP actions (POST, PUT, PATCH, DELETE)
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          const auditRecord = {
            userId: user?.id || 'SYSTEM',
            userName: user?.name || 'Anonymous',
            userRole: user?.role || 'SYSTEM',
            action: method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE',
            endpoint: url,
            ipAddress: ip,
            deviceInfo: userAgent,
            executionTimeMs: Date.now() - startTime,
            payloadBefore: req.body?.previousState || null,
            payloadAfter: req.body || null,
            timestamp: new Date().toISOString(),
          };

          this.logger.log(`[AUDIT RECORDED] ${auditRecord.userName} (${auditRecord.userRole}) -> ${auditRecord.action} on ${url}`);
          // Write to PostgreSQL ActivityLog table via Prisma Service
        }
      }),
    );
  }
}
