"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const helmet = require("helmet");
const process = require("process");
const path = require("path");
const compression = require("compression");
const express_rate_limit_1 = require("express-rate-limit");
const crypto_1 = require("crypto");
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
function getCorsOrigins() {
    if (process.env.NODE_ENV !== 'production')
        return true;
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
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        const uploadsPath = path.join(process.cwd(), 'uploads');
        app.use('/uploads', require('express').static(uploadsPath));
        app.use(compression());
        app.setGlobalPrefix('api');
        app.use((req, _res, next) => {
            req.id = req.headers['x-request-id'] || (0, crypto_1.randomUUID)();
            next();
        });
        const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
        const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
        const authRateLimitMax = parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10', 10);
        app.use((0, express_rate_limit_1.default)({
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
        const authLimiter = (0, express_rate_limit_1.default)({
            windowMs: rateLimitWindow,
            max: authRateLimitMax,
            message: { statusCode: 429, message: 'Too many attempts. Try again later.' },
            standardHeaders: true,
            legacyHeaders: false,
        });
        app.use('/api/auth/login', authLimiter);
        app.use('/api/auth/signup', authLimiter);
        const helmetOptions = {
            contentSecurityPolicy: false,
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
        const corsOrigins = getCorsOrigins();
        app.enableCors({
            origin: corsOrigins === true
                ? true
                : (origin, cb) => {
                    if (!origin)
                        return cb(null, true);
                    const allowed = corsOrigins;
                    const ok = allowed.some((o) => origin === o || origin === o.replace(/\/$/, ''));
                    cb(null, ok);
                },
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin, Pragma, Cache-Control, Expires',
            credentials: true,
            preflightContinue: false,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }));
        const { TransformInterceptor } = await Promise.resolve().then(() => require('./common/interceptors/transform.interceptor'));
        const { AllExceptionsFilter } = await Promise.resolve().then(() => require('./common/filters/all-exceptions.filter'));
        app.useGlobalInterceptors(new TransformInterceptor());
        app.useGlobalFilters(new AllExceptionsFilter());
        const port = process.env.PORT || 5000;
        await app.listen(port, '0.0.0.0');
        console.log('🟢 SERVER READY');
        console.log(`🟢 DB CONNECTED - Application running on: ${await app.getUrl()}`);
        process.on('SIGTERM', async () => {
            console.log('🟡 SIGTERM received, shutting down gracefully');
            await app.close();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('🔴 SERVER ERROR:', error);
        if (error.message.includes('database') || error.message.includes('ECONNREFUSED')) {
            console.error('🔴 DB ERROR - Database connection failed');
        }
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map