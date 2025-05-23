import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import {
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { mock } from 'jest-mock-extended';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserController } from './user.controller';
import { IUserService } from './user.service.interface';

describe('UsersController', () => {
  const service = mock<IUserService>();
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: ServiceToken.USER_SERVICE, useValue: service }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('createUser', () => {
    test('통과하는 테스트', async () => {
      const dto: CreateUserDto = {
        walletAddress: '문자열',
        name: '문자열',
        email: 'temp@gmail.com',
        contact: '01012341234',
        birthDate: new Date('1999/01/01'),
      };
      service.createUser.mockResolvedValue(undefined);

      await controller.createUser(dto);

      expect(service.createUser).toHaveBeenCalledTimes(1);
    });

    test('실패하는 테스트, 이미 동일한 지갑주소로 등록된 사용자가 있으면 DuplicatedDataError를 던짐', async () => {
      const dto: CreateUserDto = {
        walletAddress: '문자열',
        name: '문자열',
        email: 'temp@gmail.com',
        contact: '01012341234',
        birthDate: new Date('1999/01/01'),
      };

      const error = new DuplicatedDataException(dto.walletAddress);
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

    test('실패하는 테스트, 존재하지 않는 지갑주소로 조회하면 NotExistDataError를 던짐', async () => {
      const walletAddress = '0x123';
      const error = new NotExistDataException(walletAddress);
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
      const dto: UpdateUserDto = {
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
      const dto: UpdateUserDto = {
        imageId: 'image123',
      };
      const error = new NotExistDataException(dto.imageId);
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

    test('실패하는 테스트, 존재하지 않는 지갑주소는 NotExistDataError를 던짐', async () => {
      const walletAddress = '0x123';
      const error = new NotExistDataException(walletAddress);
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
