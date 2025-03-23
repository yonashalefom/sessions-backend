import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    ObjectIdentifier,
    CreateMultipartUploadCommand,
    CreateMultipartUploadCommandInput,
    UploadPartCommandInput,
    UploadPartCommand,
    CompleteMultipartUploadCommandInput,
    CompleteMultipartUploadCommand,
    GetObjectCommandInput,
    AbortMultipartUploadCommand,
    AbortMultipartUploadCommandInput,
    ListObjectsV2Output,
    GetObjectOutput,
    DeleteObjectsCommandInput,
    ListObjectsV2CommandInput,
    ListObjectsV2CommandOutput,
    DeleteObjectsCommandOutput,
    DeleteObjectCommandInput,
    DeleteObjectCommandOutput,
    GetObjectCommandOutput,
    PutObjectCommandInput,
    PutObjectCommandOutput,
    CreateMultipartUploadCommandOutput,
    UploadPartCommandOutput,
    CompleteMultipartUploadCommandOutput,
    AbortMultipartUploadCommandOutput,
    _Object,
    ObjectCannedACL,
    HeadObjectCommand,
    HeadObjectCommandInput,
    HeadObjectCommandOutput,
    NoSuchKey,
    HeadBucketCommandOutput,
    HeadBucketCommand,
    HeadBucketCommandInput,
    ListBucketsCommand,
} from '@aws-sdk/client-s3';
import { IAwsS3Service } from 'src/modules/aws/interfaces/aws.s3-service.interface';
import { AwsS3Dto } from 'src/modules/aws/dtos/aws.s3.dto';
import {
    IAwsS3Config,
    IAwsS3DeleteDirOptions,
    IAwsS3GetItemsOptions,
    IAwsS3Options,
    IAwsS3PresignOptions,
    IAwsS3PutItem,
    IAwsS3PutItemWithAclOptions,
} from 'src/modules/aws/interfaces/aws.interface';
import {
    AwsS3MultipartDto,
    AwsS3MultipartPartDto,
} from 'src/modules/aws/dtos/aws.s3-multipart.dto';
import { AWS_S3_MAX_PART_NUMBER } from 'src/modules/aws/constants/aws.constant';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ENUM_AWS_S3_ACCESSIBILITY } from 'src/modules/aws/enums/aws.enum';
import { FILE_SIZE_IN_BYTES } from 'src/common/file/constants/file.constant';
import { AwsS3PresignResponseDto } from 'src/modules/aws/dtos/response/aws.s3-presign.response.dto';
import { AwsS3PresignRequestDto } from 'src/modules/aws/dtos/request/aws.s3-presign.request.dto';
import { AwsS3ResponseDto } from 'src/modules/aws/dtos/response/aws.s3-response.dto';
import { plainToInstance } from 'class-transformer';
import { AwsS3PresignMultiPartResponseDto } from 'src/modules/aws/dtos/response/aws.s3-presign-multipart.response.dto';

@Injectable()
export class AwsS3Service implements OnModuleInit, IAwsS3Service {
    private readonly presignExpired: number;
    private config: IAwsS3Config;

    constructor(private readonly configService: ConfigService) {
        this.presignExpired = this.configService.get<number>(
            'aws.s3.presignExpired'
        );
        this.config = this.configService.get<IAwsS3Config>('aws.s3.config');
    }

    onModuleInit(): void {
        this.config.public.client = new S3Client({
            credentials: {
                accessKeyId: this.config.public.credential.key,
                secretAccessKey: this.config.public.credential.secret,
            },
            region: this.config.public.region,
        });

        this.config.private.client = new S3Client({
            credentials: {
                accessKeyId: this.config.private.credential.key,
                secretAccessKey: this.config.private.credential.secret,
            },
            region: this.config.private.region,
        });
    }

    getConfig(options?: IAwsS3Options) {
        return options?.access === ENUM_AWS_S3_ACCESSIBILITY.PRIVATE
            ? this.config.private
            : this.config.public;
    }

    getFileInfo(key: string) {
        const pathWithFilename: string = `/${key}`;
        const filename: string = key.substring(
            key.lastIndexOf('/') + 1,
            key.length
        );
        const mime: string = filename.substring(
            filename.lastIndexOf('.') + 1,
            filename.length
        );
        return { pathWithFilename, filename, mime };
    }

    async checkConnection(options?: IAwsS3Options): Promise<boolean> {
        const config = this.getConfig(options);
        try {
            await config.client.send(new ListBucketsCommand({}));
            return true;
        } catch {
            return false;
        }
    }

    async checkBucket(options?: IAwsS3Options): Promise<boolean> {
        const config = this.getConfig(options);
        const command: HeadBucketCommand = new HeadBucketCommand({
            Bucket: config.bucket,
        });
        await config.client.send<
            HeadBucketCommandInput,
            HeadBucketCommandOutput
        >(command);
        return true;
    }

    async checkItem(key: string, options?: IAwsS3Options): Promise<AwsS3Dto> {
        if (key.startsWith('/')) {
            throw new Error('Key should not start with "/"');
        }

        const config = this.getConfig(options);
        const headCommand = new HeadObjectCommand({
            Bucket: config.bucket,
            Key: key,
        });
        const item = await config.client.send<
            HeadObjectCommandInput,
            HeadObjectCommandOutput
        >(headCommand);
        const { pathWithFilename, mime } = this.getFileInfo(key);

        return {
            bucket: config.bucket,
            key,
            completedUrl: `${config.baseUrl}${pathWithFilename}`,
            cdnUrl: config.cdnUrl
                ? `${config.cdnUrl}${pathWithFilename}`
                : undefined,
            mime,
            size: item.ContentLength,
        };
    }

    async getItems(
        path: string,
        options?: IAwsS3GetItemsOptions
    ): Promise<AwsS3Dto[]> {
        if (path.startsWith('/')) {
            throw new Error('Path should not start with "/"');
        }

        const config = this.getConfig(options);
        const command: ListObjectsV2Command = new ListObjectsV2Command({
            Bucket: config.bucket,
            Prefix: path,
            MaxKeys: 1000,
            ContinuationToken: options?.continuationToken,
        });

        const listItems: ListObjectsV2Output = await config.client.send<
            ListObjectsV2CommandInput,
            ListObjectsV2CommandOutput
        >(command);
        const mapList: AwsS3Dto[] = listItems.Contents.map((item: _Object) => {
            const { pathWithFilename, mime } = this.getFileInfo(item.Key);
            return {
                bucket: config.bucket,
                key: item.Key,
                completedUrl: `${config.baseUrl}${pathWithFilename}`,
                cdnUrl: config.cdnUrl
                    ? `${config.cdnUrl}${pathWithFilename}`
                    : undefined,
                baseUrl: config.baseUrl,
                mime,
                size: item.Size,
            };
        });

        if (listItems.IsTruncated) {
            const nextItems: AwsS3Dto[] = await this.getItems(path, {
                ...options,
                continuationToken: listItems.NextContinuationToken,
            });
            mapList.push(...nextItems);
        }

        if (listItems.CommonPrefixes) {
            for (const dir of listItems.CommonPrefixes) {
                const dirItems = await this.getItems(dir.Prefix, {
                    access: options?.access,
                });
                mapList.push(...dirItems);
            }
        }

        return mapList;
    }

    async getItem(key: string, options?: IAwsS3Options): Promise<AwsS3Dto> {
        if (key.startsWith('/')) {
            throw new Error('Key should not start with "/"');
        }

        const config = this.getConfig(options);
        const command: GetObjectCommand = new GetObjectCommand({
            Bucket: config.bucket,
            Key: key,
        });
        const item: GetObjectOutput = await config.client.send<
            GetObjectCommandInput,
            GetObjectCommandOutput
        >(command);
        const { pathWithFilename, mime } = this.getFileInfo(key);

        return {
            bucket: config.bucket,
            key,
            completedUrl: `${config.baseUrl}${pathWithFilename}`,
            cdnUrl: config.cdnUrl
                ? `${config.cdnUrl}${pathWithFilename}`
                : undefined,
            mime,
            data: item.Body,
            size: item.ContentLength,
        };
    }

    async putItem(
        file: IAwsS3PutItem,
        options?: IAwsS3Options
    ): Promise<AwsS3Dto> {
        if (file.key.startsWith('/')) {
            throw new Error('Key should not start with "/"');
        } else if (!file.file) {
            throw new Error('File is required');
        }

        const config = this.getConfig(options);
        const { pathWithFilename, mime } = this.getFileInfo(file.key);
        const content: Buffer = file.file;
        const command: PutObjectCommand = new PutObjectCommand({
            Bucket: config.bucket,
            Key: file.key,
            Body: content,
        });

        await config.client.send<PutObjectCommandInput, PutObjectCommandOutput>(
            command
        );

        return {
            bucket: config.bucket,
            key: file.key,
            completedUrl: `${config.baseUrl}${pathWithFilename}`,
            cdnUrl: config.cdnUrl
                ? `${config.cdnUrl}${pathWithFilename}`
                : undefined,
            mime,
            size: file?.size,
            duration: file?.duration,
        };
    }

    async putItemWithAcl(
        file: IAwsS3PutItem,
        options?: IAwsS3PutItemWithAclOptions
    ): Promise<AwsS3Dto> {
        if (file.key.startsWith('/')) {
            throw new Error('Key should not start with "/"');
        } else if (!file.file) {
            throw new Error('File is required');
        }

        const config = this.getConfig(options);
        const { pathWithFilename, mime } = this.getFileInfo(file.key);
        const content: Buffer = file.file;
        const command: PutObjectCommand = new PutObjectCommand({
            Bucket: config.bucket,
            Key: file.key,
            Body: content,
            ACL: options?.acl ?? ObjectCannedACL.public_read,
        });

        await config.client.send<PutObjectCommandInput, PutObjectCommandOutput>(
            command
        );

        return {
            bucket: config.bucket,
            key: file.key,
            completedUrl: `${config.baseUrl}${pathWithFilename}`,
            cdnUrl: config.cdnUrl
                ? `${config.cdnUrl}${pathWithFilename}`
                : undefined,
            mime,
            size: file?.size,
            duration: file?.duration,
        };
    }

    async deleteItem(key: string, options?: IAwsS3Options): Promise<void> {
        if (key.startsWith('/')) {
            throw new Error('Key should not start with "/"');
        }

        const config = this.getConfig(options);
        const command: DeleteObjectCommand = new DeleteObjectCommand({
            Bucket: config.bucket,
            Key: key,
        });

        await config.client.send<
            DeleteObjectCommandInput,
            DeleteObjectCommandOutput
        >(command);
    }

    async deleteItems(keys: string[], options?: IAwsS3Options): Promise<void> {
        if (keys.some(e => e.startsWith('/'))) {
            throw new Error('Keys should not start with "/"');
        }

        const config = this.getConfig(options);
        const obj: ObjectIdentifier[] = keys.map((val: string) => ({
            Key: val,
        }));
        const command: DeleteObjectsCommand = new DeleteObjectsCommand({
            Bucket: config.bucket,
            Delete: { Objects: obj },
        });

        await config.client.send<
            DeleteObjectsCommandInput,
            DeleteObjectsCommandOutput
        >(command);
    }

    async deleteDir(
        path: string,
        options?: IAwsS3DeleteDirOptions
    ): Promise<void | _Object[]> {
        if (path.startsWith('/')) {
            throw new Error('Path should not start with "/"');
        }

        const config = this.getConfig(options);
        let continuationToken: string | undefined = undefined;

        do {
            const listCommand: ListObjectsV2Command = new ListObjectsV2Command({
                Bucket: config.bucket,
                Prefix: path,
                MaxKeys: 1000,
                ContinuationToken: continuationToken,
            });

            const listItems: ListObjectsV2Output = await config.client.send<
                ListObjectsV2CommandInput,
                ListObjectsV2CommandOutput
            >(listCommand);

            if (listItems.Contents && listItems.Contents.length > 0) {
                const deleteObjectsCommand: DeleteObjectsCommand =
                    new DeleteObjectsCommand({
                        Bucket: config.bucket,
                        Delete: {
                            Objects: listItems.Contents.map(item => ({
                                Key: item.Key,
                            })),
                        },
                    });

                await config.client.send<
                    DeleteObjectsCommandInput,
                    DeleteObjectsCommandOutput
                >(deleteObjectsCommand);
            }

            continuationToken = listItems.NextContinuationToken;
        } while (continuationToken);
    }

    async createMultiPart(
        file: IAwsS3PutItem,
        maxPartNumber: number,
        options?: IAwsS3Options
    ): Promise<AwsS3MultipartDto> {
        if (file.key.startsWith('/')) {
            throw new Error('Key should not start with "/"');
        } else if (maxPartNumber > AWS_S3_MAX_PART_NUMBER) {
            throw new Error(
                `Max part number is greater than ${AWS_S3_MAX_PART_NUMBER}`
            );
        }

        const config = this.getConfig(options);
        const { pathWithFilename, mime } = this.getFileInfo(file.key);

        const multiPartCommand: CreateMultipartUploadCommand =
            new CreateMultipartUploadCommand({
                Bucket: config.bucket,
                Key: file.key,
            });

        const response = await config.client.send<
            CreateMultipartUploadCommandInput,
            CreateMultipartUploadCommandOutput
        >(multiPartCommand);

        return {
            bucket: config.bucket,
            uploadId: response.UploadId,
            key: file.key,
            completedUrl: `${config.baseUrl}${pathWithFilename}`,
            cdnUrl: config.cdnUrl
                ? `${config.cdnUrl}${pathWithFilename}`
                : undefined,
            mime,
            duration: file?.duration,
            size: file?.size,
            lastPartNumber: 0,
            maxPartNumber: maxPartNumber,
            parts: [],
        };
    }

    async createMultiPartWithAcl(
        file: IAwsS3PutItem,
        maxPartNumber: number,
        options?: IAwsS3PutItemWithAclOptions
    ): Promise<AwsS3MultipartDto> {
        if (file.key.startsWith('/')) {
            throw new Error('Key should not start with "/"');
        } else if (maxPartNumber > AWS_S3_MAX_PART_NUMBER) {
            throw new Error(
                `Max part number is greater than ${AWS_S3_MAX_PART_NUMBER}`
            );
        }

        const config = this.getConfig(options);
        const { pathWithFilename, mime } = this.getFileInfo(file.key);

        const multiPartCommand: CreateMultipartUploadCommand =
            new CreateMultipartUploadCommand({
                Bucket: config.bucket,
                Key: file.key,
                ACL: options?.acl ?? ObjectCannedACL.public_read,
            });

        const response = await config.client.send<
            CreateMultipartUploadCommandInput,
            CreateMultipartUploadCommandOutput
        >(multiPartCommand);

        return {
            bucket: config.bucket,
            uploadId: response.UploadId,
            key: file.key,
            completedUrl: `${config.baseUrl}${pathWithFilename}`,
            cdnUrl: config.cdnUrl
                ? `${config.cdnUrl}${pathWithFilename}`
                : undefined,
            mime,
            size: file?.size,
            lastPartNumber: 0,
            maxPartNumber: maxPartNumber,
            duration: file?.duration,
            parts: [],
        };
    }

    async putItemMultiPart(
        multipart: AwsS3MultipartDto,
        partNumber: number,
        file: Buffer,
        options?: IAwsS3Options
    ): Promise<AwsS3MultipartDto> {
        const config = this.getConfig(options);

        const uploadPartCommand: UploadPartCommand = new UploadPartCommand({
            Bucket: config.bucket,
            Key: multipart.key,
            Body: file,
            PartNumber: partNumber,
            UploadId: multipart.uploadId,
        });

        const { ETag } = await config.client.send<
            UploadPartCommandInput,
            UploadPartCommandOutput
        >(uploadPartCommand);

        const part: AwsS3MultipartPartDto = {
            eTag: ETag,
            partNumber: partNumber,
            size: file.length,
        };

        multipart.parts.push(part);
        multipart.lastPartNumber = part.partNumber;

        return multipart;
    }

    async completeMultipart(
        key: string,
        uploadId: string,
        options?: IAwsS3Options
    ): Promise<void> {
        const config = this.getConfig(options);

        const completeMultipartCommand: CompleteMultipartUploadCommand =
            new CompleteMultipartUploadCommand({
                Bucket: config.bucket,
                Key: key,
                UploadId: uploadId,
            });

        await config.client.send<
            CompleteMultipartUploadCommandInput,
            CompleteMultipartUploadCommandOutput
        >(completeMultipartCommand);

        return;
    }

    async abortMultipart(
        key: string,
        uploadId: string,
        options?: IAwsS3Options
    ): Promise<void> {
        const config = this.getConfig(options);

        const abortMultipartCommand: AbortMultipartUploadCommand =
            new AbortMultipartUploadCommand({
                Bucket: config.bucket,
                Key: key,
                UploadId: uploadId,
            });

        await config.client.send<
            AbortMultipartUploadCommandInput,
            AbortMultipartUploadCommandOutput
        >(abortMultipartCommand);

        return;
    }

    async presignPutItem(
        key: string,
        options?: IAwsS3PresignOptions
    ): Promise<AwsS3PresignResponseDto> {
        if (key.startsWith('/')) {
            throw new Error('Key should not start with "/"');
        }

        const config = this.getConfig(options);

        const headCommand = new HeadObjectCommand({
            Bucket: config.bucket,
            Key: key,
        });

        try {
            await config.client.send<
                HeadObjectCommandInput,
                HeadObjectCommandOutput
            >(headCommand);

            throw new Error(`Key ${key} is already exist`);
        } catch (error: unknown) {
            if (!(error instanceof NoSuchKey)) {
                throw error;
            }
        }

        const filename: string = key.substring(
            key.lastIndexOf('/') + 1,
            key.length
        );
        const mime: string = filename.substring(
            filename.lastIndexOf('.') + 1,
            filename.length
        );

        const size = options?.allowedSize ?? FILE_SIZE_IN_BYTES;
        const command = new PutObjectCommand({
            Bucket: config.bucket,
            Key: key,
            ContentType: mime,
            ContentLength: size,
        });
        const expiresIn = options?.expired ?? this.presignExpired;
        const presignUrl = await getSignedUrl(config.client, command, {
            expiresIn,
        });

        return { expiredIn: this.presignExpired, presignUrl: presignUrl, key };
    }

    async presignPutItemMultipart(
        key: string,
        uploadId: string,
        partNumber: number,
        options?: IAwsS3PresignOptions
    ): Promise<AwsS3PresignMultiPartResponseDto> {
        if (key.startsWith('/')) {
            throw new Error('Key should not start with "/"');
        }

        const config = this.getConfig(options);

        const uploadPartCommand: UploadPartCommand = new UploadPartCommand({
            Bucket: config.bucket,
            Key: key,
            PartNumber: partNumber,
            UploadId: uploadId,
        });

        const expiresIn = options?.expired ?? this.presignExpired;
        const presignUrl = await getSignedUrl(
            config.client,
            uploadPartCommand,
            {
                expiresIn,
            }
        );

        return {
            expiredIn: this.presignExpired,
            presignUrl: presignUrl,
            key,
            partNumber,
            uploadId,
        };
    }

    mapPresign(
        { key, size, duration }: AwsS3PresignRequestDto,
        options?: IAwsS3Options
    ): AwsS3Dto {
        if (key.startsWith('/')) {
            throw new Error('Key should not start with "/"');
        }

        const config = this.getConfig(options);

        const pathWithFilename: string = `/${key}`;
        const filename: string = key.substring(
            key.lastIndexOf('/') + 1,
            key.length
        );
        const mime: string = filename.substring(
            filename.lastIndexOf('.') + 1,
            filename.length
        );

        return {
            bucket: config.bucket,
            key,
            completedUrl: `${config.baseUrl}${pathWithFilename}`,
            cdnUrl: config.cdnUrl
                ? `${config.cdnUrl}${pathWithFilename}`
                : undefined,
            mime,
            size,
            duration,
        };
    }

    mapResponse(dto: AwsS3Dto): AwsS3ResponseDto {
        return plainToInstance(AwsS3ResponseDto, dto);
    }
}
