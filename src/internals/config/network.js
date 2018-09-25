// Axios config
import axios from 'axios'
import config from './public'

axios.defaults.baseURL = config.apiUrl // DD: Why is config undefined?
axios.defaults.headers.post['Content-Type'] = 'application/json'

// Intercept global error

axios.interceptors.response.use((response) => response, (error) => {
  const originalRequest = error.config
  if (error.response && error.response.status === 401 && !originalRequest._retry) { // if the error is 401 and hasnt already been retried
    // logout()
    return
    /*
     originalRequest._retry = true // now it can be retried
     return axios.post('/users/token', null).then((data) => {
     store.dispatch('authfalse')
     store.dispatch('authtruth', data.data)
     originalRequest.headers['Authorization'] = 'Bearer ' + store.state.token // new header new token
     return Vue.axios(originalRequest) // retry the request that errored out
     }).catch((error) => {
     for (let i = 0; i < error.response.data.errors.length; i++) {
     if (error.response.data.errors[i] === 'TOKEN-EXPIRED') {
     logout()
     return
     }
     }
     })
     */
  }

  if (error.response && error.response.status === 404 && !originalRequest._retry) {
    originalRequest._retry = true
    // window.location.href = '/'
    return
  }

  // Do something with response error
  const result = Promise.reject(error)
  if (result === undefined) {
    window.location.href = '/'
    return
  }

  return result
})
