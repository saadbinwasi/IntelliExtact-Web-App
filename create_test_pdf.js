// Simple script to create a test PDF using Node.js
const fs = require('fs');
const path = require('path');

// Create a simple HTML content that can be converted to PDF
const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Bank Statement</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        .header {
            margin-bottom: 30px;
        }
        .account-info {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #3498db;
            color: white;
        }
        .balance {
            font-size: 18px;
            font-weight: bold;
            color: #27ae60;
            margin-top: 20px;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Bank Statement</h1>
        <p><strong>Statement Period:</strong> November 1, 2025 - November 30, 2025</p>
    </div>
    
    <div class="account-info">
        <p><strong>Account Number:</strong> 100002345</p>
        <p><strong>Account Holder:</strong> John Doe</p>
        <p><strong>Account Type:</strong> Checking Account</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>2025-11-01</td>
                <td>Opening Balance</td>
                <td>-</td>
                <td>-</td>
                <td>$3,200.00</td>
            </tr>
            <tr>
                <td>2025-11-05</td>
                <td>Transfer to Tom</td>
                <td>$100.00</td>
                <td>-</td>
                <td>$3,100.00</td>
            </tr>
            <tr>
                <td>2025-11-08</td>
                <td>Refund for lunch</td>
                <td>-</td>
                <td>$50.00</td>
                <td>$3,150.00</td>
            </tr>
            <tr>
                <td>2025-11-12</td>
                <td>Refund for voucher</td>
                <td>-</td>
                <td>$20.00</td>
                <td>$3,170.00</td>
            </tr>
            <tr>
                <td>2025-11-15</td>
                <td>May's rent payment</td>
                <td>$750.00</td>
                <td>-</td>
                <td>$2,420.00</td>
            </tr>
            <tr>
                <td>2025-11-20</td>
                <td>Salary deposit</td>
                <td>-</td>
                <td>$2,500.00</td>
                <td>$4,920.00</td>
            </tr>
            <tr>
                <td>2025-11-25</td>
                <td>Grocery store purchase</td>
                <td>$125.50</td>
                <td>-</td>
                <td>$4,794.50</td>
            </tr>
        </tbody>
    </table>
    
    <div class="balance">
        <p>Closing Balance: $4,794.50</p>
    </div>
    
    <div class="footer">
        <p>This is a test document for document extraction testing.</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>`;

// Write HTML file
const htmlPath = path.join(__dirname, 'test_statement.html');
fs.writeFileSync(htmlPath, htmlContent);
console.log('Created test_statement.html');

// Try to convert to PDF using puppeteer if available, otherwise just use the HTML
console.log('\nTest document created!');
console.log('File location:', htmlPath);
console.log('\nYou can:');
console.log('1. Open test_statement.html in a browser and print to PDF');
console.log('2. Or use it directly for testing (HTML files are supported)');
console.log('3. Or install puppeteer to auto-convert: npm install puppeteer');

