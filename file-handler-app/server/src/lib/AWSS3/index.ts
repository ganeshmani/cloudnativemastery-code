import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import { nanoid } from "nanoid";

export default class FileUpload {
  public readonly s3: S3Client;
  private static instance: S3Client | null = null;

  constructor() {
    if (!FileUpload.instance) {
      this.s3 = new S3Client({
        region: process.env.AWS_REGION || "us-east-1", // Specify your AWS region
      });
      FileUpload.instance = this.s3;
    } else {
      this.s3 = FileUpload.instance;
    }
  }

  async getSignedUrlForUpload(key: string, contentType: string, id: string) {
    const params: PutObjectCommandInput = {
      Bucket: process.env.AWS_S3_BUCKET || "my-bucket",
      Key: key,
      ContentType: contentType,
      Metadata: {
        id: id,
      },
    };

    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 60 * 60 * 24 * 7,
    });
    return signedUrl;
  }

  async getSignedUrlForDownload(key: string, fileName: string) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || "my-bucket",
      Key: key,
      Expires: 60 * 60 * 24 * 7,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    };

    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 60 * 60 * 24 * 7,
    });

    console.log("signedUrl", signedUrl);

    return signedUrl;
  }

  async upload(stream: Readable, key: string, contentType: string, id: string) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || "my-bucket",
      Key: key,
      ContentType: contentType,
      Metadata: {
        id: id,
      },
      Body: stream,
    };

    const command = new PutObjectCommand(params);
    const response = await this.s3.send(command);
    return response;
  }

  async delete(key: string) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || "my-bucket",
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    const response = await this.s3.send(command);
    return response;
  }
}
