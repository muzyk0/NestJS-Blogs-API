import { JwtATPayload } from './jwtPayload.type';

export type JwtPayloadWithRt = JwtATPayload & { refreshToken: string };
