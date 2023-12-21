import serverless from "serverless-http";
import express, { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";
import cors from "cors";

import FileUpload from "./lib/AWSS3";
import DBClient from "./lib/DynamoDB";
import SNSClient from "./lib/SNS";

const app = express();

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({
    message: "Hello from data!",
  });
});

app.get("/files", async (req: Request, res: Response, next: NextFunction) => {
  const dbClient = new DBClient();

  const response = await dbClient.getAll("files");

  if (response != null) {
    const responseData = await Promise.all(
      response.map(async (file) => {
        // get url from s3 for download
        const fileUpload = new FileUpload();

        const signedUrl = await fileUpload.getSignedUrlForDownload(
          file.uniqueFileName,
          file.originalFileName
        );

        return {
          ...file,
          url: signedUrl,
        };
      })
    );

    return res.status(200).json({
      files: responseData,
    });
  } else {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.delete(
  "/file/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dbClient = new DBClient();
      const awsS3 = new FileUpload();

      const id = req.params.id;

      const fileData = await dbClient.get("files", "id", id);

      if (fileData == null) {
        return res.status(404).json({
          error: "File not found",
        });
      }

      const fileUpload = new FileUpload();

      await fileUpload.delete(fileData.uniqueFileName);

      await dbClient.delete("files", "id", id);

      await awsS3.delete(`${fileData.uniqueFileName}`);

      return res.status(200).json({
        message: "File deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

app.post(
  "/file/download",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dbClient = new DBClient();
      const request = JSON.parse(req.body);

      const file_id = request.file_id;

      const fileData = await dbClient.get("files", "id", file_id);

      // get signed url from s3 for download
      const fileUpload = new FileUpload();

      const url = await fileUpload.getSignedUrlForDownload(
        `${fileData!.id}/clean-result.csv`,
        fileData!.originalFileName
      );

      return res.status(200).json({
        url,
        name: fileData!.originalFileName,
      });
    } catch (err) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

app.post(
  "/get-url",
  async (req: Request, res: Response, next: NextFunction) => {
    const request = JSON.parse(req.body);
    if (request.file_name === undefined) {
      return res.status(400).json({
        error: "Missing file_name",
      });
    }

    const fileName = request.file_name;
    const contentType = request.content_type;
    const size = request.size;

    const uniqueFileName = `${nanoid()}-${fileName}`;

    const dbClient = new DBClient();

    const id = nanoid();
    const payload = {
      id: id,
      originalFileName: fileName,
      uniqueFileName: uniqueFileName,
      contentType: contentType,
      isUploaded: false,
      size,
      state: "pending",
    };

    const response = await dbClient.create(payload, "files");

    if (response != null) {
      const fileUpload = new FileUpload();

      const url = await fileUpload.getSignedUrlForUpload(
        uniqueFileName,
        contentType,
        id
      );

      return res.status(200).json({
        url,
      });
    } else {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);
