import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import { DuplicatedDataException, NotExistDataException } from '@src/database';
import { mock } from 'jest-mock-extended';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { UsersController } from './users.controller';
import { IUsersService } from './users.service.interface';

describe('UsersController', () => {
  const service = mock<IUsersService>();
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: ServiceToken.USER_SERVICE, useValue: service }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('createUser', () => {
    test('통과하는 테스트', async () => {
      const dto: CreateUsersDto = {
        walletAddress: '문자열',
        name: '문자열',
        email: 'temp@gmail.com',
        contact: '01012341234',
        birthDate: '1999/01/01',
      };
      service.createUser.mockResolvedValue(undefined);

      await controller.createUser(dto);

      expect(service.createUser).toHaveBeenCalledTimes(1);
    });

    test('실패하는 테스트, 이미 동일한 지갑주소로 등록된 사용자가 있으면 DuplicatedDataError를 던짐', async () => {
      const dto: CreateUsersDto = {
        walletAddress: '문자열',
        name: '문자열',
        email: 'temp@gmail.com',
        contact: '01012341234',
        birthDate: '1999/01/01',
      };
      const error = new DuplicatedDataException('이미 존재하는 데이터입니다.');
      service.createUser.mockRejectedValueOnce(error);

      await expect(controller.createUser(dto)).rejects.toStrictEqual(error);

      expect(service.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserName', () => {
    test('통과하는 테스트', async () => {
      const walletAddress = '0x123';
      const mockReturnData = { name: 'John Doe' };
      service.findUserNameByWalletAddress.mockResolvedValueOnce(mockReturnData);

      await expect(controller.findUserName(walletAddress)).resolves.toEqual(
        mockReturnData,
      );
      expect(service.findUserNameByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
      );
    });

    test('실패하는 테스트, 지갑주소로 조회하면 NotExistDataError를 던짐', async () => {
      const walletAddress = '0x123';
      const error = new NotExistDataException('데이터가 존재하지 않습니다.');
      service.findUserNameByWalletAddress.mockRejectedValueOnce(error);

      await expect(
        controller.findUserName(walletAddress),
      ).rejects.toStrictEqual(error);
      expect(service.findUserNameByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
      );
    });
  });

  describe('updateUserProfileImageId', () => {
    test('통과하는 테스트', async () => {
      const walletAddress = '0x123';
      const dto: UpdateUsersDto = {
        imageId: 'image123',
      };
      const resolvedValue = undefined;
      service.updateUserProfileImageId.mockResolvedValueOnce(resolvedValue);

      await expect(
        controller.updateUserProfileImageId(walletAddress, dto),
      ).resolves.toEqual(resolvedValue);
      expect(service.updateUserProfileImageId).toHaveBeenCalledWith({
        walletAddress,
        ...dto,
      });
    });

    test('실패하는 테스트, 존재하지 않는 지갑주소로 요청하면 NotExistDataError를 던짐', async () => {
      const walletAddress = '0x123';
      const dto: UpdateUsersDto = {
        imageId: 'image123',
      };
      const error = new NotExistDataException('유저가 존재하지 않습니다.');
      service.updateUserProfileImageId.mockRejectedValueOnce(error);

      await expect(
        controller.updateUserProfileImageId(walletAddress, dto),
      ).rejects.toStrictEqual(error);
      expect(service.updateUserProfileImageId).toHaveBeenCalledWith({
        walletAddress,
        ...dto,
      });
    });
  });

  describe('findUserProfileImageId', () => {
    test('통과하는 테스트', async () => {
      const walletAddress = '0x123';
      const mockResolvedValue = { imageId: 'image123' };
      service.findUserProfileImageIdByWalletAddress.mockResolvedValueOnce(
        mockResolvedValue,
      );

      await expect(
        controller.findUserProfileImageId(walletAddress),
      ).resolves.toEqual(mockResolvedValue);
      expect(
        service.findUserProfileImageIdByWalletAddress,
      ).toHaveBeenCalledWith(walletAddress);
    });

    test('실패하는 테스트, 존재하지  NotExistDataError를 던짐', async () => {
      const walletAddress = '0x123';
      const error = new NotExistDataException(
        '이미지 데이터가 존재하지 않습니다.',
      );
      service.findUserProfileImageIdByWalletAddress.mockRejectedValueOnce(
        error,
      );

      await expect(
        controller.findUserProfileImageId(walletAddress),
      ).rejects.toStrictEqual(error);
      expect(
        service.findUserProfileImageIdByWalletAddress,
      ).toHaveBeenCalledWith(walletAddress);
    });
  });
});
