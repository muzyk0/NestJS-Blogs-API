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
          host: configService.get('MESSAGE_SENDER_HOST'),
          port: configService.get('MESSAGE_SENDER_PORT'),
        },
      };
    },
    inject: [ConfigService],
  },
]);
