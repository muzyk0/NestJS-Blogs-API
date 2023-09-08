export class UserMeQueryViewModel {
  userId: string;
  login: string;
  email: string;
}

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
    banReason: string | null;
  };
}

export class UserBloggerViewModel {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
}
