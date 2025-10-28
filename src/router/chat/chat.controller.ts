import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ServiceToken } from '@src/core/constant';
import { ApiCommonBadRequestResponse } from '@src/core/response/dto/bad-request-response';
import { ApiCommonInternalServerErrorResponse } from '@src/core/response/dto/internal-server-error-response';
import { ApiCommonNotFoundResponse } from '@src/core/response/dto/not-found-response';
import { IChatService } from './chat.service.interface';
import { ChatMessageResponseDto } from './dto/chat-message.dto';

@Controller('chats')
export class ChatController {
  constructor(
    @Inject(ServiceToken.CHAT_SERVICE)
    private readonly chatService: IChatService,
  ) {}

  @Get(':orderId/recent')
  @ApiOperation({
    summary: '최근 메시지 조회',
    description: '주문 ID를 통해 해당 의뢰의 최근 채팅 메시지를 조회합니다.',
  })
  @ApiOkResponse({ type: ChatMessageResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async findRecentMessage(@Param('orderId', ParseIntPipe) orderId: number) {
    return await this.chatService.findRecentMessageByOrderId(orderId);
  }
}
