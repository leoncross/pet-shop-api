import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Address, DynamodbUser, PartialDynamodbUser, PartialUser, User } from '../../../../../types/User'

export class UserRepository {
  client: DynamoDBDocument

  private readonly tableName: string

  constructor(table: string) {
    this.tableName = table
    const dbClient = new DynamoDBClient({})
    this.client = DynamoDBDocument.from(dbClient)
  }

  async create(user: User): Promise<User> {
    const dynamodbUser = this.toDynamoDBUser(user)

    await this.client.put({
      TableName: this.tableName,
      Item: dynamodbUser,
    })

    return user
  }

  async get(userId: string): Promise<User | null> {
    const result = await this.client.get({
      TableName: this.tableName,
      Key: {
        pk: `USER#${userId}`,
        sk: `USER#${userId}`,
      },
    })

    if (!result.Item) {
      return null
    }

    return this.fromDynamoDBUser(result.Item as DynamodbUser)
  }

  async update(user: PartialUser): Promise<User> {
    const dynamodbUser = this.toDynamoDBUser(user)

    const updatedUser = await this.client.update({
      TableName: this.tableName,
      Key: {
        pk: dynamodbUser.pk,
        sk: dynamodbUser.sk,
      },
      ReturnValues: 'ALL_NEW',
    })

    return this.fromDynamoDBUser(updatedUser.Attributes as DynamodbUser)
  }

  private toDynamoDBUser(user: PartialUser): PartialDynamodbUser {
    const { address, ...restUser } = user

    const dynamodbUser: PartialDynamodbUser = {
      ...restUser,
      pk: `USER#${user.id}`,
      sk: `USER#${user.id}`,
    }

    if (address) {
      dynamodbUser.address = {
        ...(dynamodbUser.address as Partial<Address>),
        ...address,
      }
    }

    return dynamodbUser
  }

  private fromDynamoDBUser(dynamodbUser: DynamodbUser): User {
    const { pk, sk, ...user } = dynamodbUser
    return user
  }
}
