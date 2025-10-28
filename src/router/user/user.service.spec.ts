import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import {
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { KeyCreator } from '@src/core/module';
import { IUserRepository } from '@src/database';
import { plainToInstance } from 'class-transformer';
import { mock, mockClear } from 'jest-mock-extended';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  const repository = mock<IUserRepository>();
  const dbUserPkCreator = mock<KeyCreator>();

  beforeEach(async () => {
    mockClear(repository);
    mockClear(dbUserPkCreator);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: RepositoryToken.USER_REPOSITORY, useValue: repository },
        { provide: KeyCreator, useValue: dbUserPkCreator },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    test('통과하는 테스트', async () => {
      const dto = plainToInstance(CreateUserDto, {
        walletAddress: '지갑주소',
        name: '이름',
        email: '이메일',
        contact: '연락처',
        birthDate: '2000/01/01',
      });
      const calledValue = {
        id: undefined,
        birthDate: new Date(2000, 0, 1),
        user: {
          contact: '연락처',
          email: '이메일',
          name: '이름',
          walletAddress: '지갑주소',
        },
      };
      const result = undefined;

      await expect(service.createUser(dto)).resolves.toEqual(result);
      expect(repository.createUser).toHaveBeenCalledWith(calledValue);
    });

    test('실패하는 테스트, 중복 회원 가입이면 DuplicatedDataError를 던짐', async () => {
      const dto = plainToInstance(CreateUserDto, {
        walletAddress: '지갑주소',
        name: '이름',
        email: '이메일',
        contact: '연락처',
        birthDate: '2000/01/01',
      });
      const error = new DuplicatedDataException('id');

      // 사용자 생성
      await expect(service.createUser(dto)).resolves.toEqual(undefined);
      expect(repository.createUser).toHaveBeenCalledTimes(1);
      repository.createUser.mockRejectedValue(error);

      // 사용자 중복생성
      await expect(service.createUser(dto)).rejects.toEqual(error);
      expect(repository.createUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('findUserNameByWalletAddress', () => {
    test('통과하는 테스트', async () => {
      const walletAddress = '지갑주소';
      const resolvedValue = { name: '이름' };
      repository.findNameByWalletAddress.mockResolvedValue(resolvedValue);

      await expect(
        service.findUserNameByWalletAddress(walletAddress),
      ).resolves.toEqual(resolvedValue);
      expect(repository.findNameByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
      );
    });

    test('실패하는 테스트, 존재하지 않는 사용자의 지갑주소로 조회하면 NotExistDataError를 던짐', async () => {
      const walletAddress = '존재하지 않는 지갑주소';
      const error = new NotExistDataException(walletAddress);
      repository.findNameByWalletAddress.mockRejectedValue(error);

      await expect(
        service.findUserNameByWalletAddress(walletAddress),
      ).rejects.toStrictEqual(error);
      expect(repository.findNameByWalletAddress).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserProfileImageIdByWalletAddress', () => {
    test('통과하는 테스트', async () => {
      const walletAddress = '지갑주소';
      const expectReturnValue = { imageId: '300' };
      repository.findProfileImageIdByWalletAddress.mockResolvedValue(
        expectReturnValue,
      );

      await expect(
        service.findUserProfileImageIdByWalletAddress(walletAddress),
      ).resolves.toEqual(expectReturnValue);
      expect(repository.findProfileImageIdByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
      );
    });

    test('실패하는 테스트, 존재하지 않는 사용자의 지갑주소로 조회하면 NotExistDataError를 던짐', async () => {
      const walletAddress = '존재하지 않는 지갑주소';
      const error = new NotExistDataException(walletAddress);
      repository.findProfileImageIdByWalletAddress.mockRejectedValue(error);

      await expect(
        service.findUserProfileImageIdByWalletAddress(walletAddress),
      ).rejects.toEqual(error);
    });
  });

  describe('updateUserProfileImageId', () => {
    test('통과하는 테스트', async () => {
      const dto = { walletAddress: '지갑주소', imageId: '100' };

      await service.updateUserProfileImageId(dto);

      expect(
        repository.updateUserProfileImageIdByWalletAddress,
      ).toHaveBeenCalledWith(dto);
    });

    test('실패하는 테스트, 존재하지 않는 사용자의 지갑주소로 프로필 이미지 아이디를 업데이트하면 NotExistDataError를 던짐', async () => {
      const dto = { walletAddress: '존재하지 않는 지갑주소', imageId: '100' };
      const error = new NotExistDataException(dto.walletAddress);
      repository.updateUserProfileImageIdByWalletAddress.mockRejectedValue(
        error,
      );

      await expect(service.updateUserProfileImageId(dto)).rejects.toEqual(
        error,
      );
    });
  });
});
