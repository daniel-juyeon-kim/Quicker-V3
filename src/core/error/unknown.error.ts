export abstract class UnknownError extends Error {
  constructor(public readonly unknownError: unknown) {
    super();
  }
}
