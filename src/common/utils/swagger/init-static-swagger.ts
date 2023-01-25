import { createWriteStream } from 'fs';
import { get } from 'http';

import { Logger } from '@nestjs/common';

/**
 * get the swagger json file (if app is running in development mode)
 * if (process.env.NODE_ENV === 'development') {
 * write swagger ui files
 * @param {string} serverUrl - Базовой адрес сайта
 */
export const initStaticSwagger = (serverUrl: string) => {
  get(`${serverUrl}/swagger-ui-bundle.js`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
    Logger.log(
      `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`,
    );
  });

  get(`${serverUrl}/swagger-ui-init.js`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
    Logger.log(
      `Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`,
    );
  });

  get(`${serverUrl}/swagger-ui-standalone-preset.js`, function (response) {
    response.pipe(
      createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
    );
    Logger.log(
      `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`,
    );
  });

  get(`${serverUrl}/swagger-ui.css`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
    Logger.log(
      `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`,
    );
  });
};
