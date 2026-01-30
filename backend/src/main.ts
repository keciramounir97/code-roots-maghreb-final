import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import * as process from 'process';

/** Production CORS origins: server.rootsmaghreb.com, rootsmaghreb.com; dev: localhost:5173 */
const DEFAULT_CORS_ORIGINS = [
    'https://rootsmaghreb.com',
    'https://www.rootsmaghreb.com',
    'https://server.rootsmaghreb.com',
];
const DEV_CORS_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

function getCorsOrigins(): string[] | true {
    const raw = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '';
    const list = raw
        .split(',')
        .map((o) => o.trim().replace(/\/+$/, ''))
        .filter(Boolean);
    if (process.env.NODE_ENV === 'production') {
        const origins = list.length ? list : DEFAULT_CORS_ORIGINS;
        return [...new Set([...origins])];
    }
    return list.length ? [...new Set([...list, ...DEV_CORS_ORIGINS])] : true;
}

async function bootstrap() {
    console.log('🟢 SERVER STARTING...');

    try {
        const app = await NestFactory.create(AppModule);

        // Security: Helmet + explicit headers (Pragma, X-Frame-Options, etc.)
        const helmetOptions: Parameters<typeof helmet.default>[0] = {
            contentSecurityPolicy: false, // API returns JSON; CSP usually for HTML
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: { policy: 'cross-origin' },
        };
        app.use(helmet.default(helmetOptions));
        app.use((_req, res, next) => {
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Expires', '0');
            next();
        });

        // CORS: authorised origins only (rootsmaghreb.com, server.rootsmaghreb.com, localhost:5173)
        const corsOrigins = getCorsOrigins();
        app.enableCors({
            origin:
                corsOrigins === true
                    ? true
                    : (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
                          if (!origin) return cb(null, true); // same-origin or tools
                          const allowed = corsOrigins as string[];
                          const ok = allowed.some((o) => origin === o || origin === o.replace(/\/$/, ''));
                          cb(null, ok);
                      },
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin, Pragma, Cache-Control, Expires',
            credentials: true,
        });

        // Validation
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }));

        // Global Interceptors & Filters
        const { TransformInterceptor } = await import('./common/interceptors/transform.interceptor');
        const { AllExceptionsFilter } = await import('./common/filters/all-exceptions.filter');
        app.useGlobalInterceptors(new TransformInterceptor());
        app.useGlobalFilters(new AllExceptionsFilter());

        // Passenger / cPanel Port
        const port = process.env.PORT || 5000;
        await app.listen(port);

        console.log('🟢 SERVER READY');
        console.log(`🟢 DB CONNECTED - Application running on: ${await app.getUrl()}`);

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('🟡 SIGTERM received, shutting down gracefully');
            await app.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('🔴 SERVER ERROR:', error);
        if (error.message.includes('database') || error.message.includes('ECONNREFUSED')) {
            console.error('🔴 DB ERROR - Database connection failed');
        }
        process.exit(1);
    }
}
bootstrap();
