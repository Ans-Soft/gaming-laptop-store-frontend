const BASE_URL = "http://127.0.0.1:8000";

const urls = {
  login: `${BASE_URL}/user/login/`,        
  refresh: `${BASE_URL}/user/token/refresh/`,

  usersList: `${BASE_URL}/user/list/`,
  usersRegister: `${BASE_URL}/user/register/`,
  userUpdate: `${BASE_URL}/user/update/`,
  userActivate: `${BASE_URL}/user/activate/`,
  userDeactivate: `${BASE_URL}/user/deactivate/`,

  brandsList: `${BASE_URL}/products/brands/list/`,
  brandsCreate: `${BASE_URL}/products/brands/create/`,
  brandUpdate: `${BASE_URL}/products/brands/update/`,
  brandActivate: `${BASE_URL}/products/brands/activate/`,
  brandDeactivate: `${BASE_URL}/products/brands/deactivate/`,

   // BASE PRODUCTS
  baseProductsList: `${BASE_URL}/products/base-products/list/`,
  baseProductCreate: `${BASE_URL}/products/base-products/create/`,
  baseProductUpdate: `${BASE_URL}/products/base-products/update/`,
  baseProductActivate: `${BASE_URL}/products/base-products/activate/`,
  baseProductDeactivate: `${BASE_URL}/products/base-products/deactivate/`,


  // PRODUCT VARIANTS
  productVariantsList: `${BASE_URL}/products/variants/list/`,
  productVariantCreate: `${BASE_URL}/products/variants/create/`,
  productVariantUpdate: `${BASE_URL}/products/variants/update/`,
  productVariantActivate: `${BASE_URL}/products/variants/activate/`,
  productVariantDeactivate: `${BASE_URL}/products/variants/deactivate/`,
  productVariantPublish: `${BASE_URL}/products/variants/publish/`,
  productVariantUnpublish: `${BASE_URL}/products/variants/unpublish/`,

  // CATEGORIES 
  categoriesList: `${BASE_URL}/products/categories/list/`,
  categoryCreate: `${BASE_URL}/products/categories/create/`,
  categoryUpdate: `${BASE_URL}/products/categories/update/`,
  categoryActivate: `${BASE_URL}/products/categories/activate/`,
  categoryDeactivate: `${BASE_URL}/products/categories/deactivate/`,
  
};

export default urls;
export { BASE_URL };
