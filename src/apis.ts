/**
 * 支付宝 API 方法集合 - Deno 版本
 * 包含常用的支付宝开放平台 API 封装
 */

import type { AlipaySdk } from './alipay.ts';
import type { AlipayCommonResult, AmountParams, GoodsDetail, ExtendParams, SettleInfo, BusinessParams } from './types.ts';

/**
 * API 方法扩展类
 */
export class AlipayApis {
  constructor(private sdk: AlipaySdk) {}

  /**
   * alipay.trade.pay - 统一收单交易支付接口
   */
  async tradePay(params: {
    /** 商户订单号 */
    out_trade_no: string;
    /** 订单总金额 */
    total_amount: string;
    /** 订单标题 */
    subject: string;
    /** 商品详情 */
    goods_detail?: GoodsDetail[];
    /** 扩展参数 */
    extend_params?: ExtendParams;
    /** 业务扩展参数 */
    business_params?: BusinessParams;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.trade.pay', { bizContent: params });
  }

  /**
   * alipay.trade.precreate - 统一收单线下交易预创建
   */
  async tradePrecreate(params: {
    /** 商户订单号 */
    out_trade_no: string;
    /** 订单总金额 */
    total_amount: string;
    /** 订单标题 */
    subject: string;
    /** 商品详情 */
    goods_detail?: GoodsDetail[];
    /** 扩展参数 */
    extend_params?: ExtendParams;
    /** 结算信息 */
    settle_info?: SettleInfo;
    /** 业务扩展参数 */
    business_params?: BusinessParams;
    /** 订单包含的商品类目 */
    goods_type?: string;
    /** 超时时间 */
    timeout_express?: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.trade.precreate', { bizContent: params });
  }

  /**
   * alipay.trade.create - 统一收单交易创建接口
   */
  async tradeCreate(params: {
    /** 商户订单号 */
    out_trade_no: string;
    /** 订单总金额 */
    total_amount: string;
    /** 订单标题 */
    subject: string;
    /** 买家支付宝用户ID */
    buyer_id?: string;
    /** 买家支付宝账号 */
    buyer_logon_id?: string;
    /** 商品详情 */
    goods_detail?: GoodsDetail[];
    /** 扩展参数 */
    extend_params?: ExtendParams;
    /** 结算信息 */
    settle_info?: SettleInfo;
    /** 业务扩展参数 */
    business_params?: BusinessParams;
    /** 超时时间 */
    timeout_express?: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.trade.create', { bizContent: params });
  }

  /**
   * alipay.trade.query - 统一收单交易查询
   */
  async tradeQuery(params: {
    /** 商户订单号 */
    out_trade_no?: string;
    /** 支付宝交易号 */
    trade_no?: string;
    /** 查询选项 */
    query_options?: string[];
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    if (!params.out_trade_no && !params.trade_no) {
      throw new Error('out_trade_no 和 trade_no 不能同时为空');
    }
    return this.sdk.exec('alipay.trade.query', { bizContent: params });
  }

  /**
   * alipay.trade.cancel - 统一收单交易撤销接口
   */
  async tradeCancel(params: {
    /** 商户订单号 */
    out_trade_no?: string;
    /** 支付宝交易号 */
    trade_no?: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    if (!params.out_trade_no && !params.trade_no) {
      throw new Error('out_trade_no 和 trade_no 不能同时为空');
    }
    return this.sdk.exec('alipay.trade.cancel', { bizContent: params });
  }

  /**
   * alipay.trade.close - 统一收单交易关闭接口
   */
  async tradeClose(params: {
    /** 商户订单号 */
    out_trade_no?: string;
    /** 支付宝交易号 */
    trade_no?: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    if (!params.out_trade_no && !params.trade_no) {
      throw new Error('out_trade_no 和 trade_no 不能同时为空');
    }
    return this.sdk.exec('alipay.trade.close', { bizContent: params });
  }

  /**
   * alipay.trade.refund - 统一收单交易退款接口
   */
  async tradeRefund(params: {
    /** 商户订单号 */
    out_trade_no?: string;
    /** 支付宝交易号 */
    trade_no?: string;
    /** 退款金额 */
    refund_amount: string;
    /** 退款原因 */
    refund_reason?: string;
    /** 退款请求号 */
    out_request_no?: string;
    /** 退款包含的商品列表 */
    refund_goods_detail?: Array<{
      goods_id: string;
      alipay_goods_id?: string;
      goods_name: string;
      quantity: number;
      price: string;
    }>;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    if (!params.out_trade_no && !params.trade_no) {
      throw new Error('out_trade_no 和 trade_no 不能同时为空');
    }
    return this.sdk.exec('alipay.trade.refund', { bizContent: params });
  }

  /**
   * alipay.trade.fastpay.refund.query - 统一收单退款查询
   */
  async tradeRefundQuery(params: {
    /** 商户订单号 */
    out_trade_no?: string;
    /** 支付宝交易号 */
    trade_no?: string;
    /** 退款请求号 */
    out_request_no: string;
    /** 查询选项 */
    query_options?: string[];
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    if (!params.out_trade_no && !params.trade_no) {
      throw new Error('out_trade_no 和 trade_no 不能同时为空');
    }
    return this.sdk.exec('alipay.trade.fastpay.refund.query', { bizContent: params });
  }

  /**
   * alipay.trade.orderinfo.sync - 支付宝订单信息同步接口
   */
  async tradeOrderinfoSync(params: {
    /** 商户订单号 */
    out_trade_no?: string;
    /** 支付宝交易号 */
    trade_no?: string;
    /** 交易信息同步对应的业务类型 */
    biz_type: string;
    /** 订单信息同步内容 */
    order_biz_info?: Record<string, any>;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.trade.orderinfo.sync', { bizContent: params });
  }

  /**
   * alipay.data.dataservice.bill.downloadurl.query - 查询对账单下载地址
   */
  async dataBillDownloadUrlQuery(params: {
    /** 账单类型 */
    bill_type: 'trade' | 'signcustomer' | 'recon_trade_common';
    /** 账单时间 */
    bill_date: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.data.dataservice.bill.downloadurl.query', { bizContent: params });
  }

  /**
   * alipay.trade.settle - 统一收单交易结算接口
   */
  async tradeSettle(params: {
    /** 商户订单号 */
    out_trade_no?: string;
    /** 支付宝交易号 */
    trade_no?: string;
    /** 分账明细信息 */
    royalty_parameters: Array<{
      trans_out?: string;
      trans_out_type?: string;
      trans_in_type: string;
      trans_in: string;
      amount?: string;
      amount_percentage?: string;
      desc?: string;
    }>;
    /** 操作员ID */
    operator_id?: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.trade.settle', { bizContent: params });
  }

  /**
   * alipay.user.info.share - 支付宝会员授权信息查询接口
   */
  async userInfoShare(params: {
    /** 授权码 */
    auth_code?: string;
    /** 其他参数 */
    [key: string]: any;
  } = {}): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.user.info.share', { bizContent: params });
  }

  /**
   * alipay.system.oauth.token - 换取授权访问令牌
   */
  async systemOauthToken(params: {
    /** 授权码 */
    code?: string;
    /** 授权方式 */
    grant_type: 'authorization_code' | 'refresh_token';
    /** 刷新令牌 */
    refresh_token?: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.system.oauth.token', { bizContent: params });
  }

  /**
   * alipay.open.auth.token.app - 换取应用授权令牌
   */
  async openAuthTokenApp(params: {
    /** 授权码 */
    code: string;
    /** 授权方式 */
    grant_type: 'authorization_code' | 'refresh_token';
    /** 刷新令牌 */
    refresh_token?: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.open.auth.token.app', { bizContent: params });
  }

  /**
   * alipay.fund.trans.toaccount.transfer - 单笔转账到支付宝账户接口
   */
  async fundTransToaccountTransfer(params: {
    /** 商户转账唯一订单号 */
    out_biz_no: string;
    /** 收款方账户类型 */
    payee_type: 'ALIPAY_USERID' | 'ALIPAY_LOGONID';
    /** 收款方账户 */
    payee_account: string;
    /** 转账金额 */
    amount: string;
    /** 付款方姓名 */
    payer_show_name?: string;
    /** 收款方真实姓名 */
    payee_real_name?: string;
    /** 转账备注 */
    remark?: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.fund.trans.toaccount.transfer', { bizContent: params });
  }

  /**
   * alipay.fund.trans.common.query - 转账业务单据查询接口
   */
  async fundTransCommonQuery(params: {
    /** 商户转账唯一订单号 */
    out_biz_no?: string;
    /** 支付宝转账单据号 */
    order_id?: string;
    /** 付款方用户ID */
    pay_user_id?: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    if (!params.out_biz_no && !params.order_id) {
      throw new Error('out_biz_no 和 order_id 不能同时为空');
    }
    return this.sdk.exec('alipay.fund.trans.common.query', { bizContent: params });
  }

  /**
   * alipay.marketing.campaign.cash.create - 创建现金活动
   */
  async marketingCampaignCashCreate(params: {
    /** 现金红包活动名称 */
    coupon_name: string;
    /** 活动开始时间 */
    start_time: string;
    /** 活动结束时间 */
    end_time: string;
    /** 红包金额 */
    amount: string;
    /** 红包个数 */
    count: number;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.marketing.campaign.cash.create', { bizContent: params });
  }

  /**
   * alipay.pass.template.add - 卡券模板创建接口
   */
  async passTemplateAdd(params: {
    /** 模板内容 */
    tpl_content: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.pass.template.add', { bizContent: params });
  }

  /**
   * alipay.pass.instance.add - 卡券实例发放接口
   */
  async passInstanceAdd(params: {
    /** 模板ID */
    tpl_id: string;
    /** 卡券参数 */
    tpl_params: Record<string, any>;
    /** 识别码 */
    recognition_type?: string;
    /** 识别码值 */
    recognition_info?: string;
    /** 其他参数 */
    [key: string]: any;
  }): Promise<AlipayCommonResult> {
    return this.sdk.exec('alipay.pass.instance.add', { bizContent: params });
  }
}

export default AlipayApis;