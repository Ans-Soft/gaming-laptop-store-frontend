const BASE_URL = "http://127.0.0.1:8000";

const urls = {
  login: `${BASE_URL}/user/login/`,        
  refresh: `${BASE_URL}/user/token/refresh/`,

  usersList: `${BASE_URL}/user/list/`,
  usersRegister: `${BASE_URL}/user/register/`,
};

export default urls;
export { BASE_URL };
