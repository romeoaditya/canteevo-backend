import type { ExceptionFilter, ArgumentsHost, LoggerService } from '@nestjs/common';
import { Catch, HttpException, Inject } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Prisma } from '@prisma/client';
import type { ErrorResponse } from '../interfaces/response.interface.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
    ) {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();

        let statusCode = 500;
        let message = 'Internal server error';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const response = exception.getResponse();

            if (typeof response === 'string') {
                message = response;
            } else if (typeof response === 'object' && response !== null) {
                const res = response as Record<string, unknown>;
                message = (res.message as string) || message;
                error = (res.error as string) || error;
            }
        } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002':
                    statusCode = 409;
                    message = 'A record with this value already exists';
                    error = 'Conflict';
                    break;
                case 'P2025':
                    statusCode = 404;
                    message = 'Record not found';
                    error = 'Not Found';
                    break;
                case 'P2003':
                    statusCode = 400;
                    message = 'Foreign key constraint failed';
                    error = 'Bad Request';
                    break;
                default:
                    statusCode = 500;
                    message = 'Database error occurred';
                    error = 'Internal Server Error';
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        const responseBody: ErrorResponse = {
            message,
            error,
            statusCode,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(request) as string,
            method: httpAdapter.getRequestMethod(request) as string,
            requestId: (request.headers as Record<string, string>)['x-request-id'],
        };

        if (statusCode >= 500) {
            this.logger.error(
                `${responseBody.method} ${responseBody.path} → ${statusCode}`,
                exception instanceof Error ? exception.stack : String(exception),
                'GlobalExceptionFilter',
            );
        } else {
            this.logger.warn(
                `${responseBody.method} ${responseBody.path} → ${statusCode}: ${message}`,
                'GlobalExceptionFilter',
            );
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
    }
}
