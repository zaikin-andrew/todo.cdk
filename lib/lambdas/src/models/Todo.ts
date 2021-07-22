import { DynamoEntity } from './dynamo-entity';
import { v4 as uuidv4 } from 'uuid';
export interface ITodo {
  id?: string;
  title: string;
  completed: boolean;
}

export class Todo extends DynamoEntity {
  constructor(db, tableName) {
    super(db, tableName);
  }

  async putItem(item: ITodo) {
    item.id = uuidv4();
    const params = {
      TableName: this.tableName,
      Item: item,
    };

    return this.db.put(params).promise();
  }

  async updateItem(itemId, completed) {
    const params = {
      TableName: this.tableName,
      Key: {
        id: itemId,
      },
      UpdateExpression: "set #st=:st",
      ExpressionAttributeNames: {
        "#st": "completed",
      },
      ExpressionAttributeValues: {
        ":st": completed,
      },
    };
    return await this.db.update(params).promise();
  }

  async getItem(id) {
    const params = {
      TableName: this.tableName,
      Key: {
        id,
      },
    };

    const result = await this.db.get(params).promise();
    return result.Item;
  }

  async deleteItem(id) {
    const params = {
      TableName: this.tableName,
      Key: {
        id,
      },
      ReturnValues: "ALL_OLD",
    };

    return await this.db.delete(params).promise();
  }
}
