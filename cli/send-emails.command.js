import { Command, CommandRunner, InquirerService, Option } from 'nest-commander';
import { ConsoleLogger, Dependencies } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parse } from 'csv-parse/sync';
import _ from 'lodash';
import { encrypt, PrivateKey } from 'eciesjs';
import nodemailer from 'nodemailer';
import * as fs from 'fs';
import isEmail from 'is-email';
import { confirm } from '@inquirer/prompts';

import { MatrixService } from '../lib/matrix.service';

@Command({
    name: 'send-emails',
    description: 'Send out invitations via email',
})
@Dependencies(ConfigService, MatrixService, InquirerService)
export class SendEmailsCommand extends CommandRunner {
    constructor(configService, matrixService, inquirerService) {
        super();

        this.logger = new ConsoleLogger(SendEmailsCommand.name);

        this.configService = configService;
        this.matrixService = matrixService;

        this.inquirerService = inquirerService;
    }

    @Option({
        flags: '-f, --file <filePathEmailAddressesRoomIdsCsv>',
        description: 'path to .csv file containing email addresses and room IDs',
        required: true,
    })
    parseFilePathEmailAddressesRoomIdsCsv(value) {
        try {
            parse(fs.readFileSync(value));
        } catch (error) {
            this.logger.error(
                'Please provide a valid CSV file containing email addresses and room IDs via -f or --file',
            );
            this.logger.debug(error.stack);
            process.exit(1);
        }

        return value;
    }

    @Option({
        flags: '-b, --body <filePathEmailBody>',
        description: '(optional) path to .txt file containing the email body',
    })
    parseFilePathEmailBody(value) {
        try {
            fs.readFileSync(value);
        } catch (error) {
            this.logger.error(
                'When using the -b, --body option please provide a valid .txt file containing the desired body of the email to send out',
            );
            this.logger.debug(error.stack);
            process.exit(1);
        }

        return value;
    }

    async run(passedParam, options) {
        const mapEmailAddressesToRoomIds = this.readEmailsAndRoomIdsFromFile(options.file);
        const emailBody = this.getEmailBody(options.body);

        // Create reusable transporter object using nodemailer
        const emailTransporter = await this.createMessageTransporter();

        const {
            baseUrl,
            emailFrom,
            emailSubject,
            matrixHomeserver,
            matrixAccessToken,
            matrixUserId,
            sleepBetweenMatrixEvents,
            sleepBetweenEmailSends,
        } = await this.inquirerService.ask('send-emails', undefined);

        // Confirm that the email body looks fine
        this.logger.log(`\n---------------------\n${emailBody}\n---------------------`);
        if (!(await confirm({ message: 'Does the email body above good to you?' }))) {
            process.exit(1);
        }

        // Start the Matrix client and wait for it to be ready (akin finalized the initial sync)
        await this.matrixService.startClient(matrixHomeserver, matrixUserId, matrixAccessToken);

        // Confirm one last time that we want to continue
        if (
            !(await confirm({
                message: `Please confirm (by typing 'y') that you want to continue and send out ${_.size(
                    mapEmailAddressesToRoomIds,
                )} emails`,
                default: false,
            }))
        ) {
            process.exit(1);
        }

        for (const emailTo in mapEmailAddressesToRoomIds) {
            const roomIds = mapEmailAddressesToRoomIds[emailTo];

            const privateKey = new PrivateKey();
            const publicKey = privateKey.publicKey.toHex();
            const roomNameList = [];

            for (const roomId of roomIds) {
                // matrixClient check if room exists
                const room = this.matrixService.getRoom(roomId);
                if (!room) return;

                // matrixClient check if we can access room and are admin
                const userRoomSignature = encrypt(publicKey, roomId).toString('base64url');

                this.matrixService.sendOnboardingEvent(room.roomId, {
                    signature: userRoomSignature,
                });
                this.logger.verbose(
                    `Sent dev.medienhaus.onboarding event for ${emailTo} to ${room.roomId} (${room.name})`,
                );

                roomNameList.push(room.name);

                // Sleep after every time we sent an onboarding event to a room
                await new Promise((x) => setTimeout(x, sleepBetweenMatrixEvents));
            }

            // send email
            emailTransporter
                .sendMail({
                    from: emailFrom,
                    to: emailTo,
                    subject: emailSubject,
                    text: emailBody
                        .replaceAll('<LINK>', `${baseUrl}?t=${privateKey.toHex()}`)
                        .replaceAll('<ROOMS>', '- ' + roomNameList.join('\n- ')),
                })
                .then((transporterResponse) => {
                    this.logger.verbose(`Invitation email sent: ${transporterResponse.messageId} to ${emailTo}`);
                });

            // Sleep after every email
            await new Promise((x) => setTimeout(x, sleepBetweenEmailSends));
        }
    }

    async createMessageTransporter() {
        try {
            const transporter = nodemailer.createTransport(this.configService.get('nodemailer'));
            await transporter.verify();
            this.logger.log('Verified nodemailer transport connection');
            return transporter;
        } catch (error) {
            this.logger.error('Could not create nodemailer transport; please check your configuration');
            this.logger.debug(error.stack);
            process.exit(1);
        }
    }

    getEmailBody(optionalFilePath) {
        if (optionalFilePath) {
            this.logger.log(`Reading custom email body from ${optionalFilePath}`);
            return fs.readFileSync(optionalFilePath).toString();
        }

        this.logger.log('Using default email body');
        return 'Hello,\n\nplease click here to accept the invitation to the rooms listed below: <LINK>\n\n\n<ROOMS>';
    }

    readEmailsAndRoomIdsFromFile(filePath) {
        this.logger.log(`Reading .csv file from ${filePath}...`);
        let emailsToSendOut = {};

        _.forEach(parse(fs.readFileSync(filePath)), (csvLine, index) => {
            // If neither column 1 nor column 2 are a valid email address, we skip it.
            // Typically, this might be the case for the first line if contains headers.
            if (!isEmail(csvLine[0]) && !isEmail(csvLine[1])) {
                this.logger.verbose(`Skipped line ${index} of .csv file (${csvLine.toString()})`);
                return;
            }

            let emailAddress;
            let roomId;

            if (isEmail(csvLine[0])) {
                [emailAddress, roomId] = csvLine;
            } else {
                [roomId, emailAddress] = csvLine;
            }

            emailsToSendOut[emailAddress] = _.concat(emailsToSendOut[emailAddress], roomId);
        });

        emailsToSendOut = _.mapValues(emailsToSendOut, (listOfRoomIds) => _.compact(_.uniq(listOfRoomIds)));

        this.logger.log(
            `Parsed ${_.size(emailsToSendOut)} different email addresses for ${_.size(
                _.uniq(_.flatten(_.values(emailsToSendOut))),
            )} different Matrix room IDs`,
        );

        return emailsToSendOut;
    }
}
