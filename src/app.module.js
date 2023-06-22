import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from '../config';
import { MatrixService } from '../lib/matrix.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
    ],
    controllers: [AppController],
    providers: [MatrixService, AppService],
})
export class AppModule {}
