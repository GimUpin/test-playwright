import { getEnvironment } from '../core/config/environment';

export function shouldRunBankGwApiTests(): boolean {
  return getEnvironment().RUN_BANKGW_API_TESTS;
}

export const BANKGW_API_SKIP_REASON =
  'Set RUN_BANKGW_API_TESTS=true and ensure CLIENT_ID/CLIENT_SECRET are set to run live partner fund-transfer.';
