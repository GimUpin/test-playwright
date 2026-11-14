import { apiTest as test, expect } from '../../../src/core/fixtures';
import { validateSchema } from '../../../src/core/api/api-response';
import { PartnerFundTransferRequestSchema } from '../../../src/schemas/bankgw/bankgw.schema';
import { FundTransferDataBuilder } from '../../../src/fixtures/data/fund-transfer.builder';
import { buildSignedCoreHeaders } from '../../../src/core/auth/core-headers';
import { getBankGwBaseUrl } from '../../../src/core/config/environment';
import { buildCurlCommand, buildMaskedCurlCommand } from '../../../src/utils/curl-builder';
import { formatHttpDebugDump } from '../../../src/utils/http-debug-formatter';
import {
  BANKGW_API_SKIP_REASON,
  shouldRunBankGwApiTests,
} from '../../../src/utils/bankgw-test-guard';

test.describe('BankGW partner fund-transfer @api @bankgw', () => {
  test('partner fund-transfer payload schema is valid @smoke', () => {
    const payload = FundTransferDataBuilder.create().withAmount(1000).build();
    validateSchema(PartnerFundTransferRequestSchema, payload);
  });

  test('signed headers contain required HMAC fields @smoke', () => {
    const headers = buildSignedCoreHeaders();

    expect(headers['client-id']).toBeTruthy();
    expect(headers['client-trace-no']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(headers['client-request-time']).toMatch(/^\d+$/);
    expect(headers['client-signature']).toMatch(/^[a-f0-9]{64}$/i);
  });

  test('build curl + request dump for partner fund-transfer @smoke', async () => {
    const payload = FundTransferDataBuilder.create().withAmount(1000).build();
    const headers = buildSignedCoreHeaders();
    const url = `${getBankGwBaseUrl()}/v1.0/partner/fund-transfer`;

    const curlFull = buildCurlCommand({
      method: 'POST',
      url,
      headers,
      body: payload,
    });
    const curlMasked = buildMaskedCurlCommand({
      method: 'POST',
      url,
      headers,
      body: payload,
    });

    // Preview dump (no live response yet)
    const previewDump = formatHttpDebugDump({
      method: 'POST',
      url,
      requestHeaders: headers,
      requestBody: payload,
      maskSecrets: false,
    });

    expect(curlFull).toContain('curl --location --request POST');
    expect(curlFull).toContain('/v1.0/partner/fund-transfer');
    expect(previewDump).toContain('REQUEST');
    expect(previewDump).toContain('CURL');
    expect(curlMasked).toContain('***MASKED***');

    await test.info().attach('partner-fund-transfer.preview.full.txt', {
      body: Buffer.from(previewDump, 'utf8'),
      contentType: 'text/plain',
    });
    await test.info().attach('partner-fund-transfer.curl.txt', {
      body: Buffer.from(curlFull, 'utf8'),
      contentType: 'text/plain',
    });
    await test.info().attach('partner-fund-transfer.curl.masked.txt', {
      body: Buffer.from(curlMasked, 'utf8'),
      contentType: 'text/plain',
    });
  });

  test.describe('live PGW', () => {
    test.skip(!shouldRunBankGwApiTests(), BANKGW_API_SKIP_REASON);

    test('POST /v1.0/partner/fund-transfer', async ({ bankGwClient }) => {
      const payload = FundTransferDataBuilder.create().withAmount(50_000).build();
      const response = await bankGwClient.partnerFundTransfer(payload);

      expect(response.status).toBeLessThan(500);
      // Attachments already include status_code + request + response + curl
    });
  });
});
