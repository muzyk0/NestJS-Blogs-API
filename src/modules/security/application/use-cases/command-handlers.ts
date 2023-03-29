import { RemoveAllDevicesWithoutMyDeviceHandler } from './remove-all-devices-without-my-device.handler';
import { RemoveSessionDeviceHandler } from './remove-session-device.handler';

export const CommandHandlers = [
  RemoveSessionDeviceHandler,
  RemoveAllDevicesWithoutMyDeviceHandler,
];
