import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CreateTemplateCommand,
    CreateTemplateCommandInput,
    CreateTemplateCommandOutput,
    DeleteTemplateCommand,
    DeleteTemplateCommandInput,
    DeleteTemplateCommandOutput,
    GetSendQuotaCommand,
    GetTemplateCommand,
    GetTemplateCommandInput,
    GetTemplateCommandOutput,
    ListTemplatesCommand,
    ListTemplatesCommandInput,
    ListTemplatesCommandOutput,
    SESClient,
    SendBulkTemplatedEmailCommand,
    SendBulkTemplatedEmailCommandInput,
    SendBulkTemplatedEmailCommandOutput,
    SendTemplatedEmailCommand,
    SendTemplatedEmailCommandInput,
    SendTemplatedEmailCommandOutput,
    UpdateTemplateCommand,
    UpdateTemplateCommandInput,
    UpdateTemplateCommandOutput,
} from '@aws-sdk/client-ses';
import {
    AwsSESCreateTemplateDto,
    AwsSESGetTemplateDto,
    AwsSESSendBulkDto,
    AwsSESSendDto,
    AwsSESUpdateTemplateDto,
} from 'src/modules/aws/dtos/aws.ses.dto';
import { IAwsSESService } from 'src/modules/aws/interfaces/aws.ses-service.interface';

@Injectable()
export class AwsSESService implements IAwsSESService {
    private readonly sesClient: SESClient;

    constructor(private readonly configService: ConfigService) {
        this.sesClient = new SESClient({
            credentials: {
                accessKeyId: this.configService.get<string>(
                    'aws.ses.credential.key'
                ),
                secretAccessKey: this.configService.get<string>(
                    'aws.ses.credential.secret'
                ),
            },
            region: this.configService.get<string>('aws.ses.region'),
        });
    }

    async checkConnection(): Promise<boolean> {
        try {
            await this.sesClient.send<
                ListTemplatesCommandInput,
                ListTemplatesCommandOutput
            >(new GetSendQuotaCommand({}));

            return true;
        } catch {
            return false;
        }
    }

    async listTemplates(
        nextToken?: string
    ): Promise<ListTemplatesCommandOutput> {
        const command: ListTemplatesCommand = new ListTemplatesCommand({
            MaxItems: 20,
            NextToken: nextToken,
        });

        const listTemplate: ListTemplatesCommandOutput =
            await this.sesClient.send<
                ListTemplatesCommandInput,
                ListTemplatesCommandOutput
            >(command);
        return listTemplate;
    }

    async getTemplate({
        name,
    }: AwsSESGetTemplateDto): Promise<GetTemplateCommandOutput> {
        const command: GetTemplateCommand = new GetTemplateCommand({
            TemplateName: name,
        });

        const getTemplate: GetTemplateCommandOutput = await this.sesClient.send<
            GetTemplateCommandInput,
            GetTemplateCommandOutput
        >(command);

        return getTemplate;
    }

    async createTemplate({
        name,
        subject,
        htmlBody,
        plainTextBody,
    }: AwsSESCreateTemplateDto): Promise<CreateTemplateCommandOutput> {
        if (!htmlBody && !plainTextBody) {
            throw new Error('body is null');
        }

        const command: CreateTemplateCommand = new CreateTemplateCommand({
            Template: {
                TemplateName: name,
                SubjectPart: subject,
                HtmlPart: htmlBody,
                TextPart: plainTextBody,
            },
        });

        const create: CreateTemplateCommandOutput = await this.sesClient.send<
            CreateTemplateCommandInput,
            CreateTemplateCommandOutput
        >(command);

        return create;
    }

    async updateTemplate({
        name,
        subject,
        htmlBody,
        plainTextBody,
    }: AwsSESUpdateTemplateDto): Promise<UpdateTemplateCommandOutput> {
        if (!htmlBody && !plainTextBody) {
            throw new Error('body is null');
        }

        const command: UpdateTemplateCommand = new UpdateTemplateCommand({
            Template: {
                TemplateName: name,
                SubjectPart: subject,
                HtmlPart: htmlBody,
                TextPart: plainTextBody,
            },
        });

        const update: UpdateTemplateCommandOutput = await this.sesClient.send<
            UpdateTemplateCommandInput,
            UpdateTemplateCommandOutput
        >(command);

        return update;
    }

    async deleteTemplate({
        name,
    }: AwsSESGetTemplateDto): Promise<DeleteTemplateCommandOutput> {
        const command: DeleteTemplateCommand = new DeleteTemplateCommand({
            TemplateName: name,
        });

        const del: DeleteTemplateCommandOutput = await this.sesClient.send<
            DeleteTemplateCommandInput,
            DeleteTemplateCommandOutput
        >(command);

        return del;
    }

    async send<T>({
        recipients,
        sender,
        replyTo,
        bcc,
        cc,
        templateName,
        templateData,
    }: AwsSESSendDto<T>): Promise<SendTemplatedEmailCommandOutput> {
        const command: SendTemplatedEmailCommand =
            new SendTemplatedEmailCommand({
                Template: templateName,
                Destination: {
                    ToAddresses: recipients,
                    BccAddresses: bcc ?? [],
                    CcAddresses: cc ?? [],
                },
                Source: sender,
                TemplateData: JSON.stringify(templateData ?? ''),
                ReplyToAddresses: [replyTo ?? sender],
            });

        const sendWithTemplate: SendTemplatedEmailCommandOutput =
            await this.sesClient.send<
                SendTemplatedEmailCommandInput,
                SendTemplatedEmailCommandOutput
            >(command);

        return sendWithTemplate;
    }

    async sendBulk({
        recipients,
        sender,
        replyTo,
        bcc,
        cc,
        templateName,
    }: AwsSESSendBulkDto): Promise<SendBulkTemplatedEmailCommandOutput> {
        const command: SendBulkTemplatedEmailCommand =
            new SendBulkTemplatedEmailCommand({
                DefaultTemplateData: '',
                Template: templateName,
                Destinations: recipients.map(e => ({
                    Destination: {
                        ToAddresses: [e.recipient],
                        BccAddresses: bcc ?? [],
                        CcAddresses: cc ?? [],
                    },
                    ReplacementTemplateData: JSON.stringify(
                        e.templateData ?? ''
                    ),
                })),
                Source: sender,
                ReplyToAddresses: [replyTo ?? sender],
            });

        const sendWithTemplate: SendBulkTemplatedEmailCommandOutput =
            await this.sesClient.send<
                SendBulkTemplatedEmailCommandInput,
                SendBulkTemplatedEmailCommandOutput
            >(command);

        return sendWithTemplate;
    }
}
