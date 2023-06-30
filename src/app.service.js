import { ConsoleLogger, Dependencies, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as matrixcs from 'matrix-js-sdk';
import { decrypt, PrivateKey } from 'eciesjs';
import _ from 'lodash';

import { MatrixService } from '../lib/matrix.service';

@Injectable()
@Dependencies(ConfigService, MatrixService)
export class AppService {
    constructor(configService, matrixAppService) {
        this.configService = configService;
        this.matrixService = matrixAppService;

        this.logger = new ConsoleLogger(AppService.name);
    }

    async onModuleInit() {
        await this.matrixService.startClient(
            this.configService.get('matrix.homeserver_base_url'),
            this.configService.get('matrix.user_id'),
            this.configService.get('matrix.access_token'),
        );
    }

    findInvitations(token) {
        const privateKey = PrivateKey.fromHex(token);
        return _.filter(
            this.matrixService.getOnboardingEvents(),
            /**
             * @param {MatrixEvent} event
             * @return {boolean}
             **/
            (event) => {
                try {
                    const secret = decrypt(
                        privateKey.toHex(),
                        Buffer.from(_.get(event.getContent(), 'signature'), 'base64url'),
                    );

                    return secret.toString() === event.getRoomId();
                } catch (error) {
                    return false;
                }
            },
        );
    }

    /**
     * Gets an array of room names for a given set of Matrix events.
     *
     * @param {MatrixEvent[]} events
     * @return {string[]}
     */
    getRoomNames(events) {
        return _.map(events, (event) => {
            return _.get(this.matrixService.getRoom(event.getRoomId()), 'name');
        });
    }

    async acceptInvitationsForUser(username, password, invitations) {
        const userMatrixClient = matrixcs.createClient({
            baseUrl: this.configService.get('matrix.homeserver_base_url'),
            useAuthorizationHeader: true,
        });

        const userMatrixLogin = await userMatrixClient.login('m.login.password', {
            type: 'm.login.password',
            user: username,
            password: password,
        });

        this.logger.debug(`Successfully authenticated as ${username}`);

        // Bot invites user
        for (const onboardingEvent of invitations) {
            try {
                await this.matrixService.inviteUser(userMatrixLogin.user_id, onboardingEvent.getRoomId());
            } catch (/** MatrixError */ error) {
                // Ignore errors if the user is part of the room already
                if (!_.includes(_.get(error, 'data.error'), 'is already in the room')) {
                    throw error;
                }
            }
        }

        // User accepts invitation
        for (const onboardingEvent of invitations) {
            try {
                await userMatrixClient.joinRoom(onboardingEvent.getRoomId());
            } catch (/** MatrixError */ error) {
                // Ignore errors if the user is part of the room already
                if (!_.includes(_.get(error, 'data.error'), 'is already in the room')) {
                    throw error;
                }
            }
        }

        // If configured, have the bot alter the power level of the user
        if (this.configService.get('matrix.powerlevel')) {
            for (const onboardingEvent of invitations) {
                await this.matrixService.setUserPowerLevel(
                    userMatrixLogin.user_id,
                    onboardingEvent.getRoomId(),
                    this.configService.get('matrix.powerlevel'),
                );
            }
        }

        this.logger.log(`Accepted ${_.size(invitations)} invitation(s) for ${username}`);
    }
}
