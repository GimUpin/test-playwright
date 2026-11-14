import { test as base } from '@playwright/test';
import { BankGwClient } from '../../clients/bankgw';

type ApiFixtures = {
  bankGwClient: BankGwClient;
};

export const apiTest = base.extend<ApiFixtures>({
  bankGwClient: async ({ request }, use) => {
    await use(new BankGwClient(request));
  },
});

export const expect = apiTest.expect;
