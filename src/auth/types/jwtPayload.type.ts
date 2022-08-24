export type JwtPayload = {
  user: {
    id: string;
    login: string;
    email: string;
  };
};
