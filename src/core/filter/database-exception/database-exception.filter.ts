import {
  ArgumentsHost,
  Catch,
  ConflictException,
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
import { AbstractExceptionFilter } from '../abstract-exception.filter';

@Catch()
export class DatabaseExceptionFilter extends AbstractExceptionFilter<CustomException> {
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
