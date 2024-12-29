import { registerAs } from '@nestjs/config';

export default registerAs(
    'stream',
    (): Record<string, any> => ({
        apiKey: process.env.STREAM_API_KEY,
        secretKey: process.env.STREAM_SECRET_KEY,
        timeout: parseInt(process.env.STREAM_TIMEOUT || '3000', 10),
    })
);
