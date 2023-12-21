import { Handler, S3Event, Context, Callback } from "aws-lambda";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { marshall } from "@aws-sdk/util-dynamodb";

import DBClient from "./lib/DynamoDB";
import SNSClientService from "./lib/SNS";

const s3Client = new S3Client();

export const handler: Handler<S3Event, Context> = async (
  event: S3Event,
  context: Context,
  callback: Callback
): Promise<any> => {
  console.log("Event: ", JSON.stringify(event, null, 2));

  const fileUploadTopicArn = process.env.FILE_UPLOAD_TOPIC_ARN;

  if (event.Records === null) {
    const error = new Error("No records found");
    callback(error);
    return;
  }

  const s3Record = event.Records[0].s3;
  const bucketName = s3Record.bucket.name;
  const key = s3Record.object.key;

  const headObjectParams = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const headObjectResponse = await s3Client.send(
      new HeadObjectCommand(headObjectParams)
    );
    const customMetadata = headObjectResponse.Metadata;

    console.log("customMetadata", customMetadata);
  } catch (error) {
    console.error("Error fetching head object:", error);
  }

  console.log("key", key);
  const dbClient = new DBClient();

  try {
    const headObjectResponse = await s3Client.send(
      new HeadObjectCommand(headObjectParams)
    );
    const customMetadata = headObjectResponse.Metadata;

    const id = customMetadata?.id;

    if (!id) {
      throw new Error("id not found");
    }

    const filesData = await dbClient.get("files", "id", id);

    if (filesData == null) {
      throw new Error("File not found");
    }

    filesData.isUploaded = true;
    filesData.state = "completed";
    filesData.createdAt = new Date().toISOString();
    const response = await dbClient.update(filesData, "files");

    console.log("File record updated", response);

    const snsPayload = {
      id: id,
      state: "UPLOAD_COMPLETE",
    };

    const snsPayloadString = JSON.stringify(snsPayload);

    const sns = SNSClientService.getInstance();

    await sns.publish(snsPayloadString, fileUploadTopicArn!);

    callback(null, "Success");
  } catch (error: any) {
    console.error("Error in S3 event handler:", error);
    callback(error);
  }
};
