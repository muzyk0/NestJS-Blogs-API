import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly config: ConfigService) {}

  getHello(): string {
    return `<div>
              <h1>Hello World!</h1> 
              <h3>Please use prefix after main url. </h3>
               
                  <p>Example: 
                    <code>https://domain/${this.config.get(
                      'BASE_PREFIX',
                    )}</code>
                  </p>
            </div>`;
  }
}
