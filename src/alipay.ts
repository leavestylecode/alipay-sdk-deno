/**
 * 支付宝 SDK 主类 - Deno 版本
 * 基于原始 alipay-sdk-nodejs-all 项目改造
 */

import type {
  AlipaySdkConfig,
  AlipayCommonResult,
  IRequestParams,
  IPageExecuteParams,
  ISdkExecuteOptions,
  IRequestOption,
  IPageExecuteMethod,
} from './types.ts';

import {
  sign,
  verify,
  signatureV3,
  verifySignatureV3,
  aesEncrypt,
  aesDecrypt,
  snakeCaseKeys,
  camelCaseKeys,
  formatTimestamp,
  createRequestId,
  validateRequiredParams,
  checkResponseStatus,
  safeJsonParse,
  removeEmptyValues,
} from './utils.ts';

import { CertUtils } from './cert_utils.ts';

/**
 * 支付宝 SDK 核心类
 */
export class AlipaySdk {
  private readonly config: Required<AlipaySdkConfig>;
  private readonly certUtils: typeof CertUtils;

  constructor(config: AlipaySdkConfig) {
    // 设置默认配置
    this.config = {
      appId: config.appId,
      privateKey: config.privateKey,
      signType: config.signType || 'RSA2',
      alipayPublicKey: config.alipayPublicKey || '',
      gateway: config.gateway || 'https://openapi.alipay.com/gateway.do',
      endpoint: config.endpoint || 'https://openapi.alipay.com',
      timeout: config.timeout || 5000,
      camelcase: config.camelcase !== false,
      charset: config.charset || 'utf-8',
      version: config.version || '1.0',
      keyType: config.keyType || 'PKCS8',
      appCertContent: config.appCertContent || '',
      appCertSn: config.appCertSn || '',
      alipayRootCertContent: config.alipayRootCertContent || '',
      alipayRootCertSn: config.alipayRootCertSn || '',
      alipayPublicCertContent: config.alipayPublicCertContent || '',
      alipayCertSn: config.alipayCertSn || '',
      encryptKey: config.encryptKey || '',
      wsServiceUrl: config.wsServiceUrl || '',
      additionalAuthInfo: config.additionalAuthInfo || '',
    };

    this.certUtils = CertUtils;
    
    // 初始化证书序列号
    this.initializeCertSn();
  }

  /**
   * 初始化证书序列号
   */
  private initializeCertSn(): void {
    try {
      if (this.config.appCertContent && !this.config.appCertSn) {
        this.config.appCertSn = this.certUtils.getCertSerialNumber(this.config.appCertContent);
      }
      
      if (this.config.alipayPublicCertContent && !this.config.alipayCertSn) {
        this.config.alipayCertSn = this.certUtils.getCertSerialNumber(this.config.alipayPublicCertContent);
      }
      
      if (this.config.alipayRootCertContent && !this.config.alipayRootCertSn) {
        this.config.alipayRootCertSn = this.certUtils.getCertSerialNumber(this.config.alipayRootCertContent);
      }
    } catch (error) {
      console.warn('证书序列号初始化失败:', error.message);
    }
  }

  /**
   * 执行 API 请求
   */
  async exec(
    method: string,
    params: IRequestParams = {},
    options: ISdkExecuteOptions = {}
  ): Promise<AlipayCommonResult> {
    const requestParams = this.buildRequestParams(method, params, options);
    const requestUrl = this.buildRequestUrl(requestParams);
    
    try {
      const response = await this.makeRequest(requestUrl, requestParams);
      return this.parseResponse(response, method);
    } catch (error) {
      throw new Error(`API 请求失败: ${error.message}`);
    }
  }

  /**
   * 生成页面跳转数据
   */
  pageExec(
    method: string,
    params: IPageExecuteParams = {},
    options: ISdkExecuteOptions = {}
  ): string {
    const requestParams = this.buildRequestParams(method, params, options);
    const httpMethod = params.method || 'POST';
    
    if (httpMethod === 'GET') {
      return this.buildRequestUrl(requestParams);
    }
    
    // POST 方法返回表单 HTML
    return this.buildFormHtml(requestParams, this.config.gateway);
  }

  /**
   * 验证异步通知签名
   */
  async checkNotifySign(params: Record<string, string>): Promise<boolean> {
    const sign = params.sign;
    const signType = params.sign_type || this.config.signType;
    
    if (!sign) {
      return false;
    }
    
    // 构建待验签字符串
    const signParams = { ...params };
    delete signParams.sign;
    delete signParams.sign_type;
    
    const signContent = this.buildSignContent(signParams);
    
    // 选择公钥
    let publicKey = this.config.alipayPublicKey;
    if (this.config.alipayPublicCertContent) {
      publicKey = this.certUtils.extractPublicKeyFromCert(this.config.alipayPublicCertContent);
    }
    
    if (!publicKey) {
      throw new Error('支付宝公钥未配置');
    }
    
    return await verify(signContent, sign, publicKey, signType as any);
  }

  /**
   * 构建请求参数
   */
  private buildRequestParams(
    method: string,
    params: IRequestParams,
    options: ISdkExecuteOptions
  ): Record<string, string> {
    const { bizContent, needEncrypt, ...otherParams } = params;
    
    // 基础参数
    const requestParams: Record<string, string> = {
      app_id: this.config.appId,
      method,
      charset: this.config.charset,
      sign_type: this.config.signType,
      timestamp: formatTimestamp(),
      version: this.config.version,
      ...otherParams,
    };
    
    // 业务参数处理
    if (bizContent) {
      let content = bizContent;
      
      // 驼峰转下划线
      if (options.bizContentAutoSnakeCase !== false) {
        content = snakeCaseKeys(bizContent);
      }
      
      // AES 加密
      if (needEncrypt && this.config.encryptKey) {
        requestParams.encrypt_type = 'AES';
        requestParams.biz_content_encrypt = await aesEncrypt(content, this.config.encryptKey);
      } else {
        requestParams.biz_content = JSON.stringify(content);
      }
    }
    
    // 证书相关参数
    if (this.config.appCertSn) {
      requestParams.app_cert_sn = this.config.appCertSn;
    }
    
    if (this.config.alipayCertSn) {
      requestParams.alipay_cert_sn = this.config.alipayCertSn;
    }
    
    // 移除空值
    const cleanParams = removeEmptyValues(requestParams);
    
    // 生成签名
    const signContent = this.buildSignContent(cleanParams);
    cleanParams.sign = await sign(
      signContent,
      this.config.privateKey,
      this.config.signType,
      this.config.keyType
    );
    
    return cleanParams;
  }

  /**
   * 构建签名内容
   */
  private buildSignContent(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    return sortedKeys
      .filter(key => params[key] && key !== 'sign')
      .map(key => `${key}=${params[key]}`)
      .join('&');
  }

  /**
   * 构建请求 URL
   */
  private buildRequestUrl(params: Record<string, string>): string {
    const url = new URL(this.config.gateway);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  /**
   * 生成表单 HTML
   */
  private buildFormHtml(params: Record<string, string>, action: string): string {
    const formId = `alipay_form_${Date.now()}`;
    
    const inputs = Object.entries(params)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value.replace(/"/g, '&quot;')}" />`)
      .join('');
    
    return `
      <form id="${formId}" action="${action}" method="post" style="display:none;">
        ${inputs}
      </form>
      <script>
        document.getElementById("${formId}").submit();
      </script>
    `;
  }

  /**
   * 发送请求
   */
  private async makeRequest(url: string, params: Record<string, string>): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'alipay-sdk-deno/1.0.0',
        },
        body: new URLSearchParams(params),
        signal: controller.signal,
      });
      
      checkResponseStatus(response);
      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 解析响应
   */
  private async parseResponse(responseText: string, method: string): Promise<AlipayCommonResult> {
    const responseKey = method.replace(/\\./g, '_') + '_response';
    const errorResponseKey = 'error_response';
    
    const responseData = safeJsonParse(responseText, {});
    
    let result: AlipayCommonResult;
    
    if (responseData[responseKey]) {
      result = responseData[responseKey];
    } else if (responseData[errorResponseKey]) {
      result = responseData[errorResponseKey];
    } else {
      throw new Error('无效的响应格式');
    }
    
    // AES 解密
    if (result.code === '10000' && responseData.encrypt_type === 'AES' && this.config.encryptKey) {
      try {
        const decryptedData = await aesDecrypt(result.biz_content, this.config.encryptKey);
        result = { ...result, ...decryptedData };
      } catch (error) {
        console.warn('AES 解密失败:', error.message);
      }
    }
    
    // 驼峰转换
    if (this.config.camelcase) {
      result = camelCaseKeys(result);
    }
    
    return result;
  }

  /**
   * V3 API 请求
   */
  async requestV3(
    pathname: string,
    method: string = 'POST',
    params: URLSearchParams = new URLSearchParams(),
    requestBody: string = '',
    options: IRequestOption = {}
  ): Promise<AlipayCommonResult> {
    const timestamp = Date.now();
    const appAuthToken = options.traceId;
    
    // 生成签名
    const signature = await signatureV3(
      method,
      pathname,
      params,
      requestBody,
      appAuthToken,
      timestamp,
      this.config.appId,
      this.config.privateKey,
      this.config.signType,
      this.config.keyType
    );
    
    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'alipay-sdk-deno/1.0.0',
      'Alipay-Timestamp': timestamp.toString(),
      'Alipay-Nonce': createRequestId(),
      'Alipay-Signature': signature,
      'Alipay-App-Id': this.config.appId,
    };
    
    if (appAuthToken) {
      headers['Alipay-App-Auth-Token'] = appAuthToken;
    }
    
    if (this.config.appCertSn) {
      headers['Alipay-App-Cert-Sn'] = this.config.appCertSn;
    }
    
    // 构建 URL
    const url = new URL(pathname, this.config.endpoint);
    params.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    
    // 发送请求
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: requestBody || undefined,
        signal: controller.signal,
      });
      
      checkResponseStatus(response);
      const responseText = await response.text();
      return safeJsonParse(responseText, { code: '40004', msg: '解析响应失败' });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 验证 V3 API 回调签名
   */
  async checkNotifySignV3(
    timestamp: string,
    nonce: string,
    requestBody: string,
    signature: string
  ): Promise<boolean> {
    let publicKey = this.config.alipayPublicKey;
    
    if (this.config.alipayPublicCertContent) {
      publicKey = this.certUtils.extractPublicKeyFromCert(this.config.alipayPublicCertContent);
    }
    
    if (!publicKey) {
      throw new Error('支付宝公钥未配置');
    }
    
    return await verifySignatureV3(
      timestamp,
      nonce,
      requestBody,
      signature,
      publicKey,
      this.config.signType
    );
  }

  /**
   * 获取 SDK 配置
   */
  getConfig(): Readonly<AlipaySdkConfig> {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<AlipaySdkConfig>): void {
    Object.assign(this.config, newConfig);
    
    // 重新初始化证书序列号
    if (newConfig.appCertContent || newConfig.alipayPublicCertContent || newConfig.alipayRootCertContent) {
      this.initializeCertSn();
    }
  }
}

export default AlipaySdk;