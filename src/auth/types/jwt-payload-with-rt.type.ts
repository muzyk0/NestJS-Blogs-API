import { JwtRTPayload } from './jwtPayload.type';

export type JwtPayloadWithRt = JwtRTPayload & { refreshToken: string };
