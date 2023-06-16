import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

class OrdersRepository {
  private readonly tableName: string
  private readonly client: DynamoDBClient

  constructor(tableName: string, region: string) {
    this.tableName = tableName
    this.client = new DynamoDBClient({ region })
  }

  async getById(id: string): Promise<any | null> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        id: { S: id },
      },
    })

    try {
      const response = await this.client.send(command)
      if (response.Item) {
        return this.unmarshall(response.Item)
      }
      return null
    } catch (error) {
      console.error('Error retrieving user:', error)
      throw error
    }
  }

  async create(user: any): Promise<any> {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.marshall(user),
    })

    try {
      await this.client.send(command)
      return user
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  private marshall(data: any): any {
    return marshall(data)
  }

  private unmarshall(data: any): any {
    return unmarshall(data)
  }
}

export { OrdersRepository }
