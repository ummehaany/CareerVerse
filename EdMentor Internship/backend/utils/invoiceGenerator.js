const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = (order, customerUser, vendorUser) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      const invoicesDir = path.join(__dirname, '../uploads/invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const filename = `invoice-${order._id}.pdf`;
      const filePath = path.join(invoicesDir, filename);
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // Header Branding
      doc
        .fillColor('#0f172a')
        .fontSize(20)
        .text('EdMentor B2B Gift Marketplace', 50, 45)
        .fontSize(10)
        .text('GST Corporate Invoicing Solution', 50, 68)
        .fillColor('#475569')
        .text(`Invoice ID: ${order._id}`, 200, 45, { align: 'right' })
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 200, 60, { align: 'right' })
        .text(`Status: ${order.paymentStatus}`, 200, 75, { align: 'right' });

      doc.moveTo(50, 105).lineTo(550, 105).stroke('#e2e8f0');

      // Addresses Info
      doc
        .fontSize(12)
        .fillColor('#0f172a')
        .text('Billed From (Vendor):', 50, 120, { bold: true })
        .fontSize(10)
        .fillColor('#475569')
        .text(vendorUser.companyName || vendorUser.name)
        .text(`Email: ${vendorUser.email}`)
        .text(`GSTIN: ${vendorUser.gstNumber || 'N/A'}`);

      doc
        .fontSize(12)
        .fillColor('#0f172a')
        .text('Billed To (Customer):', 300, 120, { bold: true })
        .fontSize(10)
        .fillColor('#475569')
        .text(customerUser.companyName || customerUser.name)
        .text(`Email: ${customerUser.email}`);

      if (order.items && order.items.length > 0 && order.items[0].deliveryAddress) {
        const addr = order.items[0].deliveryAddress;
        doc
          .text(`Delivery Address:`)
          .text(`${addr.addressLine1}, ${addr.addressLine2 || ''}`)
          .text(`${addr.city}, ${addr.state} - ${addr.postalCode}`)
          .text(`Contact: ${addr.contactNumber}`);
      }

      doc.moveTo(50, 220).lineTo(550, 220).stroke('#e2e8f0');

      // Table Header
      let y = 240;
      doc
        .fontSize(10)
        .fillColor('#0f172a')
        .text('Product', 50, y, { width: 180, bold: true })
        .text('Qty', 240, y, { width: 40, align: 'right', bold: true })
        .text('Unit Price', 290, y, { width: 70, align: 'right', bold: true })
        .text('Discount', 370, y, { width: 50, align: 'right', bold: true })
        .text('GST %', 430, y, { width: 40, align: 'right', bold: true })
        .text('Total', 480, y, { width: 70, align: 'right', bold: true });

      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke('#cbd5e1');
      y += 25;

      // Table Items
      order.items.forEach((item) => {
        // Safe check for product populated or not
        const productName = item.product && item.product.name ? item.product.name : 'Custom Gifting Item';
        
        doc
          .fontSize(9)
          .fillColor('#475569')
          .text(productName, 50, y, { width: 180 })
          .text(item.quantity.toString(), 240, y, { width: 40, align: 'right' })
          .text(`Rs ${item.pricePerUnit.toFixed(2)}`, 290, y, { width: 70, align: 'right' })
          .text(`${item.discountPercentage}%`, 370, y, { width: 50, align: 'right' })
          .text(`${item.gstPercentage}%`, 430, y, { width: 40, align: 'right' })
          .text(`Rs ${item.finalPrice.toFixed(2)}`, 480, y, { width: 70, align: 'right' });
        
        y += 20;
      });

      doc.moveTo(50, y).lineTo(550, y).stroke('#cbd5e1');
      y += 15;

      // Totals
      doc
        .fontSize(10)
        .fillColor('#0f172a')
        .text('GST Total Collected:', 350, y, { width: 120, align: 'right' })
        .text(`Rs ${order.gstTotal.toFixed(2)}`, 480, y, { width: 70, align: 'right' });
      
      y += 15;
      doc
        .fontSize(11)
        .text('Invoice Total amount:', 350, y, { width: 120, align: 'right', bold: true })
        .fillColor('#10b981')
        .text(`Rs ${order.totalAmount.toFixed(2)}`, 480, y, { width: 70, align: 'right', bold: true });

      y += 40;
      doc
        .fontSize(8)
        .fillColor('#94a3b8')
        .text('Thank you for choosing EdMentor Corporate Gifting Marketplace. This is a computer-generated invoice and requires no physical signature.', 50, y, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(`/uploads/invoices/${filename}`);
      });
      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
