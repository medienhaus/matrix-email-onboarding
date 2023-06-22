import { Dependencies } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DefaultFor, Question, QuestionSet } from 'nest-commander';

@QuestionSet({ name: 'send-emails' })
@Dependencies(ConfigService)
export class SendEmailsQuestions {
    constructor(configService) {
        this.configService = configService;
    }

    @Question({
        name: 'baseUrl',
        message:
            'Please provide the base URL to where people will accept invitations from (as in <baseUrl>/?t=BLf5x5qeGKxOlDN7-FYC...)',
    })
    parseBaseUrl(value) {
        return value;
    }
    @DefaultFor({ name: 'baseUrl' })
    defaultBaseUrl() {
        return this.configService.get('base_url');
    }

    @Question({
        name: 'emailFrom',
        message: 'emailFrom',
    })
    parseEmailFrom(value) {
        return value;
    }
    @DefaultFor({ name: 'emailFrom' })
    defaultEmailFrom() {
        return this.configService.get('email.from');
    }

    @Question({
        name: 'emailSubject',
        message: 'emailSubject',
    })
    parseEmailSubject(value) {
        return value;
    }
    @DefaultFor({ name: 'emailSubject' })
    defaultEmailSuject() {
        return this.configService.get('email.subject');
    }

    @Question({
        name: 'smtpHost',
        message: 'Please provide the SMTP host (e.g. localhost)',
        default: 'localhost',
    })
    parseSmtpHost(value) {
        return value;
    }

    @Question({
        type: 'number',
        name: 'smtpPort',
        message: 'Please provide the SMTP port (e.g. 465)',
        default: '1025',
    })
    parseSmtpPort(value) {
        return value;
    }

    @Question({
        name: 'smtpUser',
        message: 'Please provide the SMTP user (username)',
        default: 'username',
    })
    parseSmtpUser(value) {
        return value;
    }

    @Question({
        type: 'password',
        name: 'smtpPassword',
        message: 'Please provide the SMTP password',
        default: 'pw',
    })
    parseSmtpPassword(value) {
        return value;
    }

    @Question({
        message: 'Matrix homeserver',
        name: 'matrixHomeserver',
    })
    parseMatrixHomeserver(value) {
        return value;
    }
    @DefaultFor({
        name: 'matrixHomeserver',
    })
    defaultMatrixHomeserver() {
        return this.configService.get('matrix.homeserver_base_url');
    }

    @Question({
        message: 'Matrix userId',
        name: 'matrixUserId',
    })
    parseMatrixUserId(value) {
        return value;
    }
    @DefaultFor({
        name: 'matrixUserId',
    })
    defaultMatrixUserId() {
        return this.configService.get('matrix.user_id');
    }

    @Question({
        message: 'Matrix accessToken',
        name: 'matrixAccessToken',
    })
    parseMatrixAccessToken(value) {
        return value;
    }
    @DefaultFor({
        name: 'matrixAccessToken',
    })
    defaultMatrixAccessToken() {
        return this.configService.get('matrix.access_token');
    }
}
