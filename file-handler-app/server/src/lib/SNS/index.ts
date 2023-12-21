import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export default class SNSService {
  public readonly sns: SNSClient;
  private static instance: SNSService;

  private constructor() {
    this.sns = new SNSClient();
  }

  public static getInstance(): SNSService {
    if (!SNSService.instance) {
      SNSService.instance = new SNSService();
    }

    return SNSService.instance;
  }

  async publish(message: string, topicArn: string): Promise<void> {
    const params = {
      Message: message,
      TopicArn: topicArn,
    };

    const command = new PublishCommand(params);

    await this.sns.send(command);
  }
}
