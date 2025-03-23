import { registerAs } from '@nestjs/config';

export default registerAs(
    'email',
    (): Record<string, any> => ({
        fromEmail: 'contact@yonashalefom.com',
        supportEmail: 'support@yonashalefom.com',
    })
);
