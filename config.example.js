export default () => ({
    title: 'matrix-email-onboarding',
    base_url: 'https://matrix.org/invitations/',
    email: {
        from: 'A friendly bot <bot@matrix.org>',
        subject: 'Matrix Invitations',
    },
    // The nodemailer object will be passed 1:1 straight to nodemailer's `createTransport` method, so you can
    // make use of the various transport methods it allows for, e.g.:
    // - SMTP: https://nodemailer.com/smtp/#1-single-connection
    // - sendmail: https://nodemailer.com/transports/sendmail/
    nodemailer: {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
            user: 'username',
            pass: 'password',
        },
    },
    matrix: {
        homeserver_base_url: 'https://matrix.org',
        // This user should have read + write access for all Matrix rooms/spaces that users are being invited to
        user_id: '@bbot:matrix.org',
        access_token: 'syt_cnVuZGd...',
        // The powerlevel to promote users to after they automatically joined; make sure that the user above has
        // at least this powerlevel (or higher) for all Matrix rooms/spaces that users are being invited to.
        // You can remove this line or leave it at 0 to not modify the power level at all.
        // More details on power levels can be found here: https://matrix.org/docs/communities/moderation/
        powerlevel: 0,
    },
});
