import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly config: ConfigService) {}

  getHello(host: string): string {
    const isDev = this.config.get('IS_DEV');

    return `<div>
              <h1>Hello World!</h1> 
              <h3>This service is currently working!</h3>
               
                  <p>Go to 
                    <a href="http${
                      isDev ? '' : 's'
                    }://${host}">swagger documentation</a>
                  </p>
            </div>`;
  }
}
