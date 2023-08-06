import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamodbProduct, Product } from '../../../types/Product'

export class ProductRepository {
  client: DynamoDBDocument

  private readonly tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
    const dbClient = new DynamoDBClient({})
    this.client = DynamoDBDocument.from(dbClient)
  }

  private fromDynamoDBProduct(dynamodbProduct: DynamodbProduct): Product {
    const { pk, sk, ...product } = dynamodbProduct
    return product
  }

  async getById(id: string): Promise<Product | null> {
    const result = await this.client.get({
      TableName: this.tableName,
      Key: {
        pk: `PRODUCT#${id}`,
      },
    })

    if (!result.Item) {
      return null
    }

    return this.fromDynamoDBProduct(result.Item as DynamodbProduct)
  }

  async getByCategory(category: string): Promise<Product[]> {
    const result = await this.client.query({
      TableName: this.tableName,
      KeyConditionExpression: 'sk = :sk',
      ExpressionAttributeValues: {
        ':sk': `CATEGORY#${category}`,
      },
    })

    if (!result.Items || result.Items.length === 0) {
      return []
    }

    return result.Items.map((item) => this.fromDynamoDBProduct(item as DynamodbProduct))
  }
}
