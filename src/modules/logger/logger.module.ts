import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import type { Config } from '../../config/config.schema.js';

@Module({
    imports: [
        WinstonModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Config, true>) => ({
                transports: [
                    new winston.transports.Console({
                        format: winston.format.combine(
                            winston.format.timestamp(),
                            winston.format.ms(),
                            winston.format.colorize({ all: true }),
                            winston.format.printf(({ timestamp, level, message, context, ms, ...meta }) => {
                                let log = `${timestamp} [${context || 'Application'}] ${level}: ${message}`;
                                if (ms) log += ` ${ms}`;
                                if (Object.keys(meta).length > 0) log += ` ${JSON.stringify(meta)}`;
                                return log;
                            }),
                        ),
                    }),
                    new winston.transports.File({
                        filename: 'logs/error.log',
                        level: 'error',
                        format: winston.format.combine(
                            winston.format.timestamp(),
                            winston.format.json(),
                        ),
                    }),
                    new winston.transports.File({
                        filename: 'logs/combined.log',
                        format: winston.format.combine(
                            winston.format.timestamp(),
                            winston.format.json(),
                        ),
                    }),
                ],
                level: configService.get('LOG_LEVEL', { infer: true }),
            }),
        }),
    ],
    exports: [WinstonModule],
})
export class LoggerModule {}
