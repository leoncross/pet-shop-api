import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import * as config from "../../config";


describe("ProductRepository", () => {
  let productRepository: ProductRepository;
  let client: DynamoDBDocument;

  beforeEach(() => {
    const dbClient = new DynamoDBClient({});
    client = DynamoDBDocument.from(dbClient);
    productRepository = new ProductRepository();
    productRepository.client = client;
  });

  describe("getById", () => {
    it("should return product for a given id", async () => {
      client.get = jest.fn()
        .mockReturnValue(Promise.resolve({
          Item: {
            id: "123",
            pk: "PRODUCT#123",
            sk: "123",
            category: "toy",
            subcategory: "rope",
            name: "Rope Toy",
            slug: "rope-toy",
            colour: "red",
            description: "Durable pet rope toy",
            price: 19.99,
            quantityAvailable: 50,
            showAsAvailable: true,
            images: {
              main: "main.jpg",
              hover: "hover.jpg",
              other: ["other1.jpg", "other2.jpg"]
            }
          }
        }));

      const product = await productRepository.getById("123");

      expect(client.get)
        .toHaveBeenCalledWith({
          TableName: config.get("dbTableName"),
          Key: { pk: "PRODUCT#123" }
        });

      expect(product)
        .toEqual({
          id: "123",
          category: "toy",
          subcategory: "rope",
          name: "Rope Toy",
          slug: "rope-toy",
          colour: "red",
          description: "Durable pet rope toy",
          price: 19.99,
          quantityAvailable: 50,
          showAsAvailable: true,
          images: {
            main: "main.jpg",
            hover: "hover.jpg",
            other: ["other1.jpg", "other2.jpg"]
          }
        });
    });

    // continue with other tests...
  });
});
