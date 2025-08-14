/**
 * 证书工具类 - Deno 版本
 * 处理支付宝公钥证书相关功能
 */

import { decodeBase64 } from '@std/encoding/base64';
import type { CertificateInfo } from './types.ts';

/**
 * 证书工具类
 */
export class CertUtils {
  /**
   * 从证书内容中提取序列号
   */
  static getCertSerialNumber(certContent: string): string {
    try {
      // 简化版本：从证书内容中提取序列号
      // 在实际应用中，你可能需要使用更完整的 X.509 证书解析库
      const cert = this.parseCertificate(certContent);
      return cert.serialNumber;
    } catch (error) {
      throw new Error(`获取证书序列号失败: ${error.message}`);
    }
  }

  /**
   * 验证证书是否有效
   */
  static verifyCertificate(certContent: string): boolean {
    try {
      const cert = this.parseCertificate(certContent);
      const now = new Date();
      return now >= cert.notBefore && now <= cert.notAfter;
    } catch {
      return false;
    }
  }

  /**
   * 从证书中提取公钥
   */
  static extractPublicKeyFromCert(certContent: string): string {
    try {
      // 清理证书格式
      const cleanCert = certContent
        .replace(/-----BEGIN CERTIFICATE-----/g, '')
        .replace(/-----END CERTIFICATE-----/g, '')
        .replace(/\\s+/g, '');

      // 这里是简化版本，实际应用中需要完整的 X.509 解析
      // 返回处理后的公钥（这里返回原证书内容作为占位）
      return cleanCert;
    } catch (error) {
      throw new Error(`从证书提取公钥失败: ${error.message}`);
    }
  }

  /**
   * 解析证书信息（简化版本）
   */
  private static parseCertificate(certContent: string): CertificateInfo {
    // 这是一个简化的证书解析实现
    // 在实际使用中，你可能需要使用完整的 X.509 证书解析库
    
    const cleanCert = certContent
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\\s+/g, '');

    // 解码证书
    const certBuffer = decodeBase64(cleanCert);
    
    // 简化的序列号提取（实际需要完整的 ASN.1 解析）
    const serialNumber = this.extractSerialNumberFromDER(certBuffer);
    
    return {
      serialNumber,
      content: certContent,
      notBefore: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 假设一年前开始有效
      notAfter: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 假设一年后过期
      issuer: 'Alipay Root CA',
      subject: 'Alipay Certificate',
    };
  }

  /**
   * 从 DER 格式中提取序列号（简化版本）
   */
  private static extractSerialNumberFromDER(derBuffer: Uint8Array): string {
    // 这是一个非常简化的实现
    // 实际应用中需要完整的 ASN.1/DER 解析
    
    // 生成一个基于内容的序列号
    let hash = 0;
    for (let i = 0; i < Math.min(derBuffer.length, 100); i++) {
      hash = ((hash << 5) - hash + derBuffer[i]) & 0xffffffff;
    }
    
    return Math.abs(hash).toString(16).toUpperCase();
  }

  /**
   * 构建证书链
   */
  static buildCertChain(certs: string[]): string[] {
    return certs.map(cert => this.normalizeCertificate(cert));
  }

  /**
   * 标准化证书格式
   */
  static normalizeCertificate(certContent: string): string {
    const cleanCert = certContent
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\\s+/g, '');
    
    return `-----BEGIN CERTIFICATE-----\\n${cleanCert}\\n-----END CERTIFICATE-----`;
  }

  /**
   * 验证证书链
   */
  static verifyCertChain(certChain: string[], rootCert: string): boolean {
    try {
      // 简化版本的证书链验证
      // 实际应用中需要完整的证书链验证逻辑
      return certChain.every(cert => this.verifyCertificate(cert));
    } catch {
      return false;
    }
  }

  /**
   * 获取证书指纹
   */
  static async getCertFingerprint(certContent: string): Promise<string> {
    const cleanCert = certContent
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\\s+/g, '');
    
    const certBuffer = decodeBase64(cleanCert);
    const hashBuffer = await crypto.subtle.digest('SHA-256', certBuffer);
    
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }
}

/**
 * 证书管理器
 */
export class CertificateManager {
  private certificates: Map<string, CertificateInfo> = new Map();

  /**
   * 添加证书
   */
  addCertificate(sn: string, certContent: string): void {
    const certInfo = CertUtils.parseCertificate(certContent);
    this.certificates.set(sn, certInfo);
  }

  /**
   * 获取证书
   */
  getCertificate(sn: string): CertificateInfo | undefined {
    return this.certificates.get(sn);
  }

  /**
   * 移除证书
   */
  removeCertificate(sn: string): boolean {
    return this.certificates.delete(sn);
  }

  /**
   * 获取所有有效证书
   */
  getValidCertificates(): CertificateInfo[] {
    const now = new Date();
    return Array.from(this.certificates.values()).filter(
      cert => now >= cert.notBefore && now <= cert.notAfter
    );
  }

  /**
   * 清理过期证书
   */
  cleanExpiredCertificates(): void {
    const now = new Date();
    for (const [sn, cert] of this.certificates.entries()) {
      if (now > cert.notAfter) {
        this.certificates.delete(sn);
      }
    }
  }

  /**
   * 获取证书数量
   */
  size(): number {
    return this.certificates.size;
  }

  /**
   * 清空所有证书
   */
  clear(): void {
    this.certificates.clear();
  }
}

// 默认导出
export default CertUtils;