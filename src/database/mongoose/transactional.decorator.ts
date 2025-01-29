import { Model } from 'mongoose';

export const Transactional = () => {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      validateModel(this.model);

      const session = await this.model.startSession();
      session.startTransaction();

      try {
        await originalMethod.apply(this, args);
        return await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    };
  };
};

const validateModel = (model: Model) => {
  if (!model) {
    throw new Error('model이 정의되지 않았습니다.');
  }
};
