/**
 * Supabase Edge Function Example
 * Copy this to supabase/functions/alipay-service/index.ts
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { AlipaySDK } from 'jsr:@leavestylecode/alipay-sdk-deno';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Initialize Alipay SDK with environment variables
const alipay = new AlipaySDK({
  appId: Deno.env.get('ALIPAY_APP_ID')!,
  privateKey: Deno.env.get('ALIPAY_PRIVATE_KEY')!,
  alipayPublicKey: Deno.env.get('ALIPAY_PUBLIC_KEY'),
  gateway: Deno.env.get('ALIPAY_GATEWAY') || 'https://openapi.alipay.com/gateway.do',
  signType: 'RSA2',
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    let result;

    switch (action) {
      case 'create_qr_payment':
        // Create QR code payment
        result = await alipay.apis.tradePrecreate({
          out_trade_no: data.out_trade_no,
          total_amount: data.total_amount,
          subject: data.subject,
          store_id: data.store_id,
          timeout_express: data.timeout_express || '30m',
          ...data,
        });
        break;

      case 'create_direct_payment':
        // Create direct payment
        result = await alipay.apis.tradeCreate({
          out_trade_no: data.out_trade_no,
          total_amount: data.total_amount,
          subject: data.subject,
          buyer_id: data.buyer_id,
          timeout_express: data.timeout_express || '30m',
          ...data,
        });
        break;

      case 'query_payment':
        // Query payment status
        result = await alipay.apis.tradeQuery({
          out_trade_no: data.out_trade_no,
          trade_no: data.trade_no,
        });
        break;

      case 'close_payment':
        // Close unpaid order
        result = await alipay.apis.tradeClose({
          out_trade_no: data.out_trade_no,
          trade_no: data.trade_no,
        });
        break;

      case 'cancel_payment':
        // Cancel payment
        result = await alipay.apis.tradeCancel({
          out_trade_no: data.out_trade_no,
          trade_no: data.trade_no,
        });
        break;

      case 'refund_payment':
        // Process refund
        result = await alipay.apis.tradeRefund({
          out_trade_no: data.out_trade_no,
          trade_no: data.trade_no,
          refund_amount: data.refund_amount,
          refund_reason: data.refund_reason,
          out_request_no: data.out_request_no,
        });
        break;

      case 'query_refund':
        // Query refund status
        result = await alipay.apis.tradeRefundQuery({
          out_trade_no: data.out_trade_no,
          trade_no: data.trade_no,
          out_request_no: data.out_request_no,
        });
        break;

      case 'verify_callback':
        // Verify callback signature
        const isValid = await alipay.checkNotifySign(data.params);
        result = { valid: isValid };
        break;

      case 'download_bill':
        // Download bill URL
        result = await alipay.apis.dataBillDownloadUrlQuery({
          bill_type: data.bill_type,
          bill_date: data.bill_date,
        });
        break;

      case 'transfer_to_account':
        // Transfer to Alipay account
        result = await alipay.apis.fundTransToaccountTransfer({
          out_biz_no: data.out_biz_no,
          payee_type: data.payee_type,
          payee_account: data.payee_account,
          amount: data.amount,
          payer_show_name: data.payer_show_name,
          payee_real_name: data.payee_real_name,
          remark: data.remark,
        });
        break;

      case 'query_transfer':
        // Query transfer status
        result = await alipay.apis.fundTransCommonQuery({
          out_biz_no: data.out_biz_no,
          order_id: data.order_id,
        });
        break;

      case 'oauth_token':
        // OAuth token exchange
        result = await alipay.apis.systemOauthToken({
          code: data.code,
          grant_type: data.grant_type,
          refresh_token: data.refresh_token,
        });
        break;

      case 'user_info':
        // Get user info
        result = await alipay.apis.userInfoShare({
          auth_code: data.auth_code,
        });
        break;

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Unknown action',
            code: 'INVALID_ACTION',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Alipay API Error:', error);

    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: 'API_ERROR',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/*
Environment Variables Setup:
Add these to your Supabase project settings:

ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key_content_here
-----END PRIVATE KEY-----"
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
alipay_public_key_content_here
-----END PUBLIC KEY-----"
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do

For sandbox testing:
ALIPAY_GATEWAY=https://openapi.alipaydev.com/gateway.do

Usage Examples:

1. Create QR Payment:
POST https://your-project.supabase.co/functions/v1/alipay-service
{
  "action": "create_qr_payment",
  "data": {
    "out_trade_no": "ORDER_123456789",
    "total_amount": "10.00",
    "subject": "Test Product",
    "store_id": "STORE_001"
  }
}

2. Query Payment:
POST https://your-project.supabase.co/functions/v1/alipay-service
{
  "action": "query_payment",
  "data": {
    "out_trade_no": "ORDER_123456789"
  }
}

3. Verify Callback:
POST https://your-project.supabase.co/functions/v1/alipay-service
{
  "action": "verify_callback",
  "data": {
    "params": {
      "out_trade_no": "ORDER_123456789",
      "trade_status": "TRADE_SUCCESS",
      "total_amount": "10.00",
      "sign": "signature_from_alipay",
      "sign_type": "RSA2"
    }
  }
}

4. Process Refund:
POST https://your-project.supabase.co/functions/v1/alipay-service
{
  "action": "refund_payment",
  "data": {
    "out_trade_no": "ORDER_123456789",
    "refund_amount": "5.00",
    "refund_reason": "Customer request",
    "out_request_no": "REFUND_123456789"
  }
}
*/