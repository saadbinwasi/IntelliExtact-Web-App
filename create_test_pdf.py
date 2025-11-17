#!/usr/bin/env python3
"""
Create a test PDF document for extraction testing
"""
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    import os
    
    # Create PDF
    pdf_path = 'test_bank_statement.pdf'
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=30,
        alignment=TA_LEFT
    )
    story.append(Paragraph("Bank Statement", title_style))
    story.append(Paragraph("Statement Period: November 1, 2025 - November 30, 2025", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Account Info
    account_data = [
        ['Account Number:', '100002345'],
        ['Account Holder:', 'John Doe'],
        ['Account Type:', 'Checking Account']
    ]
    account_table = Table(account_data, colWidths=[2*inch, 4*inch])
    account_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    story.append(account_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Transactions Table
    transactions_data = [
        ['Date', 'Description', 'Debit', 'Credit', 'Balance'],
        ['2025-11-01', 'Opening Balance', '-', '-', '$3,200.00'],
        ['2025-11-05', 'Transfer to Tom', '$100.00', '-', '$3,100.00'],
        ['2025-11-08', 'Refund for lunch', '-', '$50.00', '$3,150.00'],
        ['2025-11-12', 'Refund for voucher', '-', '$20.00', '$3,170.00'],
        ['2025-11-15', "May's rent payment", '$750.00', '-', '$2,420.00'],
        ['2025-11-20', 'Salary deposit', '-', '$2,500.00', '$4,920.00'],
        ['2025-11-25', 'Grocery store purchase', '$125.50', '-', '$4,794.50'],
    ]
    
    transactions_table = Table(transactions_data, colWidths=[1*inch, 2.5*inch, 1*inch, 1*inch, 1*inch])
    transactions_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')])
    ]))
    story.append(transactions_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Closing Balance
    balance_style = ParagraphStyle(
        'Balance',
        parent=styles['Normal'],
        fontSize=16,
        textColor=colors.HexColor('#27ae60'),
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    story.append(Paragraph("Closing Balance: $4,794.50", balance_style))
    
    # Build PDF
    doc.build(story)
    print(f"✅ Created test PDF: {os.path.abspath(pdf_path)}")
    print(f"📄 File size: {os.path.getsize(pdf_path)} bytes")
    
except ImportError:
    print("⚠️  reportlab not installed. Installing...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab", "--quiet"])
    print("✅ Installed reportlab. Please run this script again.")
except Exception as e:
    print(f"❌ Error creating PDF: {e}")
    print("\nAlternative: Use the HTML file and convert manually:")
    print("1. Open test_statement.html in browser")
    print("2. Print → Save as PDF")

