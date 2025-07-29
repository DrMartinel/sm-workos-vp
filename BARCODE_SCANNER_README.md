# Barcode Scanner Implementation

This project now includes a comprehensive barcode scanning and generation system using the `html5-qrcode` library for scanning and `jsbarcode` for generation.

## Components

### 1. Barcode Scanner (`app/shared-ui/components/qr-scanner.tsx`)

A reusable barcode scanner component that uses the `html5-qrcode` library for reliable barcode detection.

**Features:**
- Real-time barcode scanning using device camera
- Support for multiple barcode formats (EAN-13, EAN-8, Code 128, Code 39, UPC-A, UPC-E, Codabar, ITF-14, ITF)
- Support for both front and back cameras
- Camera switching functionality
- Error handling and user feedback
- Customizable UI with scanning overlay
- Automatic cleanup on component unmount

**Props:**
```typescript
interface BarcodeScannerProps {
  onScan: (data: string) => void          // Callback when barcode is detected
  onError?: (error: string) => void       // Callback for errors
  onClose?: () => void                    // Callback for close button
  className?: string                      // Additional CSS classes
  showCloseButton?: boolean               // Show/hide close button
  showFlipButton?: boolean                // Show/hide camera flip button
  autoStart?: boolean                     // Auto-start scanning on mount
}
```

**Usage:**
```tsx
import BarcodeScanner from '@/components/qr-scanner'

function MyComponent() {
  const handleScan = (data: string) => {
    console.log('Barcode detected:', data)
    // Process the scanned data
  }

  const handleError = (error: string) => {
    console.error('Scan error:', error)
  }

  return (
    <BarcodeScanner 
      onScan={handleScan}
      onError={handleError}
      showCloseButton={true}
      showFlipButton={true}
      autoStart={true}
    />
  )
}
```

### 2. Barcode Generator (`app/shared-ui/components/qr-generator.tsx`)

A barcode generator component that creates barcodes from text data using the `jsbarcode` library.

**Features:**
- Generate barcodes in multiple formats (Code 128, Code 39, EAN-13, EAN-8, UPC-A, UPC-E, Codabar, ITF-14, ITF)
- Download barcodes as PNG images
- Copy barcode data to clipboard
- Responsive design
- Customizable options
- Format selection dropdown

**Props:**
```typescript
interface BarcodeGeneratorProps {
  defaultValue?: string                   // Initial barcode data
  className?: string                      // Additional CSS classes
  showDownload?: boolean                  // Show/hide download button
  showCopy?: boolean                      // Show/hide copy button
}
```

**Usage:**
```tsx
import BarcodeGenerator from '@/components/qr-generator'

function MyComponent() {
  return (
    <BarcodeGenerator 
      defaultValue="1234567890123"
      showDownload={true}
      showCopy={true}
    />
  )
}
```

## Supported Barcode Formats

The barcode generator supports the following formats:

- **Code 128**: Alphanumeric, most common format
- **Code 39**: Alphanumeric, industrial use
- **EAN-13**: 13 digits, retail products
- **EAN-8**: 8 digits, small products
- **UPC-A**: 12 digits, US retail
- **UPC-E**: 8 digits, compressed UPC
- **Codabar**: Numeric and some letters
- **ITF-14**: 14 digits, shipping containers
- **ITF**: Interleaved 2 of 5

## Demo Page

A comprehensive demo page is available at `/qr-demo` that showcases both components:

- **Barcode Scanner Tab**: Test the scanner with generated barcodes
- **Barcode Generator Tab**: Create various types of barcodes
- **Example Barcodes**: Pre-built examples for common use cases

## Integration with SM Rewards

The barcode scanner is already integrated into the SM Rewards system:

- **Location**: `app/(dashboard)/applications/sm-rewards/page.tsx`
- **Usage**: Used in the "Scan to Pay" modal for product purchases
- **Data Format**: Expects product codes in format `product:{id}:{name}:{price}`
- **Integration**: Connects with Supabase database to fetch product information

## Dependencies

The implementation uses the following packages:

```json
{
  "html5-qrcode": "^2.3.8",
  "jsbarcode": "^3.12.1"
}
```

## Browser Compatibility

The barcode scanner works in modern browsers that support:
- `getUserMedia` API for camera access
- HTTPS (required for camera access in production)
- Canvas API for image processing

## Security Considerations

- Camera access requires user permission
- Barcodes are processed client-side
- No sensitive data is transmitted without user consent
- HTTPS is required for camera access in production

## Testing

To test the barcode scanner:

1. Navigate to `/qr-demo`
2. Use the Barcode Generator to create test barcodes
3. Use the Barcode Scanner to scan the generated codes
4. Verify that the scanned data matches the original input

## Troubleshooting

**Camera not working:**
- Ensure the site is served over HTTPS
- Check browser permissions for camera access
- Try refreshing the page and granting permissions again

**Barcodes not being detected:**
- Ensure the barcode is clearly visible and well-lit
- Try adjusting the distance between camera and barcode
- Check that the barcode is not damaged or obscured
- Ensure the barcode format is supported

**Performance issues:**
- The scanner runs at 10 FPS by default for optimal performance
- Reduce the `fps` setting in the scanner configuration if needed
- Close other applications using the camera

## Future Enhancements

Potential improvements for the barcode scanner:

1. **QR Code Support**: Add back support for QR codes alongside barcodes
2. **Image Upload**: Allow scanning barcodes from uploaded images
3. **Batch Scanning**: Support for scanning multiple barcodes
4. **Custom Styling**: More customization options for the UI
5. **Offline Support**: Cache scanned data for offline use
6. **Analytics**: Track scanning patterns and success rates
7. **Format Detection**: Auto-detect barcode format from scanned data 