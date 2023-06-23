export default () => ({
    title: 'matrix-email-onboarding',
    base_url: 'https://matrix.org/invitations/',
    email: {
        from: 'A friendly bot <bot@matrix.org>',
        subject: 'Matrix Invitations',
    },
    matrix: {
        homeserver_base_url: 'https://matrix.org',
        // This user should be at least moderator for all Matrix rooms/spaces that users are being invited to
        user_id: '@bbot:matrix.org',
        access_token: 'syt_cnVuZGd...',
    },
});
