type getUserById = {
  id?: string
};

const validate = (id?: string) => {
  if (!id) {
    throw new Error('INVALID');
  }
};

export const getUserById = async (id?: string) => {
  validate(id);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
};
