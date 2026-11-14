import { z } from 'zod';

export const PartnerFundTransferRequestSchema = z.object({
  txn_id: z.string().min(1),
  credit_bank_code: z.string().min(1),
  credit_account_number: z.string().min(1),
  credit_account_name: z.string().min(1),
  credit_account_type: z.string().min(1),
  transfer_amount: z.number().positive(),
  remark: z.string().optional(),
});
