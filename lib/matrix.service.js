import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as matrixcs from 'matrix-js-sdk';
import _ from 'lodash';
import { Filter, MatrixEvent } from 'matrix-js-sdk';

@Injectable()
export class MatrixService {
    constructor() {
        this.logger = new ConsoleLogger(MatrixService.name);

        this.matrixClient = null;
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

        this.matrixClient.startClient();

        return result;
    }

    getRoom(roomId) {
        return this.matrixClient.getRoom(roomId);
    }

    sendOnboardingEvent(roomId, content) {
        return this.matrixClient.sendEvent(roomId, 'dev.medienhaus.onboarding', content);
    }

    getOnboardingEvents() {
        return _.flatMap(
            this.matrixClient.getRooms(),
            /**
             * @param {Room} room
             * @return {MatrixEvent[]}
             **/ (room) => {
                return _.compact(
                    room
                        .getOrCreateFilteredTimelineSet(
                            Filter.fromJson(this.matrixClient.getUserId(), 'onboardingEvents', {
                                room: {
                                    timeline: {
                                        types: ['dev.medienhaus.onboarding'],
                                    },
                                },
                            }),
                        )
                        .getLiveTimeline()
                        .getEvents(),
                );
            },
        );
    }

    async inviteUser(userId, roomId) {
        return this.matrixClient.invite(roomId, userId);
    }

    async makeUserModerator(userId, roomId) {
        // Bot gets the currently set power levels of the space
        const currentPowerLevelsEvent = await this.matrixClient.getStateEvent(roomId, 'm.room.power_levels', '');
        const powerEvent = new MatrixEvent({
            type: 'm.room.power_levels',
            content: currentPowerLevelsEvent,
        });
        // Sets the power level for the given user to become moderator
        await this.matrixClient.setPowerLevel(roomId, userId, 50, powerEvent);
    }
}
