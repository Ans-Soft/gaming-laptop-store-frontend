import Api from "./Api" 

export const getCatalogProducts = async () => {
  const response = await Api.get("/products/", {
    params: {
      is_published: true,
    },
  });
  return response.data;
};
