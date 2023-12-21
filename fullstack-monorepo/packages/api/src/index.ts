import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import { nanoid } from "nanoid";
import FileUpload from "./lib/aws-s3";
import DBClient from "./lib/dynamodb";
import { Workspace } from "types";

const app = express();
const port = 3456;

app.use(cors({ origin: "*" }));

app.get("/files", async (req: Request, res: Response, next: NextFunction) => {
  const dbClient = new DBClient();

  const response = await dbClient.getAll("files");

  if (response != null) {
    return res.status(200).json({
      files: response,
    });
  } else {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.get("/upload-url", async (request, response) => {
  const req = JSON.parse(request.body);
  const fileUpload = new FileUpload();

  if (req.file_name === undefined) {
    return response.status(400).json({
      error: "Missing file_name",
    });
  }

  const fileName = req.file_name;
  const contentType = req.content_type;
  const size = req.size;

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

  const dbResponse = await dbClient.create(payload, "files");

  if (dbResponse != null) {
    const fileUpload = new FileUpload();

    const url = await fileUpload.getSignedUrlForUpload(
      uniqueFileName,
      contentType,
      id
    );

    return response.status(200).json({
      url,
    });
  } else {
    return response.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.get("/workspaces", (request, response) => {
  const workspaces: Workspace[] = [
    { name: "api", version: "1.0.0" },
    { name: "types", version: "1.0.0" },
    { name: "web", version: "1.0.0" },
  ];
  response.json({ data: workspaces });
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
