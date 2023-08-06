import { updateUser, UpdateUserInput } from '../../src/use-cases/updateUser'
import { UserRepository } from '@pet-shop-api/repositories'
import * as config from '../../config'
import { Context } from '../../types'
import { User } from '../../../../types/User'

describe('updateUser', () => {
  let userRepository: UserRepository
  let context: Context

  beforeEach(() => {
    userRepository = new UserRepository(config.get('dbTableName'))
    context = {
      logger: {},
      userRepository,
    }

    userRepository.get = jest.fn()
    userRepository.update = jest.fn()
  })

  it('should update an existing user', async () => {
    const existingUser: User = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: {
        street: '123 Street',
        city: 'City',
        state: 'State',
        postalCode: '12345',
        country: 'Country',
      },
    }

    const input: UpdateUserInput = {
      id: '123',
      firstName: 'John Updated',
    }

    userRepository.get = jest.fn().mockResolvedValue(existingUser)
    userRepository.update = jest.fn().mockResolvedValue({ ...existingUser, ...input })

    const res = await updateUser(input, context)

    expect(userRepository.get).toHaveBeenCalledWith(input.id)
    expect(userRepository.update).toHaveBeenCalledWith({
      ...input,
      ...existingUser,
    })
    expect(res).toEqual({ ...existingUser, ...input })
  })

  it('should return null for non-existing user', async () => {
    const input: UpdateUserInput = {
      id: '123',
      firstName: 'John Updated',
    }

    userRepository.get = jest.fn().mockResolvedValue(null)

    const res = await updateUser(input, context)

    expect(userRepository.get).toHaveBeenCalledWith(input.id)
    expect(userRepository.update).not.toHaveBeenCalled()
    expect(res).toBeNull()
  })

  it('should throw an error for invalid input', async () => {
    const input: Partial<UpdateUserInput> = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      address: {
        street: '123 Street',
        city: 'City',
        state: 'State',
        postalCode: '12345',
        country: 'Country',
      },
    }

    userRepository.get = jest.fn().mockResolvedValue(input)
    userRepository.update = jest.fn().mockRejectedValue(new Error())

    await expect(updateUser(input as UpdateUserInput, context)).rejects.toThrowError()
  })
})
