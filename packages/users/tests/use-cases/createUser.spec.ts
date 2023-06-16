import { createUser, CreateUserInput } from '../../src/use-cases/createUser'
import { UserRepository } from '../../src/repositories/UserRepository'
import { Context } from '../../types'

describe('createUser', () => {
  let userRepository: UserRepository
  let context: Context

  beforeEach(() => {
    userRepository = new UserRepository()
    context = {
      logger: {},
      userRepository,
    }

    userRepository.create = jest.fn()
  })

  it('should create a new user', async () => {
    const input: CreateUserInput = {
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

    userRepository.create = jest.fn().mockResolvedValue({ ...input, id: input.email })

    const res = await createUser(input, context)

    expect(userRepository.create).toHaveBeenCalledWith({
      ...input,
      id: input.email,
    })
    expect(res).toEqual({ ...input, id: input.email })
  })

  it('should throw an error if an exception occurs', async () => {
    const invalidInput: Partial<CreateUserInput> = {
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
    userRepository.create = jest.fn().mockRejectedValue(new Error())

    await expect(createUser(invalidInput as CreateUserInput, context)).rejects.toThrowError()
  })
})
