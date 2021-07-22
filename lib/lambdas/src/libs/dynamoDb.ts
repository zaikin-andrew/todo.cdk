import { config, DynamoDB } from 'aws-sdk';

export function initDynamoDB() {
  const region = process.env.REGION;
  config.update({ region });
  return new DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
}
