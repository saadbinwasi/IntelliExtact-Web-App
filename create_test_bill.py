#!/usr/bin/env python3
"""
Create a test Bill PDF document for extraction testing
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
    pdf_path = 'test_bill.pdf'
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
    story.append(Paragraph("UTILITY BILL", header_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Service Provider Info
    provider_data = [
        ['Service Provider:', 'City Power & Water Company'],
        ['Account Number:', 'ACC-789456123'],
        ['Service Address:', '123 Main Street, Apt 4B, San Francisco, CA 94102'],
        ['Billing Address:', '123 Main Street, Apt 4B, San Francisco, CA 94102'],
        ['Customer Name:', 'Michael Johnson'],
        ['Phone:', '(555) 234-5678'],
        ['Email:', 'michael.johnson@email.com'],
    ]
    provider_table = Table(provider_data, colWidths=[1.8*inch, 4.2*inch])
    provider_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    story.append(provider_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Billing Period
    period_style = ParagraphStyle(
        'Period',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=15,
    )
    story.append(Paragraph("Billing Period: November 1, 2025 - November 30, 2025", period_style))
    story.append(Paragraph("Bill Date: December 5, 2025 | Due Date: December 25, 2025", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Service Charges
    charges_data = [
        ['Service Type', 'Usage', 'Rate', 'Amount'],
        ['Electricity', '450 kWh', '$0.15/kWh', '$67.50'],
        ['Water', '2,500 gallons', '$0.08/gallon', '$200.00'],
        ['Gas', '85 therms', '$1.25/therm', '$106.25'],
        ['Waste Management', '1 unit', '$45.00/unit', '$45.00'],
        ['Service Fee', '-', 'Flat Rate', '$12.00'],
    ]
    
    charges_table = Table(charges_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    charges_table.setStyle(TableStyle([
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
    story.append(charges_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Previous Balance and Payments
    balance_data = [
        ['Previous Balance:', '$0.00'],
        ['Payments Received:', '-$430.75'],
        ['Adjustments:', '$0.00'],
    ]
    balance_table = Table(balance_data, colWidths=[4*inch, 1.5*inch])
    balance_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(balance_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Totals
    totals_data = [
        ['Subtotal:', '$430.75'],
        ['Tax (7.5%):', '$32.31'],
        ['Total Amount Due:', '$463.06'],
    ]
    totals_table = Table(totals_data, colWidths=[4*inch, 1.5*inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -1), (1, -1), 14),
        ('TEXTCOLOR', (0, -1), (1, -1), colors.HexColor('#e74c3c')),
        ('FONTSIZE', (0, 0), (0, -2), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('LINEABOVE', (0, -1), (1, -1), 2, colors.HexColor('#e74c3c')),
    ]))
    story.append(totals_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Payment Information
    payment_style = ParagraphStyle(
        'Payment',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#7f8c8d'),
        spaceBefore=20,
    )
    story.append(Paragraph("Payment Information:", styles['Heading3']))
    story.append(Paragraph("Pay online at www.citypowerwater.com/pay or mail check to:", payment_style))
    story.append(Paragraph("City Power & Water Company, P.O. Box 12345, San Francisco, CA 94105", payment_style))
    story.append(Paragraph("Include account number on check. Late payment fee: $15.00", payment_style))
    
    # Build PDF
    doc.build(story)
    print(f"✅ Created test Bill PDF: {os.path.abspath(pdf_path)}")
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

