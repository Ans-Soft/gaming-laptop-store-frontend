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
};

export default urls;
export { BASE_URL };
