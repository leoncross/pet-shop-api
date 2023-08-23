export class ProductRepository {
  client = {}
  getById = jest.fn()
  getByCategory = jest.fn()
  tableName = 'MockedTableName'

  constructor() {}
}
