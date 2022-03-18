//Rotinas para requisições

import qs from 'qs';
import axios, { AxiosRequestConfig } from 'axios';
import history from './history';
import jwtDecode from 'jwt-decode';

type Role = 'ROLE_OPERATOR' | 'ROLE_ADMIN';

export type TokenData = {
  exp: number,
  user_name: string,
  authorities: Role[]
}

type loginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  userFirstName: string;
  userId: number;
};

export const BASE_URL =
  process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:8080';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID ?? 'dscatalog';
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET ?? 'dscatalog123';

const tokenKey = 'authData';

/******* Requisição de login

Para fazer a requisição de login, precisamos passar:
1- headers (cabeçalho)
2- body (corpo da requisição)

Aqui, criamos a const headers para conter os cabeçalhos necessários: 
Authorization e Content-Type (entre aspas devido ao -)

O body deve conter:
username, password, grant_type
Mas eles tem que ser convertidos em form-urlencoded com o qs

*/

type LoginData = {
  username: string;
  password: string;
};

export const requestBackendLogin = (loginData: LoginData) => {
  const headers = {
    Authorization: 'Basic ' + window.btoa(CLIENT_ID + ':' + CLIENT_SECRET),
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const data = qs.stringify({
    ...loginData,
    grant_type: 'password',
  });

  return axios({
    method: 'POST',
    baseURL: BASE_URL,
    url: '/oauth/token',
    data: data,
    headers: headers,
  });
};

export const requestBackend = (config: AxiosRequestConfig) => {
  const headers = config.withCredentials
    ? {
        ...config.headers,
        Authorization: 'Bearer ' + getAuthData().access_token,
      }
    : config.headers;
  return axios({ ...config, baseURL: BASE_URL, headers });
};

/******** Salvando os dados de autenticação no Local Storage
 *
 */

export const saveAuthData = (obj: loginResponse) => {
  localStorage.setItem(tokenKey, JSON.stringify(obj));
};

/******** Obtendo os dados da autenticação
 *
 */

export const getAuthData = () => {
  const str = localStorage.getItem(tokenKey) ?? '{}';
  const obj = JSON.parse(str) as loginResponse;
  return obj;
};

/******** Interceptors
 * 
 */


// Add a request interceptor
axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  
  // Verifica se houve retorno de acesso negado
  if (error.response.status === 401 || error.response.status === 403) {
    history.push('/admin/auth');
  }
  
  return Promise.reject(error);
});

export const getTokenData = () : TokenData | undefined => {
  try {
    return  jwtDecode(getAuthData().access_token) as TokenData;  
  } catch (error) {
    return undefined;
  } 
}

export const isAuthenticated = () : boolean => {
  const tokenData = getTokenData();
  return (tokenData && (tokenData?.exp * 1000 > Date.now())) ? true : false;
}

export const removeAuthData = () => {
  localStorage.removeItem(tokenKey);
}

export const hasAnyRoles = (roles: Role[]) : boolean => {

  if (roles.length === 0) {
    return true;
  }

  const tokenData = getTokenData();

  if (tokenData !== undefined) {
    for (var i=0; i < roles.length; i++) {
      if (tokenData.authorities.includes(roles[i])) {
        return true;
      }
    }
  }

  return false;  
}