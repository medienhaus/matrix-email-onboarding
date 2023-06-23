import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import hbs from 'hbs';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('/');

    app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/' });
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));
    app.setViewEngine('hbs');

    await app.listen(process.env.PORT || 3000);
}

bootstrap();
