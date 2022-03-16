//Rotinas para requisições

import qs from 'qs';
import axios, { AxiosRequestConfig } from 'axios';

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
  return Promise.reject(error);
});