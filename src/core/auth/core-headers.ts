import { createHmac, randomUUID } from 'node:crypto';
import { getEnvironment } from '../config/environment';
import { logger } from '../../utils/logger';

/**
 * Builds signed PGW headers, equivalent to the Postman pre-request script:
 * stringToSign = clientId|traceNo|timestamp
 * signature = HMAC-SHA256(stringToSign, secretKey).hex
 *
 * Must be called per request (fresh UUID + timestamp).
 */
export function buildSignedCoreHeaders(): Record<string, string> {
  const env = getEnvironment();
  const clientId = env.CLIENT_ID;
  const secretKey = env.CLIENT_SECRET;

  if (!clientId || !secretKey) {
    throw new Error(
      'CLIENT_ID and CLIENT_SECRET are required to sign BankGW PGW requests. Fill config/environments/.env*',
    );
  }

  const traceNo = randomUUID();
  const timestamp = Math.floor(Date.now()).toString();
  const stringToSign = `${clientId}|${traceNo}|${timestamp}`;
  const signature = createHmac('sha256', secretKey).update(stringToSign, 'utf8').digest('hex');

  logger.debug('Generated BankGW signed headers', {
    clientId,
    traceNo,
    timestamp,
    stringToSign,
  });

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'client-id': clientId,
    'client-trace-no': traceNo,
    'client-request-time': timestamp,
    'client-signature': signature,
  };
}
