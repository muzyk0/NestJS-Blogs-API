import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

export const rabbitMQModule = ClientsModule.registerAsync([
  {
    name: 'MESSAGE_SENDER_SERVICE',
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => {
      return {
        transport: Transport.TCP,
        options: {
          // host: configService.get<string>('MESSAGE_SENDER_HOST'),
          host: '137.184.177.20',
          // host: '0.0.0.0',
          // port: Number(configService.get<string>('MESSAGE_SENDER_PORT')),
          // port: 443,
        },
      };
    },
    inject: [ConfigService],
  },
]);
