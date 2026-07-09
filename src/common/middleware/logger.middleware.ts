import { Injectable, Inject } from '@nestjs/common';
import type { NestMiddleware, LoggerService } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
    ) {}

    use(req: Request, res: Response, next: NextFunction): void {
        const { method, originalUrl } = req;
        const start = Date.now();
        const requestId = req.headers['x-request-id'] as string;

        res.on('finish', () => {
            const { statusCode } = res;
            const ms = Date.now() - start;

            this.logger.log(
                `${method} ${originalUrl} ${statusCode} +${ms}ms [${requestId ?? 'no-id'}]`,
                'HTTP',
            );
        });

        next();
    }
}
