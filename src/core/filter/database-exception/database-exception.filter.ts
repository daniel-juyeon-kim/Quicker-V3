import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CustomException } from '@src/core/module/exception/custom.exception';
import {
  BusinessRuleConflictDataException,
  DataBaseException,
  DuplicatedDataException,
  NotExistDataException,
} from '@src/database';

@Catch()
export class DatabaseExceptionFilter
  implements ExceptionFilter<CustomException>
{
  catch(exception: CustomException, host: ArgumentsHost) {
    if (exception instanceof DataBaseException) {
      this.catchDuplicateDataException(exception);
      this.catchNotExistDataException(exception);
      this.catchBusinessRuleConflictDataException(exception);
    }
  }

  private catchDuplicateDataException(exception: DataBaseException) {
    if (exception instanceof DuplicatedDataException) {
      throw new ConflictException(exception.message);
    }
  }

  private catchNotExistDataException(exception: DataBaseException) {
    if (exception instanceof NotExistDataException) {
      throw new NotFoundException(exception.message);
    }
  }

  private catchBusinessRuleConflictDataException(exception: DataBaseException) {
    if (exception instanceof BusinessRuleConflictDataException) {
      throw new UnprocessableEntityException(exception.message);
    }
  }
}
