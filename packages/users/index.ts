import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
} from 'aws-lambda';
import * as usecase from './src/use-cases';
import { UserRepository } from './src/repositories/UserRepository';
import { Context } from './types';

const successResult = (value: unknown) => ({
  statusCode: 200,
  body: JSON.stringify(value),
});

export const userHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const {
      httpMethod,
      path,
      pathParameters = {},
      body,
    } = event;

    if (!path.includes('/users')) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' }),
      };
    }

    let requestBody = {};
    if (body) {
      requestBody = JSON.parse(body);
    }

    const context: Context = {
      logger: {},
      userRepository: new UserRepository(),
    };

    switch (httpMethod) {
      case 'GET': {
        const input = usecase.validations.getUserById({ id: pathParameters?.['id'] });
        const user = await usecase.getUserById(input, context);
        return successResult(user);
      }
      case 'POST': {
        const input = usecase.validations.createUser(requestBody);
        const user = await usecase.createUser(input, context);
        return successResult(user);
      }
      case 'PUT': {
        const input = usecase.validations.updateUser(pathParameters?.['id'], requestBody);
        const user = await usecase.updateUser(input, context);
        return successResult(user);
      }
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
