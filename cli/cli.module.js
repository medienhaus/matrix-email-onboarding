import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from '../config';
import { MatrixService } from '../lib/matrix.service';
import { SendEmailsCommand } from './send-emails.command';
import { SendEmailsQuestions } from './send-emails.questions';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
    ],
    providers: [MatrixService, SendEmailsCommand, SendEmailsQuestions],
})
export class CliModule {}
