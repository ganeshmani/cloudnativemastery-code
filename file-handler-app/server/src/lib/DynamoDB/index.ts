import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export default class DBClient {
  public readonly dynamodb: DynamoDBClient;
  private static instance: DynamoDBClient | null = null;

  constructor() {
    if (!DBClient.instance) {
      this.dynamodb = new DynamoDBClient({
        region: process.env.AWS_REGION, // Specify your AWS region
      });
      DBClient.instance = this.dynamodb;
    } else {
      this.dynamodb = DBClient.instance;
    }
  }

  async create(payload: any, tableName: string) {
    const params = {
      TableName: tableName,
      Item: marshall(payload),
    };

    try {
      const command = new PutItemCommand(params);
      const response = await this.dynamodb.send(command);
      console.log(response);
      return unmarshall(params.Item);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async get(tableName: string, key: string, value: string) {
    const params = {
      TableName: tableName,
      Key: marshall({ [key]: value }),
    };

    try {
      const command = new GetItemCommand(params);
      const data = await this.dynamodb.send(command);

      if (data.Item == null) {
        return null;
      }

      return unmarshall(data.Item);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getAll(tableName: string) {
    const params = {
      TableName: tableName,
    };

    try {
      const command = new ScanCommand(params);
      const data = await this.dynamodb.send(command);

      if (data.Items == null) {
        return null;
      }

      return data.Items.map((item) => unmarshall(item));
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async update(payload: any, tableName: string) {
    const params = {
      TableName: tableName,
      Item: marshall(payload),
    };

    try {
      const command = new PutItemCommand(params);
      const response = await this.dynamodb.send(command);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async delete(tableName: string, key: string, value: string) {
    const params = {
      TableName: tableName,
      Key: marshall({ [key]: value }),
    };

    try {
      const command = new DeleteItemCommand(params);
      const response = await this.dynamodb.send(command);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
