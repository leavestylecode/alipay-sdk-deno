/**
 * 支付宝 SDK 类型定义 - Deno 版本
 * 基于原始 alipay-sdk-nodejs-all 项目改造
 */

export type AlipaySdkSignType = 'RSA2' | 'RSA';

/**
 * SDK 配置接口
 */
export interface AlipaySdkConfig {
  /** 应用ID */
  appId: string;
  /** 应用私钥字符串 */
  privateKey: string;
  /** 签名种类，默认是 RSA2 */
  signType?: AlipaySdkSignType;
  /** 支付宝公钥（需要对返回值做验签时候必填） */
  alipayPublicKey?: string;
  /** 网关地址，默认 https://openapi.alipay.com/gateway.do */
  gateway?: string;
  /** V3 endpoint, 默认 https://openapi.alipay.com */
  endpoint?: string;
  /** 网关超时时间（单位毫秒，默认 5000） */
  timeout?: number;
  /** 是否把网关返回的下划线 key 转换为驼峰写法，默认 true */
  camelcase?: boolean;
  /** 编码（只支持 utf-8） */
  charset?: 'utf-8';
  /** api 版本 */
  version?: '1.0';
  /**
   * 指定 private key 类型, 默认：PKCS8
   * - PKCS8: PRIVATE KEY
   * - PKCS1: RSA PRIVATE KEY
   */
  keyType?: 'PKCS1' | 'PKCS8';
  /** 应用公钥证书文件内容 */
  appCertContent?: string;
  /** 应用公钥证书sn */
  appCertSn?: string;
  /** 支付宝根证书文件内容 */
  alipayRootCertContent?: string;
  /** 支付宝根证书sn */
  alipayRootCertSn?: string;
  /** 支付宝公钥证书文件内容 */
  alipayPublicCertContent?: string;
  /** 支付宝公钥证书sn */
  alipayCertSn?: string;
  /** AES 密钥，调用 AES 加解密相关接口时需要 */
  encryptKey?: string;
  /** WebSocket 服务器地址 */
  wsServiceUrl?: string;
  /** Authorization 扩展信息 */
  additionalAuthInfo?: string;
}

/**
 * API 响应基础接口
 */
export interface AlipayCommonResult {
  /** 网关返回码 */
  code: string;
  /** 响应讯息。Success 表示成功。 */
  msg: string;
  /**
   * 明细错误码
   * @see https://opendocs.alipay.com/common/02km9f
   */
  sub_code?: string;
  /** 错误辅助信息 */
  sub_msg?: string;
  /** trace id */
  traceId?: string;
  /** 请求返回内容，详见各业务接口 */
  [key: string]: any;
}

/**
 * 请求参数接口
 */
export interface IRequestParams {
  [key: string]: any;
  /** 业务请求参数 */
  bizContent?: Record<string, any>;
  /** 自动 AES 加解密 */
  needEncrypt?: boolean;
}

/**
 * 页面执行方法类型
 */
export type IPageExecuteMethod = 'GET' | 'POST';

/**
 * 页面执行参数接口
 */
export interface IPageExecuteParams extends IRequestParams {
  method?: IPageExecuteMethod;
}

/**
 * SDK 执行选项
 */
export interface ISdkExecuteOptions {
  /**
   * 对 bizContent 做驼峰参数转为小写 + 下划线参数，如 outOrderNo => out_order_no，默认 true
   */
  bizContentAutoSnakeCase?: boolean;
}

/**
 * 请求选项接口
 */
export interface IRequestOption {
  /** 是否验证签名 */
  validateSign?: boolean;
  /** 日志接口 */
  log?: {
    info(...args: any[]): any;
    error(...args: any[]): any;
  };
  /** 表单数据 */
  formData?: FormData;
  /**
   * 请求的唯一标识
   * @see https://opendocs.alipay.com/open-v3/054oog?pathHash=7834d743#%E8%AF%B7%E6%B1%82%E7%9A%84%E5%94%AF%E4%B8%80%E6%A0%87%E8%AF%86
   */
  traceId?: string;
}

/**
 * 常用交易状态
 */
export enum TradeStatus {
  /** 交易创建，等待买家付款 */
  WAIT_BUYER_PAY = 'WAIT_BUYER_PAY',
  /** 未付款交易超时关闭，或支付完成后全额退款 */
  TRADE_CLOSED = 'TRADE_CLOSED',
  /** 交易支付成功 */
  TRADE_SUCCESS = 'TRADE_SUCCESS',
  /** 交易结束，不可退款 */
  TRADE_FINISHED = 'TRADE_FINISHED',
}

/**
 * 证书工具相关类型
 */
export interface CertificateInfo {
  /** 证书序列号 */
  serialNumber: string;
  /** 证书内容 */
  content: string;
  /** 证书有效期开始时间 */
  notBefore: Date;
  /** 证书有效期结束时间 */
  notAfter: Date;
  /** 签发者 */
  issuer: string;
  /** 主题 */
  subject: string;
}

/**
 * AES 加密配置
 */
export interface AESConfig {
  /** AES 密钥 */
  key: string;
  /** 加密模式，默认 CBC */
  mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB';
  /** 填充方式，默认 PKCS7 */
  padding?: 'PKCS7' | 'ISO10126' | 'ANSIX923' | 'NoPadding';
  /** 初始化向量 */
  iv?: string;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  /** 页码，从1开始 */
  page_num?: number;
  /** 每页数量，最大100 */
  page_size?: number;
}

/**
 * 时间范围参数
 */
export interface TimeRangeParams {
  /** 开始时间 */
  start_time?: string;
  /** 结束时间 */
  end_time?: string;
}

/**
 * 商户订单参数
 */
export interface MerchantOrderParams {
  /** 商户订单号 */
  out_trade_no?: string;
  /** 支付宝交易号 */
  trade_no?: string;
}

/**
 * 金额参数
 */
export interface AmountParams {
  /** 订单金额 */
  total_amount: string;
  /** 可打折金额 */
  discountable_amount?: string;
  /** 不可打折金额 */
  undiscountable_amount?: string;
}

/**
 * 商品详情
 */
export interface GoodsDetail {
  /** 商品的编号 */
  goods_id: string;
  /** 支付宝定义的统一商品编号 */
  alipay_goods_id?: string;
  /** 商品名称 */
  goods_name: string;
  /** 商品数量 */
  quantity: number;
  /** 商品单价，单位为元 */
  price: string;
  /** 商品类目 */
  goods_category?: string;
  /** 商品类目树，从商品类目根节点到叶子节点的完整路径 */
  categories_tree?: string;
  /** 商品描述信息 */
  body?: string;
  /** 商品的展示地址 */
  show_url?: string;
}

/**
 * 扩展信息
 */
export interface ExtendParams {
  /** 系统商编号 */
  sys_service_provider_id?: string;
  /** 花呗分期数 */
  hb_fq_num?: string;
  /** 花呗卖家手续费比例 */
  hb_fq_seller_percent?: string;
  /** 使用花呗分期要进行的分期数 */
  industry_reflux_info?: string;
  /** 卡类型 */
  card_type?: string;
  /** 特殊场景下，允许商户指定交易展示的卖家名称 */
  specified_seller_name?: string;
}

/**
 * 结算信息
 */
export interface SettleInfo {
  /** 结算详细信息 */
  settle_detail_infos: Array<{
    /** 结算收款方的账户类型 */
    trans_in_type: string;
    /** 结算收款方 */
    trans_in: string;
    /** 结算的金额 */
    amount: string;
  }>;
}

/**
 * 业务扩展参数
 */
export interface BusinessParams {
  /** 商户门店编号 */
  store_id?: string;
  /** 商户机具终端编号 */
  terminal_id?: string;
  /** 商户操作员编号 */
  operator_id?: string;
}