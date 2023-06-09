export const createUser = async (id?: string, body?: unknown) => ({
  statusCode: 200,
  body: JSON.stringify({ id, body }),
});
