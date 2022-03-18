
const tokenKey = 'authData';

type loginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  userFirstName: string;
  userId: number;
};

/******** 
 * Salvando os dados de autenticação no Local Storage
 */

 export const saveAuthData = (obj: loginResponse) => {
  localStorage.setItem(tokenKey, JSON.stringify(obj));
};

/******** 
 * Obtendo os dados da autenticação
 */

export const getAuthData = () => {
  const str = localStorage.getItem(tokenKey) ?? '{}';
  const obj = JSON.parse(str) as loginResponse;
  return obj;
};

export const removeAuthData = () => {
  localStorage.removeItem(tokenKey);
}
