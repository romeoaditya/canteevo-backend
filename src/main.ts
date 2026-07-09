import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    // Use Winston as the application logger
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

    // Global prefix
    app.setGlobalPrefix('api');

    // CORS
    app.enableCors({
        origin: process.env.NODE_ENV === 'production' ? false : '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    });

    // Swagger / OpenAPI setup
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Canteevo API')
        .setDescription('Canteevo backend API documentation')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token',
                in: 'header',
                name: 'Authorization',
            },
            'bearer',
        )
        .addTag('Auth', 'Authentication endpoints')
        // Add new feature tags here
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Application running on: http://localhost:${port}/api`);
    console.log(`📚 Swagger docs at: http://localhost:${port}/api/docs`);
}

bootstrap();
