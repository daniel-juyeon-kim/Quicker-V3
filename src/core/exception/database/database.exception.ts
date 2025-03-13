import { CustomException } from '../custom.exception';
import { ErrorDetail } from './error-detail';

export abstract class DataBaseException extends CustomException<ErrorDetail> {}
