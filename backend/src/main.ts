import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule);
// 앱의 웹 버전(expo start --web)이 다른 출처에서 부르기 때문에 필요하다.
app.enableCors();
await app.listen(process.env.PORT ?? 3000);
