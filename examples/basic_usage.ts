/**
 * Basic Usage Examples for Alipay SDK Deno
 */

import { AlipaySDK, generateOutTradeNo, formatAmount } from '../mod.ts';

// Initialize SDK
const alipay = new AlipaySDK({
  appId: 'your-app-id',
  privateKey: `-----BEGIN PRIVATE KEY-----
your-private-key-content
-----END PRIVATE KEY-----`,
  alipayPublicKey: `-----BEGIN PUBLIC KEY-----
alipay-public-key-content
-----END PUBLIC KEY-----`,
  // gateway: 'https://openapi.alipaydev.com/gateway.do', // For sandbox
  signType: 'RSA2',
});

// Example 1: Create QR Code Payment
async function createQRPayment() {
  console.log('=== Creating QR Code Payment ===');
  
  try {
    const result = await alipay.apis.tradePrecreate({
      out_trade_no: generateOutTradeNo('QR'),
      total_amount: formatAmount(0.01),
      subject: 'Test QR Payment',
      store_id: 'STORE_001',
      timeout_express: '30m',
    });
    
    if (result.code === '10000') {
      console.log('✅ QR Code Payment Created');
      console.log('QR Code Content:', result.qr_code);
      console.log('Order Number:', result.out_trade_no);
    } else {
      console.log('❌ Failed:', result.msg);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 2: Query Payment Status
async function queryPayment() {
  console.log('\\n=== Querying Payment Status ===');
  
  try {
    const result = await alipay.apis.tradeQuery({
      out_trade_no: 'QR_1640995200000_abc123', // Replace with actual order number
    });
    
    if (result.code === '10000') {
      console.log('✅ Payment Status:', result.trade_status);
      console.log('Trade Number:', result.trade_no);
      console.log('Total Amount:', result.total_amount);
    } else {
      console.log('❌ Query Failed:', result.msg);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 3: Process Refund
async function processRefund() {
  console.log('\\n=== Processing Refund ===');
  
  try {
    const result = await alipay.apis.tradeRefund({
      out_trade_no: 'QR_1640995200000_abc123', // Replace with actual order number
      refund_amount: '0.01',
      refund_reason: 'Customer requested refund',
      out_request_no: generateOutTradeNo('REFUND'),
    });
    
    if (result.code === '10000') {
      console.log('✅ Refund Processed');
      console.log('Refund Amount:', result.refund_fee);
      console.log('Refund ID:', result.trade_no);
    } else {
      console.log('❌ Refund Failed:', result.msg);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 4: Verify Callback Signature
async function verifyCallback() {
  console.log('\\n=== Verifying Callback Signature ===');
  
  // Simulate callback parameters from Alipay
  const callbackParams = {
    out_trade_no: 'QR_1640995200000_abc123',
    trade_no: '2024081422001428091234567890',
    trade_status: 'TRADE_SUCCESS',
    total_amount: '0.01',
    receipt_amount: '0.01',
    buyer_id: '2088102147948060',
    gmt_create: '2024-08-14 10:30:00',
    gmt_payment: '2024-08-14 10:30:05',
    sign_type: 'RSA2',
    sign: 'actual-signature-from-alipay', // This would be the real signature
  };
  
  try {
    const isValid = await alipay.checkNotifySign(callbackParams);
    
    if (isValid) {
      console.log('✅ Callback signature is valid');
      console.log('Safe to process payment notification');
    } else {
      console.log('❌ Invalid signature - ignore this callback');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 5: Create Direct Payment
async function createDirectPayment() {
  console.log('\\n=== Creating Direct Payment ===');
  
  try {
    const result = await alipay.apis.tradeCreate({
      out_trade_no: generateOutTradeNo('DIRECT'),
      total_amount: formatAmount(10.00),
      subject: 'Test Direct Payment',
      buyer_id: '2088102147948060', // Buyer's Alipay user ID
      timeout_express: '30m',
    });
    
    if (result.code === '10000') {
      console.log('✅ Direct Payment Created');
      console.log('Trade Number:', result.trade_no);
      console.log('Order Number:', result.out_trade_no);
    } else {
      console.log('❌ Failed:', result.msg);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 6: Download Bill
async function downloadBill() {
  console.log('\\n=== Downloading Bill ===');
  
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const billDate = yesterday.toISOString().substring(0, 10);
    
    const result = await alipay.apis.dataBillDownloadUrlQuery({
      bill_type: 'trade',
      bill_date: billDate,
    });
    
    if (result.code === '10000') {
      console.log('✅ Bill Download URL Retrieved');
      console.log('Download URL:', result.bill_download_url);
    } else {
      console.log('❌ Failed:', result.msg);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run examples
if (import.meta.main) {
  console.log('🚀 Alipay SDK Deno - Basic Usage Examples\\n');
  
  await createQRPayment();
  await queryPayment();
  await processRefund();
  await verifyCallback();
  await createDirectPayment();
  await downloadBill();
  
  console.log('\\n✨ All examples completed!');
}