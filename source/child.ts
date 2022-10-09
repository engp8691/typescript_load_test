import axios, { AxiosRequestConfig } from 'axios'
import minimist from "minimist";
const argv = minimist(process.argv.slice(2));

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: { startTime: number, endTime: number };
  }
  export interface AxiosResponse {
    duration?: number
  }
}

(async () => {
  try {
    axios.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: new Date().getTime(), endTime: new Date().getTime() };
        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
    );
  } catch (error) {
    console.log(error)
  }  

  axios.interceptors.response.use(
    (response) => {
      if (response.config.metadata) {
        response.config.metadata.endTime = new Date().getTime();
        response.duration =
          response.config.metadata.endTime - response.config.metadata.startTime;
      }
      
      return response;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  axios
    .get(argv.url)
    .then((response) => {
      process.stdout.write((response.duration || '').toString());
      process.exitCode = 0;
    })
    .catch((error) => {
      console.log(error)
      process.exitCode = 1;
    });
})();
