import { Handler } from 'aws-lambda'

export const handler: Handler = async () => {
  try {
    // create by ID
    // get by ID

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello, World!' }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }
  }
}
