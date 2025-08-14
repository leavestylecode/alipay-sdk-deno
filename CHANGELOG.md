# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-08-14

### Added
- Initial release of Alipay SDK for Deno
- Complete Deno/TypeScript implementation based on alipay-sdk-nodejs-all
- Web Crypto API support for RSA signing and verification
- Zero external dependencies
- Full support for Supabase Edge Functions and other Deno runtimes
- Comprehensive API coverage including:
  - Payment APIs (trade.pay, trade.precreate, trade.create, etc.)
  - Query APIs (trade.query, trade.refund.query, etc.)
  - Management APIs (trade.close, trade.cancel, trade.refund, etc.)
  - OAuth APIs (system.oauth.token, open.auth.token.app)
  - Transfer APIs (fund.trans.toaccount.transfer, etc.)
  - Marketing APIs (marketing.campaign.cash.create, etc.)
  - Pass APIs (pass.template.add, pass.instance.add)
- Certificate-based authentication support
- AES encryption/decryption support
- V3 API signature support
- Callback signature verification
- Complete TypeScript type definitions
- Utility functions for common operations
- Comprehensive documentation and examples

### Features
- 🦕 **Deno Native**: Built specifically for Deno runtime
- 🔐 **Web Crypto API**: Modern cryptographic operations
- 🚀 **Zero Dependencies**: Pure TypeScript implementation
- 🔒 **Type Safe**: Full TypeScript support
- 🌐 **Edge Functions Ready**: Perfect for serverless environments
- 📦 **Complete API Coverage**: All major Alipay APIs
- 🛡️ **Secure**: Proper signature verification and encryption

### Security
- Implements proper RSA-SHA256 signature generation and verification
- Supports AES-CBC encryption for sensitive data
- Certificate-based authentication for enhanced security
- Proper parameter validation and sanitization