import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import qs from 'qs'

// VNPay configuration
const VNP_TMN_CODE = process.env.VNP_TMN_CODE || ''
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || ''
const VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || 'https://sm-workos-pink.vercel.app/api/vnpay/callback'

// Helper function to sort object keys
function sortObject(obj: any) {
	let sorted: { [key: string]: string } = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, bankCode, language = 'vn', orderInfo } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Set timezone
    process.env.TZ = 'Asia/Ho_Chi_Minh'
    
    function pad(n: number) {
      return n < 10 ? '0' + n : n;
    }
    const date = new Date();
    const createDate =
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds());
    
    // Get client IP
    const ipAddr =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const orderId = date.getTime().toString()
    const currCode = 'VND'
    
    const vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_Locale: language,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo || 'Thanh toan SM Rewards topup cho ma GD:' + orderId,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // Convert to smallest currency unit
      vnp_ReturnUrl: VNP_RETURN_URL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    }

    if (bankCode && bankCode !== '') {
      vnp_Params.vnp_BankCode = bankCode
    }

    // Sort parameters
    const sortedParams = sortObject(vnp_Params)

    // Create query string
    const signData = qs.stringify(sortedParams, { encode: false })
    
    // Create signature
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    
    // Add signature to parameters
    sortedParams.vnp_SecureHash = signed

    // Create payment URL
    const paymentUrl = VNP_URL + '?' + qs.stringify(sortedParams, { encode: false })

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId,
      amount
    })

  } catch (error) {
    console.error('VNPay payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
} 