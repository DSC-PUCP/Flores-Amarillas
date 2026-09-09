import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFallbackAvatar = (fullName: string) => {
  const parts = fullName.trim().split(' ').filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts[parts.length - 1]?.charAt(0) ?? '';
  const initials = `${first}${last}`.trim();
  return initials || '?';
};

export class Result<T> {
  private readonly success: boolean;
  private readonly value?: T;
  private readonly error?: Error;

  private constructor(success: boolean, value?: T, error?: Error) {
    this.success = success;
    this.value = value;
    this.error = error;
  }

  static success<T>(value?: T): Result<T> {
    return new Result<T>(true, value);
  }

  static error<T>(error: Error): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  isSuccess(): boolean {
    return this.success;
  }

  isFailure(): boolean {
    return !this.isSuccess();
  }

  getValue(): T | undefined {
    return this.value;
  }

  getError(): Error | undefined {
    return this.error;
  }
}
