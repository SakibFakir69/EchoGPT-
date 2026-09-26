
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('ECHO GPT example')
    .setDescription('The EHCOGPT API description')
    .setVersion('1.0')
    .addTag('echo')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);4


  app.setGlobalPrefix("/api")

  app.useGlobalInterceptors(new ResponseInterceptor())
  


  

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
