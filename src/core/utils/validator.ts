import { validate } from 'class-validator';

export * as Validator from 'class-validator';

export type DataValidator = typeof validate;

export { validate };
