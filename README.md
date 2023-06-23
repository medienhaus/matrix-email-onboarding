# matrix-email-onboarding

A microservice to invite moderators to Matrix rooms (or spaces) via their email addresses, even before they might have a Matrix account.

Have a list of email addresses and Matrix rooms (or spaces) you wish to invite them to? Don't know their Matrix usernames or if they even have a Matrix account yet? This is for you.

- Comes with a CLI tool to send out emails 📨 containing invitation links
- Node.js server-side application to handle web requests to
    - (1) check for pending invitations 🔍 for a given onboarding code
    - (2) accept invitations ☑️ and join the given rooms/spaces
    - (3) promote newly joined users to become moderators 🧑‍⚖️

Requires a Matrix user (can be a bot) that is able to
1. access and send `dev.medienhaus.onboarding` events for all rooms that you want to invite users to, and
2. has a power level `>= 50` for all of those Matrix rooms to be able to promote invited users to be moderators.

## Configuration

Copy `config.example.js` to `config.js`.


## Scripts

**send-emails** - Sends out one email per unique email address in a given `.csv` file, and adds one `dev.medienhaus.onboarding` event per email address to each Matrix room/space containing an encrypted identifier unique to the recipient of the email.

```bash
Usage: npm run cli send-emails [options]

Send out invitations via email

Options:
  -f, --file <filePathEmailAddressesRoomIdsCsv>  path to .csv file containing email addresses and room IDs
  -b, --body <filePathEmailBody>                 (optional) path to .txt file containing the email body
```

The `.csv` file might look like this:
```csv
email,roomId
marcel@medienhaus.dev,!tHrDSuEgEVcZGrivjN:medienhaus.dev
andi@medienhaus.dev,!QQpfJfZvqxbCfeDgCj:matrix.org
```

In your email body you can include the following placeholders which will be then replaced with its respective meaningful content:

- `<LINK>` The link that brings the user to the login form where they can login using a Matrix account to accept the invitation
- `<ROOMS>` A list of Matrix room names (separated by `\n`) the user is being invited to

## Credits

Written in JavaScript with the [NestJS](https://github.com/nestjs/nest) framework for Node.js, with the help of the [matrix-js-sdk](https://github.com/matrix-org/matrix-js-sdk), [Handlebars](https://github.com/handlebars-lang/handlebars.js) and [ECIES](https://github.com/ecies/js). Includes a CLI tool made possible by [nest-commander](https://github.com/jmcdo29/nest-commander), [Inquirer](https://github.com/SBoudrias/Inquirer.js) and [Nodemailer](https://github.com/nodemailer/nodemailer).

---

Public money, public code. The development of this project was funded and supported by public institutions. The code was written and is being maintained by **medienhaus/** and our friends.

<a href="https://medienhaus.dev" target="_blank"><img src="https://medienhaus.dev/favicon.svg" width="40" /></a>