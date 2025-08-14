# Alipay SDK for Deno

[![JSR](https://jsr.io/badges/@leavestylecode/alipay-sdk-deno)](https://jsr.io/@leavestylecode/alipay-sdk-deno)
[![CI](https://github.com/leavestylecode/alipay-sdk-deno/actions/workflows/ci.yml/badge.svg)](https://github.com/leavestylecode/alipay-sdk-deno/actions/workflows/ci.yml)

A comprehensive TypeScript SDK for Alipay Open Platform APIs, fully compatible with Deno, Supabase Edge Functions, and other Deno runtimes.

## ✨ Features

- 🦕 **Deno Native** - Built specifically for Deno runtime
- 🔐 **Web Crypto API** - Uses modern Web Crypto for RSA signing/verification
- 🚀 **Zero Dependencies** - No external dependencies, pure TypeScript
- 🔒 **Type Safe** - Full TypeScript support with comprehensive type definitions
- 🌐 **Edge Functions Ready** - Perfect for Supabase Edge Functions
- 📦 **Complete API Coverage** - All major Alipay APIs included
- 🛡️ **Secure** - Proper signature verification and AES encryption support

## 🚀 Quick Start

### Installation

```typescript
// Import from JSR
import { AlipaySDK } from 'jsr:@leavestylecode/alipay-sdk-deno';

// Or with specific version
import { AlipaySDK } from 'jsr:@leavestylecode/alipay-sdk-deno@^1.0.0';
```

### Basic Usage

```typescript
import { AlipaySDK } from 'jsr:@leavestylecode/alipay-sdk-deno';

const alipay = new AlipaySDK({
  appId: 'your-app-id',
  privateKey: 'your-private-key',
  alipayPublicKey: 'alipay-public-key', // optional, for signature verification
  gateway: 'https://openapi.alipay.com/gateway.do', // optional, defaults to production
  signType: 'RSA2', // optional, defaults to RSA2
});

// Create a QR code payment
const result = await alipay.apis.tradePrecreate({
  out_trade_no: 'ORDER_' + Date.now(),
  total_amount: '0.01',
  subject: 'Test Product',
});

if (result.code === '10000') {
  console.log('QR Code:', result.qr_code);
}
```

## 🏗️ Supabase Edge Functions Integration

Perfect for serverless environments like Supabase Edge Functions:

```typescript
// supabase/functions/alipay-service/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { AlipaySDK } from 'jsr:@leavestylecode/alipay-sdk-deno';

const alipay = new AlipaySDK({
  appId: Deno.env.get('ALIPAY_APP_ID')!,
  privateKey: Deno.env.get('ALIPAY_PRIVATE_KEY')!,
  alipayPublicKey: Deno.env.get('ALIPAY_PUBLIC_KEY'),
});

serve(async (req) => {
  try {
    const { action, data } = await req.json();
    
    let result;
    switch (action) {
      case 'create_qr_payment':
        result = await alipay.apis.tradePrecreate(data);
        break;
      case 'query_payment':
        result = await alipay.apis.tradeQuery(data);
        break;
      default:
        throw new Error('Unknown action');
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

## 📚 API Reference

### Core Classes

#### AlipaySDK

Main SDK class that combines core functionality with API methods.

```typescript
const sdk = new AlipaySDK(config);
```

#### Configuration

```typescript
interface AlipaySdkConfig {
  appId: string;                    // Your Alipay App ID
  privateKey: string;               // Your RSA private key
  signType?: 'RSA2' | 'RSA';       // Signature algorithm (default: RSA2)
  alipayPublicKey?: string;         // Alipay public key for verification
  gateway?: string;                 // Gateway URL (default: production)
  timeout?: number;                 // Request timeout in ms (default: 5000)
  camelcase?: boolean;             // Convert response keys to camelCase (default: true)
  // ... more options
}
```

### Payment APIs

#### Create QR Code Payment

```typescript
const result = await sdk.apis.tradePrecreate({
  out_trade_no: 'unique-order-id',
  total_amount: '10.00',
  subject: 'Product Name',
  store_id: 'STORE_001',           // optional
  timeout_express: '30m',          // optional
});
```

#### Query Payment Status

```typescript
const result = await sdk.apis.tradeQuery({
  out_trade_no: 'your-order-id',
  // or trade_no: 'alipay-trade-id'
});

console.log('Status:', result.trade_status);
// WAIT_BUYER_PAY, TRADE_SUCCESS, TRADE_CLOSED, etc.
```

#### Process Refund

```typescript
const result = await sdk.apis.tradeRefund({
  out_trade_no: 'original-order-id',
  refund_amount: '5.00',
  refund_reason: 'Customer request',
  out_request_no: 'refund-' + Date.now(),
});
```

#### Close/Cancel Payment

```typescript
// Close payment (for uncompleted orders)
await sdk.apis.tradeClose({
  out_trade_no: 'order-to-close'
});

// Cancel payment (for failed orders)
await sdk.apis.tradeCancel({
  out_trade_no: 'order-to-cancel'
});
```

### Signature Verification

#### Verify Callback Signature

```typescript
// For standard callbacks
const isValid = await sdk.checkNotifySign({
  // all callback parameters from Alipay
  out_trade_no: 'your-order-id',
  trade_status: 'TRADE_SUCCESS',
  total_amount: '10.00',
  sign: 'signature-from-alipay',
  sign_type: 'RSA2',
  // ... other parameters
});

if (isValid) {
  console.log('Callback is authentic');
  // Process the payment notification
}
```

#### V3 API Signature Verification

```typescript
const isValid = await sdk.checkNotifySignV3(
  timestamp,
  nonce,
  requestBody,
  signature
);
```

### Utility Functions

#### Generate Order Number

```typescript
import { generateOutTradeNo } from 'jsr:@leavestylecode/alipay-sdk-deno';

const orderNo = generateOutTradeNo('ORDER');
// Returns: ORDER_1640995200000_abc123
```

#### Format Amount

```typescript
import { formatAmount } from 'jsr:@leavestylecode/alipay-sdk-deno';

const amount = formatAmount(10); // Returns: "10.00"
```

### Advanced Features

#### Certificate-based Authentication

```typescript
const sdk = new AlipaySDK({
  appId: 'your-app-id',
  privateKey: 'your-private-key',
  appCertContent: 'your-app-certificate-content',
  alipayPublicCertContent: 'alipay-public-certificate-content',
  alipayRootCertContent: 'alipay-root-certificate-content',
});
```

#### AES Encryption

```typescript
const result = await sdk.exec('alipay.trade.create', {
  bizContent: { /* your data */ },
  needEncrypt: true, // Enable AES encryption
});
```

#### Custom Request Options

```typescript
const result = await sdk.exec('alipay.trade.query', {
  bizContent: { out_trade_no: 'test' }
}, {
  bizContentAutoSnakeCase: false, // Disable automatic snake_case conversion
});
```

## 🔧 Environment Setup

### Environment Variables

```bash
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key_content
-----END PRIVATE KEY-----"
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
alipay_public_key_content
-----END PUBLIC KEY-----"
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
```

### Sandbox Environment

```typescript
const sdk = new AlipaySDK({
  appId: 'your-sandbox-app-id',
  privateKey: 'your-sandbox-private-key',
  gateway: 'https://openapi.alipaydev.com/gateway.do', // Sandbox gateway
  alipayPublicKey: 'sandbox-alipay-public-key',
});
```

## 🧪 Testing

```bash
# Run tests
deno test --allow-all

# Run with coverage
deno test --allow-all --coverage=cov/

# Format code
deno fmt

# Lint code
deno lint
```

## 📈 Error Handling

```typescript
try {
  const result = await sdk.apis.tradeQuery({
    out_trade_no: 'non-existent-order'
  });
  
  if (result.code !== '10000') {
    console.error('API Error:', result.msg, result.sub_msg);
  }
} catch (error) {
  console.error('Network/System Error:', error.message);
}
```

Common error codes:
- `10000`: Success
- `20000`: Service unavailable
- `20001`: Missing required parameters
- `40001`: Invalid parameters
- `40004`: Business processing failed

## 🔒 Security Best Practices

1. **Keep Private Keys Secure**: Never commit private keys to version control
2. **Verify Signatures**: Always verify callback signatures in production
3. **Use HTTPS**: Ensure all communications use HTTPS
4. **Validate Amounts**: Always validate payment amounts on your server
5. **Log Transactions**: Keep detailed logs for audit purposes

## 🌟 Migration from Node.js SDK

This Deno SDK is designed to be familiar to users of the Node.js alipay-sdk:

```typescript
// Node.js version
const AlipaySdk = require('alipay-sdk').default;

// Deno version
import { AlipaySDK } from 'jsr:@leavestylecode/alipay-sdk-deno';

// API calls are similar
const result = await sdk.exec('alipay.trade.query', { /* params */ });
```

Key differences:
- Uses Web Crypto API instead of Node.js crypto
- No external dependencies
- Built-in TypeScript support
- Optimized for edge computing environments

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Alipay Open Platform Documentation](https://opendocs.alipay.com/)
- [JSR Package](https://jsr.io/@leavestylecode/alipay-sdk-deno)
- [GitHub Repository](https://github.com/leavestylecode/alipay-sdk-deno)
- [Issues & Support](https://github.com/leavestylecode/alipay-sdk-deno/issues)

---

Made with ❤️ for the Deno community