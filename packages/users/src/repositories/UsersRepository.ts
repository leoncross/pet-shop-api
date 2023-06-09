import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamodbUser, User } from '../../../../types/User';

export class UserRepository {
  private client: DynamoDBDocument;

  private tableName: 'yourTableName' | undefined;

  constructor() {
    const dbClient = new DynamoDBClient({});
    this.client = DynamoDBDocument.from(dbClient);
  }

  private toDynamoDBUser(user: User): DynamodbUser {
    return {
      ...user,
      pk: `USER#${user.id}`,
      sk: `USER#${user.id}`,
    };
  }

  private fromDynamoDBUser(dynamodbUser: DynamodbUser): User {
    const { pk, sk, ...user } = dynamodbUser;
    return user;
  }

  async create(user: User): Promise<User> {
    const dynamodbUser = this.toDynamoDBUser(user);

    await this.client.put({
      TableName: this.tableName,
      Item: dynamodbUser,
    });

    return user;
  }

  async get(userId: string): Promise<User | null> {
    const result = await this.client.get({
      TableName: this.tableName,
      Key: {
        pk: `USER#${userId}`,
        sk: `USER#${userId}`,
      },
    });

    if (!result.Item) {
      return null;
    }

    return this.fromDynamoDBUser(result.Item as DynamodbUser);
  }

  async update(user: User): Promise<User> {
    const dynamodbUser = this.toDynamoDBUser(user);

    await this.client.put({
      TableName: this.tableName,
      Item: dynamodbUser,
    });

    return user;
  }
}
