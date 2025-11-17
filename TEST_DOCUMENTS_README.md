# Test Documents for Model Testing

## 📄 Created Test Documents

Three test PDF documents have been created in the `frontend/` directory:

### 1. **test_invoice.pdf** (3.6 KB)
- **Type**: Invoice
- **Contains**:
  - Invoice number: INV-2025-001234
  - Invoice date: December 15, 2025
  - Due date: January 15, 2026
  - From: Tech Solutions Inc.
  - To: ABC Corporation
  - Line items: Web Development, UI/UX Design, API Integration, Testing & QA
  - Subtotal: $12,400.00
  - Tax (8.5%): $1,054.00
  - Total: $13,454.00
  - Payment terms and bank details

### 2. **test_contract.pdf** (4.8 KB)
- **Type**: Service Agreement Contract
- **Contains**:
  - Contract number: CNT-2025-005678
  - Contract date: December 1, 2025
  - Effective date: January 1, 2026
  - Expiration date: December 31, 2026
  - Parties: Tech Solutions Inc. (Service Provider) and ABC Corporation (Client)
  - Contract value: $150,000.00
  - Terms and conditions (7 sections)
  - Signature blocks

### 3. **test_bill.pdf** (3.9 KB)
- **Type**: Utility Bill
- **Contains**:
  - Account number: ACC-789456123
  - Customer: Michael Johnson
  - Service address: 123 Main Street, Apt 4B, San Francisco, CA 94102
  - Billing period: November 1-30, 2025
  - Service charges:
    - Electricity: 450 kWh @ $0.15/kWh = $67.50
    - Water: 2,500 gallons @ $0.08/gallon = $200.00
    - Gas: 85 therms @ $1.25/therm = $106.25
    - Waste Management: $45.00
    - Service Fee: $12.00
  - Subtotal: $430.75
  - Tax (7.5%): $32.31
  - Total due: $463.06

## 🚀 How to Use

1. **Upload to your application**:
   - Go to `/get-started` or `/dashboard`
   - Click "Select File"
   - Choose one of the test PDFs (test_invoice.pdf, test_contract.pdf, or test_bill.pdf)
   - Click "Extract Data"

2. **Test different extraction modes**:
   - **Use Template**: Select "Invoice", "Bank Statement", or "Driver's License (UK)"
   - **Auto Schema**: Let AI automatically detect the document structure

3. **Verify extraction**:
   - Check that all key fields are extracted correctly
   - Verify amounts, dates, names, and other structured data
   - Test with different models (Ollama, Gemini, etc.)

## 🔄 Regenerate Documents

To recreate the test documents, run:

```bash
cd frontend
python3 create_all_test_documents.py
```

Or create individual documents:

```bash
python3 create_test_invoice.py
python3 create_test_contract.py
python3 create_test_bill.py
```

## 📋 Expected Extraction Results

### Invoice
- Invoice number, dates, parties
- Line items with quantities and prices
- Subtotal, tax, total amount
- Payment information

### Contract
- Contract number and dates
- Party information (names, addresses, contact details)
- Contract terms and conditions
- Financial terms (contract value, payment schedule)

### Bill
- Account number and customer information
- Billing period and due date
- Service usage details (kWh, gallons, therms)
- Charges breakdown
- Total amount due

---

**Note**: These are sample documents for testing purposes. Modify the Python scripts to create custom test documents with different data.

