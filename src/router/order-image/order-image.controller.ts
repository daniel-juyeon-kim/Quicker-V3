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
import { ServiceToken, SUPPORT_IMAGE_EXT_REG_EXP } from '@src/core/constant';
import { CreateCompleteOrderImageDto } from './dto/create-order-complete-image.dto';
import { CreateOrderFailImageDto } from './dto/create-order-fail-image.dto';
import { IOrderCompleteImageService } from './order-complete-image/order-complete-image.service.interface';
import { IOrderFailImageService } from './order-fail-image/order-fail-image.service.interface';

@Controller('orders')
export class OrderImageController {
  constructor(
    @Inject(ServiceToken.ORDER_FAIL_IMAGE_SERVICE)
    private readonly orderFailImageService: IOrderFailImageService,
    @Inject(ServiceToken.ORDER_COMPLETE_IMAGE_SERVICE)
    private readonly orderCompleteImageService: IOrderCompleteImageService,
  ) {}

  @Get(':orderId/image/fail')
  getFailImage(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.orderFailImageService.findOrderFailImage(orderId);
  }

  @Post('image/fail')
  @UseInterceptors(FileInterceptor('image'))
  postFailImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: SUPPORT_IMAGE_EXT_REG_EXP })
        .build(),
    )
    file: Express.Multer.File,
    @Body() dto: CreateOrderFailImageDto,
  ) {
    return this.orderFailImageService.createFailImage({ file, ...dto });
  }

  @Get(':orderId/image/complete')
  getCompleteImageBuffer(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.orderCompleteImageService.findCompleteImageBuffer(orderId);
  }

  @Post('image/complete')
  @UseInterceptors(FileInterceptor('image'))
  postCompleteImageBuffer(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: SUPPORT_IMAGE_EXT_REG_EXP })
        .build(),
    )
    { buffer }: Express.Multer.File,
    @Body() { orderId }: CreateCompleteOrderImageDto,
  ) {
    return this.orderCompleteImageService.createCompleteImageBuffer({
      buffer,
      orderId,
    });
  }
}
