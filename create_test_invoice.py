#!/usr/bin/env python3
"""
Create a test Invoice PDF document for extraction testing
"""
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    import os
    
    # Create PDF
    pdf_path = 'test_invoice.pdf'
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Header
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=20,
        alignment=TA_LEFT
    )
    story.append(Paragraph("INVOICE", header_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Company Info
    company_data = [
        ['From:', 'Tech Solutions Inc.', 'To:', 'ABC Corporation'],
        ['', '123 Business Street', '', '456 Corporate Avenue'],
        ['', 'San Francisco, CA 94105', '', 'New York, NY 10001'],
        ['', 'Phone: (555) 123-4567', '', 'Phone: (555) 987-6543'],
        ['', 'Email: billing@techsolutions.com', '', 'Email: accounts@abccorp.com'],
    ]
    company_table = Table(company_data, colWidths=[0.8*inch, 2.7*inch, 0.8*inch, 2.7*inch])
    company_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(company_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Invoice Details
    invoice_details = [
        ['Invoice Number:', 'INV-2025-001234'],
        ['Invoice Date:', 'December 15, 2025'],
        ['Due Date:', 'January 15, 2026'],
        ['Payment Terms:', 'Net 30'],
    ]
    details_table = Table(invoice_details, colWidths=[1.5*inch, 2.5*inch])
    details_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    story.append(details_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Items Table
    items_data = [
        ['Description', 'Quantity', 'Unit Price', 'Total'],
        ['Web Development Services', '40', '$150.00', '$6,000.00'],
        ['UI/UX Design', '20', '$120.00', '$2,400.00'],
        ['API Integration', '15', '$200.00', '$3,000.00'],
        ['Testing & QA', '10', '$100.00', '$1,000.00'],
    ]
    
    items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1.2*inch, 1.2*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('ALIGN', (3, 0), (-1, -1), 'RIGHT'),
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
    story.append(items_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Totals
    totals_data = [
        ['Subtotal:', '$12,400.00'],
        ['Tax (8.5%):', '$1,054.00'],
        ['Total Amount Due:', '$13,454.00'],
    ]
    totals_table = Table(totals_data, colWidths=[4*inch, 1.5*inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -1), (1, -1), 14),
        ('TEXTCOLOR', (0, -1), (1, -1), colors.HexColor('#27ae60')),
        ('FONTSIZE', (0, 0), (0, -2), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('LINEABOVE', (0, -1), (1, -1), 2, colors.HexColor('#27ae60')),
    ]))
    story.append(totals_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Payment Instructions
    payment_style = ParagraphStyle(
        'Payment',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#7f8c8d'),
        spaceBefore=20,
    )
    story.append(Paragraph("Payment Instructions:", styles['Heading3']))
    story.append(Paragraph("Please remit payment within 30 days. Wire transfer preferred.", payment_style))
    story.append(Paragraph("Bank: First National Bank | Account: 9876543210 | Routing: 123456789", payment_style))
    
    # Build PDF
    doc.build(story)
    print(f"✅ Created test Invoice PDF: {os.path.abspath(pdf_path)}")
    print(f"📄 File size: {os.path.getsize(pdf_path)} bytes")
    
except ImportError:
    print("⚠️  reportlab not installed. Installing...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab", "--quiet"])
    print("✅ Installed reportlab. Please run this script again.")
except Exception as e:
    print(f"❌ Error creating PDF: {e}")
    import traceback
    traceback.print_exc()

