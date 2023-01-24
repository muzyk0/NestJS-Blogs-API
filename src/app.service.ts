import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly config: ConfigService) {}

  getHello(host: string): string {
    return `<div>
              <h1>Hello World!</h1> 
              <h3>Please use prefix after main url. </h3>
               
                  <p>Example: 
                    <code>${host}/${this.config.get('BASE_PREFIX')}</code>
                  </p>
            </div>`;
  }

  healthCheck(): string {
    return `<div>
              <h1>This service is currently working!</h1> 
            </div>`;
  }
}
