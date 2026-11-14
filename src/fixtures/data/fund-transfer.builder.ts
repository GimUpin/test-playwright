import type { PartnerFundTransferRequest } from '../../models/api/bankgw/bankgw.models';
import { randomAmount, randomId } from '../../utils/data-generator';

export class FundTransferDataBuilder {
  private txnId = randomId('txn');
  private creditBankCode = 'TPBVVNVX';
  private creditAccountNumber = '01918362501';
  private creditAccountName = 'CUSTOMER AUTOMATION';
  private creditAccountType = 'ACCOUNT';
  private transferAmount = randomAmount(1_000, 100_000);
  private remark = 'Automation fund transfer';

  static create(): FundTransferDataBuilder {
    return new FundTransferDataBuilder();
  }

  withAmount(amount: number): this {
    this.transferAmount = amount;
    return this;
  }

  withBankCode(bankCode: string): this {
    this.creditBankCode = bankCode;
    return this;
  }

  withAccount(number: string, name: string): this {
    this.creditAccountNumber = number;
    this.creditAccountName = name;
    return this;
  }

  withTxnId(txnId: string): this {
    this.txnId = txnId;
    return this;
  }

  build(): PartnerFundTransferRequest {
    return {
      txn_id: this.txnId,
      credit_bank_code: this.creditBankCode,
      credit_account_number: this.creditAccountNumber,
      credit_account_name: this.creditAccountName,
      credit_account_type: this.creditAccountType,
      transfer_amount: this.transferAmount,
      remark: this.remark,
    };
  }
}
