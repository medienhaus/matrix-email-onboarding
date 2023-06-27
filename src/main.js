import { NestFactory } from '@nestjs/core';
import { ConsoleLogger } from '@nestjs/common';
import { join } from 'path';
import _ from 'lodash';
import hbs from 'hbs';

import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new ConsoleLogger()
    const app = await NestFactory.create(AppModule);

    const port = process.env.PORT || 3000;
    let globalPrefix = process.env.GLOBAL_PREFIX || '/';

    logger.log(`Booting on port ${port}`)
    if (globalPrefix !== '/') {
        // Ensure we have a leading /, which is important for the `useStaticAssets` method used below
        if (!_.startsWith('/', globalPrefix)) globalPrefix = '/' + globalPrefix;
        logger.log(`Booting with global prefix "${globalPrefix}"`)
    }

    app.setGlobalPrefix(globalPrefix);

    app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: globalPrefix });
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));
    app.setViewEngine('hbs');

    await app.listen(port);
}

bootstrap();
