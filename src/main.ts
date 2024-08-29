import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestApplication, NestFactory } from '@nestjs/core';
import chalk from 'chalk';
import { plainToInstance } from 'class-transformer';
import { useContainer, validate } from 'class-validator';

import { AppModule } from 'src/app/app.module';
import { AppEnvDto } from 'src/app/dtos/app.env.dto';
import { ENUM_APP_ENVIRONMENT } from 'src/app/enums/app.enum';
import { MessageService } from 'src/common/message/services/message.service';
import swaggerInit from 'src/swagger';

async function bootstrap() {
    const app: NestApplication = await NestFactory.create(AppModule, {
        abortOnError: false,
    });

    // region Configuration
    const configService = app.get(ConfigService);

    const env: string = configService.get<string>('app.env');
    const databaseUri: string = configService.get<string>('database.uri');
    const timezone: string = configService.get<string>('app.timezone');
    const host: string = configService.get<string>('app.http.host');
    const port: number =
        env !== ENUM_APP_ENVIRONMENT.MIGRATION
            ? configService.get<number>('app.http.port')
            : 9999;
    const globalPrefix: string = configService.get<string>('app.globalPrefix');
    const versioningPrefix: string = configService.get<string>(
        'app.urlVersion.prefix'
    );
    const version: string = configService.get<string>('app.urlVersion.version');

    // Enable/Disable API Endpoints
    const httpEnable: boolean = configService.get<boolean>('app.http.enable');
    const versionEnable: string = configService.get<string>(
        'app.urlVersion.enable'
    );
    const jobEnable: boolean = configService.get<boolean>('app.jobEnable');

    const logger = new Logger('Sesssions-Main');
    process.env.NODE_ENV = env;
    process.env.TZ = timezone;

    // Global Prefix
    app.setGlobalPrefix(globalPrefix);

    // For Custom Validation
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    // API Versioning
    if (versionEnable) {
        app.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: version,
            prefix: versioningPrefix,
        });
    }
    // endregion

    // Validate Env
    const classEnv = plainToInstance(AppEnvDto, process.env);
    const errors = await validate(classEnv);
    if (errors.length > 0) {
        const messageService = app.get(MessageService);
        const errorsMessage = messageService.setValidationMessage(errors);
        logger.log(errorsMessage);

        throw new Error(
            'The .env file you are using is invalid. Please correct your .env file by comparing it with .env.example'
        );
    }

    await swaggerInit(app);

    await app.listen(port, host);

    logger.log(
        chalk.cyan.bold(
            `==========================================================`
        )
    );

    logger.log(
        chalk.cyan.bold('Environment Variable: ') +
            chalk.magentaBright.bold(`${env}`)
    );

    // logger.log(JSON.parse(JSON.stringify(process.env)));

    logger.log(
        chalk.cyan.bold(
            `==========================================================`
        )
    );

    if (env === ENUM_APP_ENVIRONMENT.MIGRATION) {
        logger.log(`On migrate the schema`);

        await app.close();

        logger.log(`Migrate done`);
        logger.log(
            chalk.cyan.bold(
                `==========================================================`
            )
        );

        return;
    }

    logger.log(
        chalk.cyan.bold('Worker (Job) is: ') +
            chalk.magentaBright.bold(`${jobEnable ? 'Active' : 'Inactive'}`)
    );
    logger.log(
        chalk.cyan.bold('API Endpoints Are: ') +
            chalk.magentaBright.bold(
                `${httpEnable ? 'Active (Routes Accessible)' : 'Inactive (Routes Inaccessible)'}`
            )
    );
    logger.log(
        chalk.cyan.bold('Http Versioning Is: ') +
            chalk.magentaBright.bold(`${versionEnable}`)
    );

    logger.log(
        chalk.cyan.bold('Server running on: ') +
            chalk.magentaBright.bold(`${await app.getUrl()}`)
    );
    logger.log(
        chalk.cyan.bold('Database running on: ') +
            chalk.magentaBright.bold(databaseUri)
    );

    logger.log(
        chalk.cyan.bold(
            `==========================================================`
        )
    );
}
bootstrap();
