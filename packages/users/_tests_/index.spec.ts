import { APIGatewayProxyEvent, APIGatewayProxyResult, Context as APIGatewayContext } from 'aws-lambda';
import { usersHandler } from '../index';
import * as usecase from '../src/usecases';

describe('usersHandler', () => {
  const mockEvent = {
    httpMethod: '',
    path: '',
    pathParameters: {},
    body: '',
  } as APIGatewayProxyEvent;

  const mockContext = {} as APIGatewayContext;
  const mockCallback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 404 Not Found for unmatched path', async () => {
    mockEvent.path = '/unmatched';
    const response = await usersHandler(mockEvent, mockContext, mockCallback) as APIGatewayProxyResult;

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe(JSON.stringify({ message: 'Not Found' }));
  });

  test('should call usecase.getUserById when HTTP method is GET', async () => {
    mockEvent.httpMethod = 'GET';
    mockEvent.path = '/users/123';
    const mockUser = { id: '123', name: 'John Doe' };
    const mockError = new Error('Unhandled error');
    const spyGetUserById = jest.spyOn(usecase, 'getUserById').mockRejectedValue(mockError);

    const response = await usersHandler(mockEvent, mockContext, mockCallback) as APIGatewayProxyResult;

    expect(spyGetUserById).toHaveBeenCalledWith('123');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify(mockUser));
  });

  test('should call usecase.createUser when HTTP method is POST', async () => {
    mockEvent.httpMethod = 'POST';
    mockEvent.path = '/users';
    mockEvent.body = JSON.stringify({ name: 'Jane Doe' });
    const mockUser = { id: '456', name: 'Jane Doe' };
    const spyCreateUser = jest.spyOn(usecase, 'createUser').mockRejectedValue(mockUser);

    const response = await usersHandler(mockEvent, mockContext, mockCallback) as APIGatewayProxyResult;

    expect(spyCreateUser).toHaveBeenCalledWith({ name: 'Jane Doe' });
    expect(response.statusCode).toBe(201);
    expect(response.body).toBe(JSON.stringify(mockUser));
  });

  test('should call usecase.updateUser when HTTP method is PUT', async () => {
    mockEvent.httpMethod = 'PUT';
    mockEvent.path = '/users/789';
    mockEvent.body = JSON.stringify({ name: 'Updated User' });
    const mockUser = { statusCode: 200, body: 'Updated User' };
    const spyUpdateUser = jest.spyOn(usecase, 'updateUser').mockResolvedValue(mockUser);

    const response = await usersHandler(mockEvent, mockContext, mockCallback) as APIGatewayProxyResult;

    expect(spyUpdateUser).toHaveBeenCalledWith('789', { name: 'Updated User' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify(mockUser));
  });

  test('should return 400 Bad Request for invalid HTTP method', async () => {
    mockEvent.httpMethod = 'DELETE';
    mockEvent.path = '/users/123';
    const response = await usersHandler(mockEvent, mockContext, mockCallback) as APIGatewayProxyResult;

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(JSON.stringify({ message: 'Invalid request' }));
  });

  test('should return 500 Internal Server Error for unhandled error', async () => {
    mockEvent.httpMethod = 'GET';
    mockEvent.path = '/users/123';
    const mockError = new Error('Unhandled error');
    const spyGetUserById = jest.spyOn(usecase, 'getUserById').mockRejectedValue(mockError);

    const response = await usersHandler(mockEvent, mockContext, mockCallback) as APIGatewayProxyResult;

    expect(spyGetUserById).toHaveBeenCalledWith('123');
    expect(response.statusCode).toBe(500);
    expect(response.body).toBe(JSON.stringify({ message: 'Internal Server Error' }));
  });
});
