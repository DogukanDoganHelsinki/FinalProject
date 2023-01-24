import axios from 'axios'

export const createAuthorizationConfigFromToken = token => ({ headers: { 'Authorization': `Bearer ${token}` } })

let listenerId = 0
const TAGS_IN_APP = [
  
]

const listeners = {
    auth: new Map()
}


axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    const pathName = new URL(response.request.responseURL).pathname
    // console.log('pathName', pathName)
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if(error.response.status === 401){
        console.log("Unauthorized")
        Array.from(listeners.auth.values()).forEach(func => {
            console.log('running listeners')
            func()
        });
    }
    return Promise.reject(error);
});

function registerOnAuthError(func){
    listeners.auth.set(listenerId, func)
    return listenerId++
}

function unregisterOnAuthError(id){
    listeners.auth.delete(id)
}

export {registerOnAuthError, unregisterOnAuthError}