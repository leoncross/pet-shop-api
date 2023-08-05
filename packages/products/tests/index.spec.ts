import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import * as usecase from '../src/use-cases'
import { handler } from '../index'
import { generateProduct, generateProductId } from "./helpers";

jest.mock('../src/repositories/ProductRepository')
jest.mock('../src/use-cases')

const getProductByIdValidationSpy = jest.spyOn(usecase.validations, 'getProductById')
const getProductByIdSpy = jest.spyOn(usecase, 'getProductById')

const getProductByCategoryValidationSpy = jest.spyOn(usecase.validations, 'getProductByCategory')
const getProductByCategorySpy = jest.spyOn(usecase, 'getProductByCategory')

describe('userHandler', () => {
  const context = {} as Context
  const cb = () => {}

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 404 if path does not include /users', async () => {
    const event = {
      path: '/',
      httpMethod: 'GET',
    } as APIGatewayProxyEvent

    const result = (await handler(event, context, cb)) as APIGatewayProxyResult

    expect(result.statusCode).toBe(404)
  })

  it('handles GET method - GetProductById', async () => {
    const productId  = generateProductId()
    const event = {
      path: '/products',
      httpMethod: 'GET',
      pathParameters: { id: productId },
    } as Partial<APIGatewayProxyEvent> as APIGatewayProxyEvent

    const generatedProduct = generateProduct({ id: productId })
    getProductByIdValidationSpy.mockReturnValue({ id: productId })
    getProductByIdSpy.mockResolvedValue(generatedProduct)

    const result = (await handler(event, context, cb)) as APIGatewayProxyResult

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual(generatedProduct)
    expect(usecase.validations.getProductById).toHaveBeenCalledWith({ id: productId, })
    expect(usecase.getProductById).toHaveBeenCalledWith({ id: productId }, expect.anything())
  })

  it('handles GET method - GetProductByCategory', async () => {
    const event = {
      path: '/products',
      httpMethod: 'GET',
      queryStringParameters: { category: 'RopeToy' },
    } as Partial<APIGatewayProxyEvent> as APIGatewayProxyEvent

    const generatedProductOne = generateProduct({category: 'RopeToy'})
    const generatedProductTwo = generateProduct({category: 'RopeToy'})
    getProductByCategoryValidationSpy.mockReturnValue({ category: 'RopeToy' })
    getProductByCategorySpy.mockResolvedValue([generatedProductOne, generatedProductTwo])

    const result = (await handler(event, context, cb)) as APIGatewayProxyResult

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual([generatedProductOne, generatedProductTwo])
    expect(usecase.validations.getProductByCategory).toHaveBeenCalledWith({ category: 'RopeToy' })
    expect(usecase.getProductByCategory).toHaveBeenCalledWith({ category: 'RopeToy' }, expect.anything())
  })
})
