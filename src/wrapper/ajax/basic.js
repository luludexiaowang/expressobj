import axios from 'axios';
import Router from 'code-matrix';
import qs from 'qs';

export const ajaxRouter = new Router();

/* eslint-disable func-names,no-shadow */
ajaxRouter.use('/config/basic-param', function (next) {
  Object.assign(this.config, {
    timeout: 20000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  next();
});
ajaxRouter.use('/config/path-params', function (next) {
  if (this.config.pathParams != null) {
    this.config.url = this.config.url.replace(/:([a-zA-Z0-9\-_]+)/g, (a, b) => {
      if (this.config.pathParams[b]) {
        return this.config.pathParams[b];
      }
      return a;
    });
  }
  next();
});
ajaxRouter.use('/config/form-data', function (next) {
  if (this.config.data) {
    this.config.data = qs.stringify(this.config.data);
  }
  next();
});
ajaxRouter.use('/result/analysis', function (next) {
  const { result } = this;
  if (!(result instanceof Error)) {
    this.result = result.data;
  }
  next();
});
export default function ajax(config, whiteList = [], blackList = []) {
  return new Promise((resolve, reject) => {
    ajaxRouter.send({
      whiteList: ['/config'].concat(whiteList),
      blackList,
      config,
    })
      .then(context => {
        return new Promise((resolve) => {
          axios
            .request(context.config)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              resolve(error);
            });
        });
      })
      .then(result => {
        return ajaxRouter.send({
          whiteList: ['/result'].concat(whiteList),
          blackList,
          result,
        })
          .then((context) => {
            if (context.result instanceof Error) {
              reject(context.result);
            } else {
              resolve(context.result);
            }
          });
      });
  });
}
