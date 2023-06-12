import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import * as usecase from '../src/use-cases';
import { handler } from '../index';
import { generateUser, generateUserId } from './helpers';

jest.mock('../src/repositories/UserRepository');
jest.mock('../src/use-cases');

const getUserByIdValidationSpy = jest.spyOn(usecase.validations, 'getUserById');
const getUserByIdSpy = jest.spyOn(usecase, 'getUserById');
const createUserValidationSpy = jest.spyOn(usecase.validations, 'createUser');
const createUserSpy = jest.spyOn(usecase, 'createUser');
const updateUserValidationSpy = jest.spyOn(usecase.validations, 'updateUser');
const updateUserSpy = jest.spyOn(usecase, 'updateUser');

describe('userHandler', () => {
  const context = {} as Context;
  const cb = () => {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 if path does not include /users', async () => {
    const event = {
      path: '/',
      httpMethod: 'GET',
    } as APIGatewayProxyEvent;

    const result = (await handler(
      event,
      context,
      cb,
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(404);
  });

  it('handles GET method', async () => {
    const userId = generateUserId();
    const event = {
      path: '/users',
      httpMethod: 'GET',
      pathParameters: { id: userId },
    } as Partial<APIGatewayProxyEvent> as APIGatewayProxyEvent;

    const generatedUser = generateUser({ id: userId });
    getUserByIdValidationSpy.mockReturnValue({ id: userId });
    getUserByIdSpy.mockResolvedValue(generatedUser);

    const result = (await handler(
      event,
      context,
      cb,
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(generatedUser);
    expect(usecase.validations.getUserById).toHaveBeenCalledWith({
      id: userId,
    });
    expect(usecase.getUserById).toHaveBeenCalledWith(
      { id: userId },
      expect.anything(),
    );
  });

  it('handles POST method', async () => {
    const generatedUser = generateUser();

    const event = {
      path: '/users',
      httpMethod: 'POST',
      body: JSON.stringify(generatedUser),
    } as Partial<APIGatewayProxyEvent> as APIGatewayProxyEvent;

    createUserValidationSpy.mockReturnValue(generatedUser);
    createUserSpy.mockResolvedValue(generatedUser);

    const result = (await handler(
      event,
      context,
      cb,
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(generatedUser);
    expect(usecase.validations.createUser).toHaveBeenCalledWith(generatedUser);
    expect(usecase.createUser).toHaveBeenCalledWith(
      generatedUser,
      expect.anything(),
    );
  });

  it('handles PUT method', async () => {
    const userId = generateUserId();
    const generatedUser = generateUser({ id: userId });

    const event = {
      path: '/users',
      httpMethod: 'PUT',
      pathParameters: { id: userId },
      body: JSON.stringify(generatedUser),
    } as Partial<APIGatewayProxyEvent> as APIGatewayProxyEvent;

    updateUserValidationSpy.mockReturnValue(generatedUser);
    updateUserSpy.mockResolvedValue(generatedUser);

    const result = (await handler(
      event,
      context,
      cb,
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(generatedUser);
    expect(usecase.validations.updateUser).toHaveBeenCalledWith(
      userId,
      generatedUser,
    );
    expect(usecase.updateUser).toHaveBeenCalledWith(
      generatedUser,
      expect.anything(),
    );
  });
});
