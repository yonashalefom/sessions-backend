import { registerAs } from '@nestjs/config';

export default registerAs(
    'email',
    (): Record<string, any> => ({
        fromEmail: 'contact@yonashalefom.com',
        supportEmail: 'contact@yonashalefom.com',

        clientUrl: process.env.CLIENT_URL ?? 'https://example.com',
    })
);
