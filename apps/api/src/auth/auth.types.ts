export type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio?: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};
