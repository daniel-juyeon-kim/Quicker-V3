import {
  ArgumentsHost,
  Catch,
  ConflictException,
  Inject,
  InternalServerErrorException,
  LoggerService,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import {
  BusinessRuleConflictDataException,
  DataBaseException,
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { CustomException } from '@src/core/exception/custom.exception';
import { UnknownDataBaseException } from '@src/core/exception/database/unknown-database.exception';
import { ErrorMessage } from '@src/core/module';
import { ErrorReportExceptionFilter } from '../abstract/abstract-exception.filter';
import { ExceptionTypes } from '../interface/exception-types';

@Catch()
export class DatabaseExceptionFilter extends ErrorReportExceptionFilter<CustomException> {
  constructor(
    @Inject(LoggerToken.UNKNOWN_DATABASE_EXCEPTION_LOGGER)
    protected readonly logger: LoggerService,
  ) {
    super();
  }

  async catch(exception: CustomException, host: ArgumentsHost) {
    if (exception instanceof DataBaseException) {
      this.catchDuplicateDataException(exception);
      this.catchNotExistDataException(exception);
      this.catchBusinessRuleConflictDataException(exception);
      await this.catchUnknownDataBaseException(exception);
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

  private async catchUnknownDataBaseException(exception: CustomException) {
    if (exception instanceof UnknownDataBaseException) {
      const date = new Date();

      await this.sendSlackMessage({ exception, date });
      this.logger.log(exception);

      throw new InternalServerErrorException();
    }
  }

  private async sendSlackMessage({
    date,
    exception,
  }: {
    date: Date;
    exception: ExceptionTypes;
  }) {
    try {
      const errorMessage = new ErrorMessage({ date, exception });

      await this.errorMessageBot.sendMessage(errorMessage);
    } catch (exception) {
      this.logger.log(exception);
    }
  }
}
