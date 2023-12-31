import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as matrixcs from 'matrix-js-sdk';
import _ from 'lodash';
import { Filter, MatrixEvent } from 'matrix-js-sdk';

@Injectable()
export class MatrixService {
    constructor() {
        this.logger = new ConsoleLogger(MatrixService.name);

        this.matrixClient = null;
        this.onboardingEvents = {};
    }

    async startClient(baseUrl, userId, accessToken) {
        this.logger.log('Initializing Matrix client and waiting for initial sync to finish...');
        let promiseResolve;

        this.matrixClient = matrixcs.createClient({
            baseUrl,
            accessToken,
            userId,
            useAuthorizationHeader: true,
            lazyLoadMembers: true,
        });

        this.matrixClient.on('Room.timeline', (/** MatrixEvent */ event) => {
            _.set(this.onboardingEvents, event.getId(), event);
        });

        // @TODO Wait for https://github.com/matrix-org/matrix-js-sdk/pull/3484 to arrive
        // this.matrixClient.getLogger().disableAll();

        const result = new Promise((resolve) => {
            promiseResolve = resolve;
        });

        const handleSyncEvent = (newState, prevState, res) => {
            if (newState === 'ERROR') {
                this.logger.error(JSON.stringify(res));
            }

            if (newState === 'SYNCING' && prevState === 'PREPARED') {
                this.logger.log('Initial sync completed');
                promiseResolve(this.matrixClient);
            } else {
                this.matrixClient.once('sync', handleSyncEvent);
            }
        };

        this.matrixClient.once('sync', handleSyncEvent);

        this.matrixClient.startClient({
            filter: Filter.fromJson(this.matrixClient.getUserId(), 'onboardingEvents', {
                room: {
                    timeline: {
                        types: ['dev.medienhaus.onboarding'],
                    },
                },
            }),
            // @TODO: This should probably be something more sensible. But for now we support a maximum of 999
            // dev.medienhaus.onboarding event per room at time of boot.
            initialSyncLimit: 999,
        });

        return result;
    }

    stopClient() {
        this.logger.log('Stopping Matrix client...');
        return this.matrixClient.stopClient();
    }

    getRoom(roomId) {
        return this.matrixClient.getRoom(roomId);
    }

    sendOnboardingEvent(roomId, content) {
        return this.matrixClient.sendEvent(roomId, 'dev.medienhaus.onboarding', content);
    }

    /**
     * Returns all onboarding events we're currently aware of.
     *
     * @returns {Object<string, MatrixEvent>}
     */
    getOnboardingEvents() {
        return this.onboardingEvents;
    }

    async inviteUser(userId, roomId) {
        return this.matrixClient.invite(roomId, userId);
    }

    async setUserPowerLevel(userId, roomId, powerLevel) {
        // Bot gets the currently set power levels of the space
        const currentPowerLevelsEvent = await this.matrixClient.getStateEvent(roomId, 'm.room.power_levels', '');
        const powerEvent = new MatrixEvent({
            type: 'm.room.power_levels',
            content: currentPowerLevelsEvent,
        });
        // Sets the power level for the given user
        await this.matrixClient.setPowerLevel(roomId, userId, powerLevel, powerEvent);
    }
}
