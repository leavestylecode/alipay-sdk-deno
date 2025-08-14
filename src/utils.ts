/**
 * 工具函数 - Deno 版本
 * 基于原始 alipay-sdk-nodejs-all 项目改造，使用 Web 标准 API
 */

import { encodeBase64, decodeBase64 } from '@std/encoding/base64';
import { encodeHex, decodeHex } from '@std/encoding/hex';
import type { AlipaySdkConfig, AlipaySdkSignType } from './types.ts';

/**
 * 签名算法映射
 */
export const ALIPAY_ALGORITHM_MAPPING = {
  RSA: 'RSASSA-PKCS1-v1_5',
  RSA2: 'RSASSA-PKCS1-v1_5',
} as const;

/**
 * 哈希算法映射
 */
export const HASH_ALGORITHM_MAPPING = {
  RSA: 'SHA-1',
  RSA2: 'SHA-256',
} as const;

/**
 * 生成随机 UUID
 */
export function createRequestId(): string {
  return crypto.randomUUID();
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(date?: Date): string {
  const d = date || new Date();
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * 驼峰转下划线
 */
export function decamelize(str: string, separator = '_'): string {
  return str
    .replace(/(\\w+)([A-Z])/g, `$1${separator}$2`)
    .replace(/([a-z\\d])([A-Z])/g, `$1${separator}$2`)
    .toLowerCase();
}

/**
 * 下划线转驼峰
 */
export function camelize(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 转换对象的键名（驼峰 -> 下划线）
 */
export function snakeCaseKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeCaseKeys);
  }
  
  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[decamelize(key)] = snakeCaseKeys(value);
    }
    return result;
  }
  
  return obj;
}

/**
 * 转换对象的键名（下划线 -> 驼峰）
 */
export function camelCaseKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys);
  }
  
  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[camelize(key)] = camelCaseKeys(value);
    }
    return result;
  }
  
  return obj;
}

/**
 * RSA 签名
 */
export async function sign(
  data: string,
  privateKey: string,
  signType: AlipaySdkSignType = 'RSA2',
  keyType: 'PKCS1' | 'PKCS8' = 'PKCS8'
): Promise<string> {
  const cryptoKey = await importPrivateKey(privateKey, signType, keyType);
  
  const algorithm = {
    name: ALIPAY_ALGORITHM_MAPPING[signType],
    hash: HASH_ALGORITHM_MAPPING[signType],
  };
  
  const signature = await crypto.subtle.sign(
    algorithm,
    cryptoKey,
    new TextEncoder().encode(data)
  );
  
  return encodeBase64(signature);
}

/**
 * RSA 验签
 */
export async function verify(
  data: string,
  signature: string,
  publicKey: string,
  signType: AlipaySdkSignType = 'RSA2'
): Promise<boolean> {
  try {
    const cryptoKey = await importPublicKey(publicKey, signType);
    
    const algorithm = {
      name: ALIPAY_ALGORITHM_MAPPING[signType],
      hash: HASH_ALGORITHM_MAPPING[signType],
    };
    
    const signatureBuffer = decodeBase64(signature);
    
    return await crypto.subtle.verify(
      algorithm,
      cryptoKey,
      signatureBuffer,
      new TextEncoder().encode(data)
    );
  } catch (error) {
    console.error('验签失败:', error);
    return false;
  }
}

/**
 * 导入私钥
 */
export async function importPrivateKey(
  privateKey: string,
  signType: AlipaySdkSignType = 'RSA2',
  keyType: 'PKCS1' | 'PKCS8' = 'PKCS8'
): Promise<CryptoKey> {
  // 清理密钥格式
  let cleanKey = privateKey
    .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/g, '')
    .replace(/-----END (RSA )?PRIVATE KEY-----/g, '')
    .replace(/\\s+/g, '');
  
  // 将 base64 转换为 ArrayBuffer
  const keyBuffer = decodeBase64(cleanKey);
  
  const algorithm = {
    name: ALIPAY_ALGORITHM_MAPPING[signType],
    hash: HASH_ALGORITHM_MAPPING[signType],
  };
  
  // 根据密钥类型选择格式
  const format: KeyFormat = keyType === 'PKCS1' ? 'pkcs8' : 'pkcs8'; // PKCS1 在Web Crypto中不直接支持，都使用PKCS8
  
  return await crypto.subtle.importKey(
    format,
    keyBuffer,
    algorithm,
    false,
    ['sign']
  );
}

/**
 * 导入公钥
 */
export async function importPublicKey(
  publicKey: string,
  signType: AlipaySdkSignType = 'RSA2'
): Promise<CryptoKey> {
  // 清理密钥格式
  const cleanKey = publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\\s+/g, '');
  
  // 将 base64 转换为 ArrayBuffer
  const keyBuffer = decodeBase64(cleanKey);
  
  const algorithm = {
    name: ALIPAY_ALGORITHM_MAPPING[signType],
    hash: HASH_ALGORITHM_MAPPING[signType],
  };
  
  return await crypto.subtle.importKey(
    'spki',
    keyBuffer,
    algorithm,
    false,
    ['verify']
  );
}

/**
 * AES 加密文本
 */
export async function aesEncryptText(plainText: string, aesKey: string): Promise<string> {
  const key = await importAESKey(aesKey);
  const iv = new Uint8Array(16); // 全零 IV
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    new TextEncoder().encode(plainText)
  );
  
  return encodeBase64(encrypted);
}

/**
 * AES 解密文本
 */
export async function aesDecryptText(encryptedText: string, aesKey: string): Promise<string> {
  const key = await importAESKey(aesKey);
  const iv = new Uint8Array(16); // 全零 IV
  
  const encryptedBuffer = decodeBase64(encryptedText);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    encryptedBuffer
  );
  
  return new TextDecoder().decode(decrypted);
}

/**
 * AES 加密对象
 */
export async function aesEncrypt(data: object, aesKey: string): Promise<string> {
  const plainText = JSON.stringify(data);
  return await aesEncryptText(plainText, aesKey);
}

/**
 * AES 解密对象
 */
export async function aesDecrypt(encryptedText: string, aesKey: string): Promise<object> {
  const plainText = await aesDecryptText(encryptedText, aesKey);
  return JSON.parse(plainText);
}

/**
 * 导入 AES 密钥
 */
async function importAESKey(aesKey: string): Promise<CryptoKey> {
  const keyBuffer = decodeBase64(aesKey);
  
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 读取流数据为字节数组
 */
export async function readableToBytes(readable: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  const reader = readable.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  
  // 合并所有块
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

/**
 * V3 API 签名
 */
export async function signatureV3(
  method: string,
  pathname: string,
  params: URLSearchParams,
  requestBody: string,
  appAuthToken: string | undefined,
  timestamp: number,
  appId: string,
  privateKey: string,
  signType: AlipaySdkSignType = 'RSA2',
  keyType: 'PKCS1' | 'PKCS8' = 'PKCS8'
): Promise<string> {
  const query = params.toString();
  const payloadBody = requestBody || '';
  
  // 构建签名字符串
  const stringToSign = [
    method.toUpperCase(),
    pathname,
    query,
    payloadBody,
    appAuthToken || '',
    timestamp.toString(),
  ].join('\\n');
  
  return await sign(stringToSign, privateKey, signType, keyType);
}

/**
 * V3 API 验签
 */
export async function verifySignatureV3(
  timestamp: string,
  nonce: string,
  requestBody: string,
  signature: string,
  publicKey: string,
  signType: AlipaySdkSignType = 'RSA2'
): Promise<boolean> {
  const stringToVerify = [timestamp, nonce, requestBody].join('\\n');
  return await verify(stringToVerify, signature, publicKey, signType);
}

/**
 * 生成支付宝网关 URL
 */
export function buildGatewayUrl(gateway: string, params: Record<string, string>): string {
  const url = new URL(gateway);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

/**
 * 验证必填参数
 */
export function validateRequiredParams(params: Record<string, any>, required: string[]): void {
  const missing = required.filter(key => !params[key]);
  if (missing.length > 0) {
    throw new Error(`缺少必填参数: ${missing.join(', ')}`);
  }
}

/**
 * 格式化金额
 */
export function formatAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(2);
}

/**
 * 生成商户订单号
 */
export function generateOutTradeNo(prefix = 'ORDER'): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * 检查网络响应状态
 */
export function checkResponseStatus(response: Response): void {
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }
}

/**
 * 安全地解析 JSON
 */
export function safeJsonParse(jsonString: string, defaultValue: any = null): any {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 移除对象中的空值
 */
export function removeEmptyValues(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  });
  
  return result;
}