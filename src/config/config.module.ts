import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configSchema } from './config.schema.js';

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            validate: (config) => {
                const result = configSchema.safeParse(config);
                if (!result.success) {
                    throw new Error(
                        `Configuration validation error: ${JSON.stringify(result.error.format(), null, 2)}`,
                    );
                }
                return result.data;
            },
        }),
    ],
})
export class ConfigModule {}
