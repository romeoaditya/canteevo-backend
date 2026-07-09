import type { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) {}

    transform(value: unknown, metadata: ArgumentMetadata): unknown {
        if (metadata.type !== 'body' && metadata.type !== 'query' && metadata.type !== 'param') {
            return value;
        }

        try {
            const parsedValue = this.schema.parse(value);
            return parsedValue;
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((err) => ({
                    field: err.path.map(String).join('.'),
                    message: err.message,
                }));

                throw new BadRequestException({
                    message: 'Validation failed',
                    errors: formattedErrors,
                });
            }
            throw new BadRequestException('Validation failed');
        }
    }
}
