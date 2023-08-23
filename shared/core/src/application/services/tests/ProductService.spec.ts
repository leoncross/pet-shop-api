import { ProductService } from '../ProductService'
import { ProductRepository } from '../../../infra'
import { generateProduct } from '../../../tests/helpers'

jest.mock('../../../infra/repositories/ProductRepository')

describe('ProductService', () => {
  let productService: ProductService
  let mockProductRepository: jest.Mocked<ProductRepository>

  beforeEach(() => {
    mockProductRepository = new ProductRepository('table-name') as jest.Mocked<ProductRepository>
    productService = new ProductService({ productRepository: mockProductRepository })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getProductById', () => {
    it('should return a product for a given id', async () => {
      const mockProduct = generateProduct()

      mockProductRepository.getById.mockResolvedValue(mockProduct)

      const result = await productService.getProductById('1')

      expect(result).toEqual(mockProduct)
      expect(mockProductRepository.getById).toHaveBeenCalledWith('1')
    })

    it('should return null if product not found', async () => {
      mockProductRepository.getById.mockResolvedValue(null)

      const result = await productService.getProductById('2')

      expect(result).toBeNull()
      expect(mockProductRepository.getById).toHaveBeenCalledWith('2')
    })
  })

  describe('getProductsByCategory', () => {
    it('should return products for a given category', async () => {
      const toyProduct = generateProduct({ id: '1', name: 'Product 1', category: 'Toy' })

      mockProductRepository.getByCategory.mockResolvedValue([toyProduct])

      const result = await productService.getProductsByCategory('Toy')

      expect(result).toEqual([toyProduct])
      expect(mockProductRepository.getByCategory).toHaveBeenCalledWith('Toy')
    })

    it('should return an empty array if no products found for the category', async () => {
      mockProductRepository.getByCategory.mockResolvedValue([])

      const result = await productService.getProductsByCategory('Food')

      expect(result).toEqual([])
      expect(mockProductRepository.getByCategory).toHaveBeenCalledWith('Food')
    })
  })
})
