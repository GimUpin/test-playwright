import { randomBytes, randomInt, randomUUID } from 'node:crypto';

export function randomId(prefix = 'id'): string {
  return `${prefix}-${randomUUID()}`;
}

export function randomEmail(domain = 'example.test'): string {
  return `user.${randomBytes(4).toString('hex')}@${domain}`;
}

export function randomPhoneVn(): string {
  const prefixes = ['090', '091', '093', '097', '098'];
  const prefix = prefixes[randomInt(prefixes.length)];
  const suffix = String(randomInt(0, 10_000_000)).padStart(7, '0');
  return `${prefix}${suffix}`;
}

export function randomAmount(min = 10_000, max = 5_000_000): number {
  return randomInt(min, max + 1);
}

export function randomCurrency(): 'VND' | 'USD' | 'EUR' {
  const currencies = ['VND', 'USD', 'EUR'] as const;
  return currencies[randomInt(currencies.length)];
}

export function randomString(length = 12): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}
