import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import * as usecase from './src/usecases';

export const usersHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const {
      httpMethod,
      path,
      pathParameters,
      queryStringParameters,
      body,
    } = event;
    const { name } = queryStringParameters || {};
    const { userId } = pathParameters || {};

    if (!name) {}
    if (!path.includes('/users')) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' }),
      };
    }

    switch (httpMethod) {
      case 'GET':
        return await usecase.getUserById(userId);
      case 'POST':
        return await usecase.createUser(userId, body);
      case 'PUT':
        return await usecase.updateUser(userId, body);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Invalid request' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
