/**
 * 支付宝 SDK for Deno
 * 
 * A comprehensive TypeScript SDK for Alipay Open Platform APIs,
 * fully compatible with Deno, Supabase Edge Functions, and other Deno runtimes.
 * 
 * @version 1.0.0
 * @author LeaveStyle Code
 * @license MIT
 */

// 主要类导出
export { AlipaySdk } from './src/alipay.ts';
export { AlipayApis } from './src/apis.ts';
export { CertUtils, CertificateManager } from './src/cert_utils.ts';

// 类型导出
export type {
  AlipaySdkConfig,
  AlipaySdkSignType,
  AlipayCommonResult,
  IRequestParams,
  IPageExecuteParams,
  IPageExecuteMethod,
  ISdkExecuteOptions,
  IRequestOption,
  TradeStatus,
  CertificateInfo,
  AESConfig,
  PaginationParams,
  TimeRangeParams,
  MerchantOrderParams,
  AmountParams,
  GoodsDetail,
  ExtendParams,
  SettleInfo,
  BusinessParams,
} from './src/types.ts';

// 工具函数导出
export {
  sign,
  verify,
  signatureV3,
  verifySignatureV3,
  aesEncrypt,
  aesDecrypt,
  aesEncryptText,
  aesDecryptText,
  snakeCaseKeys,
  camelCaseKeys,
  formatTimestamp,
  createRequestId,
  validateRequiredParams,
  checkResponseStatus,
  safeJsonParse,
  removeEmptyValues,
  generateOutTradeNo,
  formatAmount,
  importPrivateKey,
  importPublicKey,
  ALIPAY_ALGORITHM_MAPPING,
  HASH_ALGORITHM_MAPPING,
} from './src/utils.ts';

// 便捷的组合类
export class AlipaySDK extends AlipaySdk {
  public readonly apis: AlipayApis;
  
  constructor(config: AlipaySdkConfig) {
    super(config);
    this.apis = new AlipayApis(this);
  }
}

// 默认导出
export default AlipaySDK;