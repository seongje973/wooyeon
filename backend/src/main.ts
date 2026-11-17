import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule);
// 앱의 웹 버전(expo start --web)이 다른 출처에서 부르기 때문에 필요하다.
// CORS_ORIGIN(쉼표로 구분)을 주면 그 출처만 받고, 없으면 모든 출처를 받는다.
const origins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean);
app.enableCors(origins?.length ? { origin: origins } : undefined);
await app.listen(process.env.PORT ?? 3000);
