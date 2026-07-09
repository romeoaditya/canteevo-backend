import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private pool: Pool;

    constructor(private configService: ConfigService) {
        const databaseUrl = process.env.DATABASE_URL || '';
        const pool = new Pool({ connectionString: databaseUrl });
        const adapter = new PrismaPg(pool);

        super({
            adapter,
            log: ['error', 'warn'],
        });

        this.pool = pool;
    }

    async onModuleInit(): Promise<void> {
        try {
            await this.$connect();
            this.logger.log('Successfully connected to database');
        } catch (error) {
            this.logger.error('Failed to connect to database', error);
            throw error;
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
        await this.pool.end();
        this.logger.log('Disconnected from database');
    }

    /** Soft delete helper */
    async softDelete<T>(
        model: keyof PrismaClient,
        where: Record<string, unknown>,
    ): Promise<T> {
        const prismaModel = this[model] as any;
        return prismaModel.update({
            where,
            data: { deletedAt: new Date() },
        });
    }

    /** Find many excluding soft deleted records */
    async findManyActive<T>(
        model: keyof PrismaClient,
        args?: Record<string, unknown>,
    ): Promise<T[]> {
        const prismaModel = this[model] as any;
        return prismaModel.findMany({
            ...args,
            where: {
                ...(args?.where || {}),
                deletedAt: null,
            },
        });
    }
}
