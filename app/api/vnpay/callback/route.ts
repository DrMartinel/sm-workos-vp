import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import qs from 'qs'
import { profilesService } from '@/lib/utils/supabase/profiles'

// VNPay configuration
const VNP_TMN_CODE = process.env.VNP_TMN_CODE || '2QXUI4J4'
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || 'KARPEBEMHBEHTWPA'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vnp_Params: any = {}
    
    // Convert searchParams to object
    searchParams.forEach((value, key) => {
      vnp_Params[key] = value
    })

    const secureHash = vnp_Params['vnp_SecureHash']

    // Remove secure hash from parameters for verification
    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    // Sort parameters
    const sortedParams = sortObject(vnp_Params)

    // Create query string
    const signData = qs.stringify(sortedParams, { encode: false })
    
    // Create signature for verification
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    if (secureHash === signed) {
      const responseCode = vnp_Params['vnp_ResponseCode']
      const orderId = vnp_Params['vnp_TxnRef']
      const amount = parseInt(vnp_Params['vnp_Amount']) / 100 // Convert back from smallest currency unit
      
      // Check if payment was successful (ResponseCode = '00' means success)
      if (responseCode === '00') {
        const coinsToAdd = Number(amount);
        
        return NextResponse.json({ 
          success: true, 
          amount: coinsToAdd,
          orderInfo: vnp_Params['vnp_OrderInfo']
        });
      } else {
        // Payment failed
        const errorMessage = getErrorMessage(responseCode)
        return NextResponse.json({ success: false, error: errorMessage });
      }
    } else {
      // Invalid signature
      return NextResponse.json({ success: false, error: 'invalid_signature' });
    }
  } catch (error) {
    console.error('VNPay callback error:', error)
    return NextResponse.redirect(new URL('/sm-rewards?payment=error&message=callback_error', request.url))
  }
}

// Helper function to get error messages
function getErrorMessage(responseCode: string): string {
  const errorMessages: { [key: string]: string } = {
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức cho phép.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
  }
  
  return errorMessages[responseCode] || 'Giao dịch không thành công'
} 