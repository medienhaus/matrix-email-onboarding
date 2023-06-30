<br>

🖤 Questions? Ideas? We'd love to hear your feedback: [#matrix-email-onboarding:medienhaus.dev](https://matrix.to/#/#matrix-email-onboarding:medienhaus.dev)

<hr>
<br>

# matrix-email-onboarding

A microservice to invite users to Matrix rooms (or spaces) via their email addresses, even before they might have a Matrix account.

Do you have a list of email addresses and Matrix rooms (or spaces) which you wish to invite them to? And you don't know their Matrix usernames or if they even have a Matrix account yet? This is for you. ✨

- Comes with a CLI tool to send out emails 📨 with a link (containing a secret token) for your user to click on
- Node.js server-side application to handle web requests to
  - (1) check a given secret onboarding token 🔍 and list the linked Matrix rooms or spaces
  - (2) let the user sign in ☑️ with their Matrix account and automatically join the given rooms or spaces
  - (3) (optionally) promote those newly joined users to become moderators or administrators 🧑‍⚖️

The only requirement for this is a Matrix user (or a bot) that
1. has the ability to access and send `dev.medienhaus.onboarding` events for all rooms that you want to invite users to, and
2. (optionally) has a power level at least as high as what you're trying to promote users to. (e.g. needs to be at least a moderator, if you want to make everyone a moderator)

<br>

## Configuration

Copy `config.example.js` to `config.js`. Check the file's comments for more details.

<br>

## Running

```bash
npm start
```

You can make use the following environment variables to adjust your deployment:
- `PORT` Which port the service should run on (default: `3000`)
- `GLOBAL_PREFIX` If you are running the service in a certain subdirectory, e.g. behind a reverse-proxy (default: `/`)

<br>

## Scripts

**send-emails** - Sends out one email per unique email address in a given `.csv` file, and adds one `dev.medienhaus.onboarding` event per email address to each Matrix room/space containing an encrypted identifier unique to the recipient of the email.

<img width="1384" alt="image" src="https://github.com/medienhaus/matrix-email-onboarding/assets/706419/2a8bd954-cbf7-4406-bb78-a4bf669c783a">


```bash
Usage: npm run cli send-emails -- [options]

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

<br>

## Credits

Written in JavaScript with the [NestJS](https://github.com/nestjs/nest) framework for Node.js, with the help of the [matrix-js-sdk](https://github.com/matrix-org/matrix-js-sdk), [Handlebars](https://github.com/handlebars-lang/handlebars.js) and [ECIES](https://github.com/ecies/js). Includes a CLI tool made possible by [nest-commander](https://github.com/jmcdo29/nest-commander), [Inquirer](https://github.com/SBoudrias/Inquirer.js) and [Nodemailer](https://github.com/nodemailer/nodemailer).

<br>

## License

<a href="LICENSE"><img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/cc-zero.svg" /></a>

<br><br><br><br><br><br>

Public money, public code. The development of this project was funded and supported by public institutions. The code was written and is being maintained by **medienhaus/** and our friends.

<a href="https://medienhaus.dev" target="_blank"><img src="https://medienhaus.dev/favicon.svg" width="40" /></a>
