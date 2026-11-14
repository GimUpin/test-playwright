import type { APIRequestContext } from '@playwright/test';
import { BaseClient } from '../../core/api/base.client';
import { buildSignedCoreHeaders } from '../../core/auth/core-headers';
import { getBankGwBaseUrl } from '../../core/config/environment';
import type { PartnerFundTransferRequest } from '../../models/api/bankgw/bankgw.models';

/**
 * BankGW partner APIs via PGW.
 * Only endpoint: POST /v1.0/partner/fund-transfer
 */
export class BankGwClient extends BaseClient {
  constructor(request: APIRequestContext) {
    super(request, getBankGwBaseUrl());
  }

  async partnerFundTransfer(payload: PartnerFundTransferRequest) {
    return this.post('/v1.0/partner/fund-transfer', payload, {
      // Fresh HMAC headers on every call (UUID + timestamp)
      headers: buildSignedCoreHeaders(),
    });
  }
}
