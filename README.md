# matrix-email-onboarding

A microservice written with [NestJS](https://github.com/nestjs/nest) to send out emails, handle web requests attempting to redeem one of those invitations and eventually make the invited Matrix user a moderator of the associated Matrix rooms or spaces.

## Routes

- `GET /?t=abcdef1239` - Checks if the given token is valid for a set of Matrix rooms/spaces and presents a login form if so
- `POST /?t=abcdef1239` - Attempts a login against the specified Matrix server to make the person logging in a moderator of the Matrix space linked to the given token

## Scripts

**send-emails** - This sends out emails to all email addresses in a given `.csv` file.
```bash
Usage: npm run cli send-emails [options]

Send out invitations via email

Options:
  -f, --file <filePathEmailAddressesRoomIdsCsv>  path to .csv file containing email addresses and room IDs
  -b, --body <filePathEmailBody>                 (optional) path to .txt file containing the email body

```
