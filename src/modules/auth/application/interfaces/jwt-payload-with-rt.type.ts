import { JwtRTPayload } from './jwtPayload.type';

export interface JwtPayloadWithRt extends JwtRTPayload {
  refreshToken: string;
}
