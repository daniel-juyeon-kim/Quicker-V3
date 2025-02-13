export interface IUserRepository {
  createUser(body: { id: string; user: User; birthDate: Date }): Promise<void>;
  updateUserProfileImageIdByWalletAddress(body: {
    imageId: string;
    walletAddress: string;
  }): Promise<void>;
  findNameByWalletAddress(walletAddress: string): Promise<{ name: string }>;
  findUserProfileImageIdByWalletAddress(
    walletAddress: string,
  ): Promise<{ imageId: string }>;
}

interface User {
  walletAddress: string;
  name: string;
  email: string;
  contact: string;
}
