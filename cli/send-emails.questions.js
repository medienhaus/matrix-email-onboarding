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
        message: 'What email address should the emails be sent from?',
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
        message: 'What should the subject of the email be?',
    })
    parseEmailSubject(value) {
        return value;
    }
    @DefaultFor({ name: 'emailSubject' })
    defaultEmailSubject() {
        return this.configService.get('email.subject');
    }

    @Question({
        message: 'Please provide your Matrix homeserver URL',
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
        message: 'Please provide the user ID for who is going to invite your users & modify their power levels',
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
        message: 'Please provide a valid access token for the previously given Matrix user',
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

    @Question({
        name: 'sleepBetweenMatrixEvents',
        message: 'How many ms should pass between each Matrix call sending a dev.medienhaus.onboarding event?',
        default: 100,
        type: 'number',
    })
    parseSleepBetweenMatrixEvents(value) {
        return value;
    }

    @Question({
        name: 'sleepBetweenEmailSends',
        message: 'And how many ms should pass after each email that was sent out?',
        default: 500,
        type: 'number',
    })
    parseSleepBetweenEmailSends(value) {
        return value;
    }
}
