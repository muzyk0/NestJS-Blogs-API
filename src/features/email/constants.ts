import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

export const rabbitMQModule = ClientsModule.registerAsync([
  {
    name: 'MESSAGE_SENDER_SERVICE',
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => {
      console.warn(
        'RMQ_URLS',
        configService.get<string>('RMQ_URLS').split(', '),
      );
      return {
        transport: Transport.RMQ,
        options: {
          urls: configService.get<string>('RMQ_URLS').split(', '),
          queue: 'message_sender_queue',
          queueOptions: {
            durable: false,
          },
        },
      };
    },
    inject: [ConfigService],
  },
]);
