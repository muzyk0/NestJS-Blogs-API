export type JwtPayload = {
  user: {
    id: string;
    login: string;
    email: string;
  };
  deviceId: string;
};

export interface DecodedJwtPayload extends JwtPayload {
  iat: Date;
  exp: Date;
}
