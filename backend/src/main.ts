import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import * as process from 'process';
import * as path from 'path';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'crypto';

/** Production CORS origins: server.rootsmaghreb.com, rootsmaghreb.com; dev: localhost:5173 */
const DEFAULT_CORS_ORIGINS = [
    'https://rootsmaghreb.com',
    'https://www.rootsmaghreb.com',
    'http://rootsmaghreb.com',
    'http://www.rootsmaghreb.com',
    'https://server.rootsmaghreb.com',
    'http://server.rootsmaghreb.com',
];
const DEV_CORS_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

function getCorsOrigins(): string[] | true {
    // Dev: allow all origins to prevent CORS blocking
    if (process.env.NODE_ENV !== 'production') return true;
    const raw = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '';
    const list = raw
        .split(',')
        .map((o) => o.trim().replace(/\/+$/, ''))
        .filter(Boolean);
    const origins = list.length ? list : DEFAULT_CORS_ORIGINS;
    return [...new Set([...origins])];
}

async function bootstrap() {
    console.log('🟢 SERVER STARTING...');

    try {
        const app = await NestFactory.create<NestExpressApplication>(AppModule);

        // Static file serving for uploads (images, books, GEDCOM) - cPanel/production safe
        const uploadsPath = path.join(process.cwd(), 'uploads');
        app.use('/uploads', require('express').static(uploadsPath));

        // Compression (production-ready)
        app.use(compression());

        // API Prefix (use 'api' for cPanel/proxy compatibility; /api/auth/login, etc.)
        app.setGlobalPrefix('api');

        // Request ID for tracing
        app.use((req: any, _res, next) => {
            req.id = req.headers['x-request-id'] || randomUUID();
            next();
        });

        // Rate limiting
        const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
        const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
        const authRateLimitMax = parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10', 10);

        app.use(rateLimit({
            windowMs: rateLimitWindow,
            max: rateLimitMax,
            message: { statusCode: 429, message: 'Too many requests. Please try again later.' },
            standardHeaders: true,
            legacyHeaders: false,
            skip: (req) => {
                const p = req.path || '';
                return p.includes('/health') || p.includes('/auth/');
            },
        }));

        // Stricter rate limit for auth routes (applied before global for /auth/*)
        const authLimiter = rateLimit({
            windowMs: rateLimitWindow,
            max: authRateLimitMax,
            message: { statusCode: 429, message: 'Too many attempts. Try again later.' },
            standardHeaders: true,
            legacyHeaders: false,
        });
        app.use('/api/auth/login', authLimiter);
        app.use('/api/auth/signup', authLimiter);

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

        // CORS: dev = allow all; prod = allowed origins
        const corsOrigins = getCorsOrigins();
        app.enableCors({
            origin:
                corsOrigins === true
                    ? true
                    : (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
                        if (!origin) return cb(null, true);
                        const allowed = corsOrigins as string[];
                        const ok = allowed.some((o) => origin === o || origin === o.replace(/\/$/, ''));
                        cb(null, ok);
                    },
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin, Pragma, Cache-Control, Expires',
            credentials: true,
            preflightContinue: false,
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
        await app.listen(port, '0.0.0.0');

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
