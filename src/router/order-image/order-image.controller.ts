import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  HttpContentType,
  ServiceToken,
  SUPPORT_IMAGE_EXT_REG_EXP,
} from '@src/core/constant';
import { ApiCommonBadRequestResponse } from '@src/core/response/dto/bad-request-response';
import { ApiCommonConflictResponse } from '@src/core/response/dto/conflict-response';
import { ApiCommonCreatedResponse } from '@src/core/response/dto/created-response';
import { ApiCommonInternalServerErrorResponse } from '@src/core/response/dto/internal-server-error-response';
import { ApiCommonNotFoundResponse } from '@src/core/response/dto/not-found-response';
import { CreateFailDeliveryImageDto } from './dto/create-fail-image.dto';
import { FindCompleteDeliveryImageResponseDto } from './dto/find-complete-image.dto';
import { FindFailDeliveryImageResponseDto } from './dto/find-fail-image.dto';
import { IOrderCompleteImageService } from './service/order-complete-image/order-complete-image.service.interface';
import { IOrderFailImageService } from './service/order-fail-image/order-fail-image.service.interface';

@Controller('orders')
export class OrderImageController {
  constructor(
    @Inject(ServiceToken.ORDER_FAIL_IMAGE_SERVICE)
    private readonly orderFailImageService: IOrderFailImageService,
    @Inject(ServiceToken.ORDER_COMPLETE_IMAGE_SERVICE)
    private readonly orderCompleteImageService: IOrderCompleteImageService,
  ) {}

  @Get(':orderId/image/fail')
  @ApiOperation({
    summary: '배송 실패 이미지 및 사유 조회',
    description: '특정 주문에 대한 배송 실패 이미지와 사유를 조회합니다.',
  })
  @ApiOkResponse({ type: FindFailDeliveryImageResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async findFailImage(@Param('orderId', ParseIntPipe) orderId: number) {
    return await this.orderFailImageService.findOrderFailImageByOrderId(
      orderId,
    );
  }

  @Post(':orderId/image/fail')
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes(HttpContentType.MULTIPART_FORM_DATA)
  @ApiOperation({
    summary: '배송 실패 이미지 및 사유 저장',
    description: '특정 주문에 대한 배송 실패 사유와 이미지를 저장합니다.',
  })
  @ApiCommonCreatedResponse
  @ApiCommonBadRequestResponse
  @ApiCommonConflictResponse
  @ApiCommonInternalServerErrorResponse
  async createFailDeliveryImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: SUPPORT_IMAGE_EXT_REG_EXP })
        .build(),
    )
    { image }: CreateFailDeliveryImageDto['imageFile'],
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('reason') reason: CreateFailDeliveryImageDto['reason'],
  ) {
    await this.orderFailImageService.createFailImage({
      orderId,
      reason,
      image,
    });
  }

  @Get(':orderId/image/complete')
  @ApiOperation({
    summary: '배송 완료 이미지 조회',
    description: '특정 주문에 대한 배송 완료 이미지를 조회합니다.',
  })
  @ApiOkResponse({ type: FindCompleteDeliveryImageResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async findCompleteImageBuffer(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return await this.orderCompleteImageService.findCompleteImageBufferByOrderId(
      orderId,
    );
  }

  @Post(':orderId/image/complete')
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes(HttpContentType.MULTIPART_FORM_DATA)
  @ApiOperation({
    summary: '배송 완료 이미지 저장',
    description: '특정 주문에 대한 배송 완료 이미지를 저장합니다.',
  })
  @ApiCommonCreatedResponse
  @ApiCommonBadRequestResponse
  @ApiCommonConflictResponse
  @ApiCommonInternalServerErrorResponse
  async postCompleteImageBuffer(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: SUPPORT_IMAGE_EXT_REG_EXP })
        .build(),
    )
    image: Express.Multer.File['buffer'],
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    await this.orderCompleteImageService.createCompleteImageBuffer({
      image,
      orderId,
    });
  }
}
