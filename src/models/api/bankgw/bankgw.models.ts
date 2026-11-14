export interface PartnerFundTransferRequest {
  txn_id: string;
  credit_bank_code: string;
  credit_account_number: string;
  credit_account_name: string;
  credit_account_type: string;
  transfer_amount: number;
  remark?: string;
}
