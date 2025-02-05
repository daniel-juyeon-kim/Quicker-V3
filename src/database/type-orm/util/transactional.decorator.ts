import { EntityManager } from 'typeorm';

export const Transactional = () => {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any) {
      const originalManager: EntityManager = this.manager;

      if (!originalManager) {
        throw new Error('manager가 정의되지 않았습니다.');
      }

      await originalManager.transaction(async (manager) => {
        await originalMethod.apply(this, args);
      });
    };
  };
};
