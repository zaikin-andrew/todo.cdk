import { ScanInput } from 'aws-sdk/clients/dynamodb';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

export class DynamoEntity {
  protected db: DocumentClient;
  protected tableName: string;

  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  async getAll() {
    const params: ScanInput = {
      TableName: this.tableName,
      Limit: 100
    };

    const data = await this.db.scan(params).promise();
    return data.Items;
  }
}
