import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import { DuplicatedDataError, NotExistDataError } from '@src/database';
import { mock } from 'jest-mock-extended';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserController } from './user.controller';
import { IUserService } from './user.service.interface';

describe('UserController 테스트', () => {
  const service = mock<IUserService>();
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: ServiceToken.USER_SERVICE, useValue: service }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('createUser 테스트', () => {
    test('성공하는 테스트', async () => {
      const dto: CreateUserDto = {
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

    test('실패하는 테스트, DuplicatedDataError 던짐', async () => {
      const dto: CreateUserDto = {
        walletAddress: '문자열',
        name: '문자열',
        email: 'temp@gmail.com',
        contact: '01012341234',
        birthDate: '1999/01/01',
      };
      const error = new DuplicatedDataError('이미 존재하는 데이터입니다.');
      service.createUser.mockRejectedValueOnce(error);

      await expect(controller.createUser(dto)).rejects.toStrictEqual(error);

      expect(service.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserName 테스트', () => {
    test('통과하는 테스트', async () => {
      const walletAddress = '0x123';
      const mockReturnData = { name: 'John Doe' };
      service.findUserNameByWalletAddress.mockResolvedValueOnce(mockReturnData);

      await expect(controller.getUserName(walletAddress)).resolves.toEqual(
        mockReturnData,
      );
      expect(service.findUserNameByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
      );
    });

    test('실패하는 테스트, 존재하지 않는 지갑주소일 경우 NotExistDataError를 호출해야 한다', async () => {
      const walletAddress = '0x123';
      const error = new NotExistDataError('데이터가 존재하지 않습니다.');
      service.findUserNameByWalletAddress.mockRejectedValueOnce(error);

      await expect(controller.getUserName(walletAddress)).rejects.toStrictEqual(
        error,
      );
      expect(service.findUserNameByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
      );
    });
  });

  describe('updateUserImageId 테스트', () => {
    test('통과하는 테스트', async () => {
      const dto: UpdateUserDto = {
        walletAddress: '0x123',
        imageId: 'image123',
      };
      const resolvedValue = undefined;
      service.updateUserImageId.mockResolvedValueOnce(resolvedValue);

      await expect(controller.updateUserImageId(dto)).resolves.toEqual(
        resolvedValue,
      );
      expect(service.updateUserImageId).toHaveBeenCalledWith(dto);
    });

    test('실패하는 테스트, 존재하지 않는 유저일 경우 NotExistDataError를 호출해야 한다', async () => {
      const dto: UpdateUserDto = {
        walletAddress: '0x123',
        imageId: 'image123',
      };
      const error = new NotExistDataError('유저가 존재하지 않습니다.');
      service.updateUserImageId.mockRejectedValueOnce(error);

      await expect(controller.updateUserImageId(dto)).rejects.toStrictEqual(
        error,
      );
      expect(service.updateUserImageId).toHaveBeenCalledWith(dto);
    });
  });

  describe('getUserImageId 테스트', () => {
    test('통과하는 테스트', async () => {
      const walletAddress = '0x123';
      const mockResolvedValue = { imageId: 'image123' };
      service.findUserImageId.mockResolvedValueOnce(mockResolvedValue);

      await expect(controller.getUserImageId(walletAddress)).resolves.toEqual(
        mockResolvedValue,
      );
      expect(service.findUserImageId).toHaveBeenCalledWith(walletAddress);
    });

    test('실패하는 테스트, 존재하지 않는 유저의 이미지일 경우 NotExistDataError를 호출해야 한다', async () => {
      const walletAddress = '0x123';
      const error = new NotExistDataError('이미지 데이터가 존재하지 않습니다.');
      service.findUserImageId.mockRejectedValueOnce(error);

      await expect(
        controller.getUserImageId(walletAddress),
      ).rejects.toStrictEqual(error);
      expect(service.findUserImageId).toHaveBeenCalledWith(walletAddress);
    });
  });
});
