import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserRepository } from '@pet-shop-api/repositories'
import { PartialUser, User } from '../../../types/User'

const TABLE_NAME = 'pet-shop-test'

describe('UserRepository', () => {
  let userRepository: UserRepository
  let client: DynamoDBDocument

  beforeEach(() => {
    const dbClient = new DynamoDBClient({})
    client = DynamoDBDocument.from(dbClient)
    userRepository = new UserRepository(TABLE_NAME)
    userRepository.client = client
  })

  describe('create', () => {
    test('should create a new user', async () => {
      client.put = jest.fn().mockReturnValue(Promise.resolve({}))

      const user: User = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '000',
        email: 'john.doe@example.com',
        address: {
          street: '123 Street',
          city: 'City',
          state: 'State',
          postalCode: '12345',
          country: 'Country',
        },
      }

      const createdUser = await userRepository.create(user)

      expect(client.put).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        Item: {
          pk: 'USER#123',
          sk: 'USER#123',
          id: '123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '000',
          email: 'john.doe@example.com',
          address: {
            street: '123 Street',
            city: 'City',
            state: 'State',
            postalCode: '12345',
            country: 'Country',
          },
        },
      })
      expect(createdUser).toEqual(user)
    })
  })

  describe('get', () => {
    test('should retrieve an existing user', async () => {
      client.get = jest.fn().mockReturnValue(
        Promise.resolve({
          Item: {
            pk: 'USER#123',
            sk: 'USER#123',
            id: '123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            address: {
              street: '123 Street',
              city: 'City',
              state: 'State',
              postalCode: '12345',
              country: 'Country',
            },
          },
        }),
      )

      const userId = '123'
      const existingUser = await userRepository.get(userId)

      expect(client.get).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        Key: {
          pk: 'USER#123',
          sk: 'USER#123',
        },
      })
      expect(existingUser).toEqual({
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        address: {
          street: '123 Street',
          city: 'City',
          state: 'State',
          postalCode: '12345',
          country: 'Country',
        },
      })
    })

    test('should return null for a non-existing user', async () => {
      client.get = jest.fn().mockReturnValue(Promise.resolve({}))

      const userId = '123'
      const existingUser = await userRepository.get(userId)

      expect(client.get).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        Key: {
          pk: 'USER#123',
          sk: 'USER#123',
        },
      })
      expect(existingUser).toBeNull()
    })
  })

  describe('update', () => {
    test('should update an existing user', async () => {
      client.update = jest.fn().mockReturnValue(
        Promise.resolve({
          Attributes: {
            pk: 'USER#123',
            sk: 'USER#123',
            id: '123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            address: {
              street: 'Updated Street',
              city: 'Updated City',
              state: 'Updated State',
              postalCode: '54321',
              country: 'Updated Country',
            },
          },
        }),
      )

      const updatedUser: PartialUser = {
        id: '123',
        address: {
          street: 'Updated Street',
          city: 'Updated City',
          state: 'Updated State',
          postalCode: '54321',
          country: 'Updated Country',
        },
      }

      const result = await userRepository.update(updatedUser)

      expect(client.update).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        Key: {
          pk: 'USER#123',
          sk: 'USER#123',
        },
        ReturnValues: 'ALL_NEW',
      })
      expect(result).toEqual({
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        address: {
          street: 'Updated Street',
          city: 'Updated City',
          state: 'Updated State',
          postalCode: '54321',
          country: 'Updated Country',
        },
      })
    })
  })
})
