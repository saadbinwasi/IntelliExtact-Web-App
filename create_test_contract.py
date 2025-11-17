#!/usr/bin/env python3
"""
Create a test Contract PDF document for extraction testing
"""
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
    import os
    
    # Create PDF
    pdf_path = 'test_contract.pdf'
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    story.append(Paragraph("SERVICE AGREEMENT", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Contract Details
    contract_info = [
        ['Contract Number:', 'CNT-2025-005678'],
        ['Contract Date:', 'December 1, 2025'],
        ['Effective Date:', 'January 1, 2026'],
        ['Expiration Date:', 'December 31, 2026'],
        ['Contract Type:', 'Service Agreement'],
    ]
    info_table = Table(contract_info, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Parties
    parties_style = ParagraphStyle(
        'Parties',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=15,
        spaceBefore=20
    )
    story.append(Paragraph("PARTIES", parties_style))
    
    parties_data = [
        ['Party A (Service Provider):', 'Tech Solutions Inc.'],
        ['', '123 Business Street, San Francisco, CA 94105'],
        ['', 'Tax ID: 12-3456789'],
        ['', 'Contact: John Smith, CEO'],
        ['', 'Email: contracts@techsolutions.com'],
        ['', 'Phone: (555) 123-4567'],
        ['', ''],
        ['Party B (Client):', 'ABC Corporation'],
        ['', '456 Corporate Avenue, New York, NY 10001'],
        ['', 'Tax ID: 98-7654321'],
        ['', 'Contact: Jane Doe, Procurement Manager'],
        ['', 'Email: procurement@abccorp.com'],
        ['', 'Phone: (555) 987-6543'],
    ]
    parties_table = Table(parties_data, colWidths=[2.5*inch, 3.5*inch])
    parties_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 7), (0, 7), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(parties_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Terms
    terms_style = ParagraphStyle(
        'Terms',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=15,
        spaceBefore=20
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.black,
        alignment=TA_JUSTIFY,
        spaceAfter=12,
        leftIndent=0,
        rightIndent=0
    )
    
    story.append(Paragraph("TERMS AND CONDITIONS", terms_style))
    
    terms_text = [
        "1. <b>SCOPE OF SERVICES:</b> Party A agrees to provide software development and maintenance services as specified in the attached Statement of Work (SOW). Services include web application development, API integration, and ongoing technical support.",
        "2. <b>COMPENSATION:</b> Party B agrees to pay Party A a total contract value of $150,000.00, payable in monthly installments of $12,500.00 over 12 months. Payment is due within 30 days of invoice date.",
        "3. <b>TERM:</b> This agreement shall commence on January 1, 2026 and continue until December 31, 2026, unless terminated earlier in accordance with the termination provisions herein.",
        "4. <b>INTELLECTUAL PROPERTY:</b> All work product and deliverables created under this agreement shall be the property of Party B upon full payment. Party A retains rights to pre-existing intellectual property and general methodologies.",
        "5. <b>CONFIDENTIALITY:</b> Both parties agree to maintain strict confidentiality of all proprietary information shared during the term of this agreement and for a period of 3 years thereafter.",
        "6. <b>TERMINATION:</b> Either party may terminate this agreement with 30 days written notice. In case of breach, the non-breaching party may terminate immediately. Upon termination, all outstanding payments become due immediately.",
        "7. <b>LIABILITY:</b> Party A's total liability under this agreement shall not exceed the total contract value. Neither party shall be liable for indirect, incidental, or consequential damages.",
    ]
    
    for term in terms_text:
        story.append(Paragraph(term, body_style))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Signatures
    signature_style = ParagraphStyle(
        'Signature',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=15,
        spaceBefore=20
    )
    story.append(Paragraph("SIGNATURES", signature_style))
    
    signature_data = [
        ['Party A (Service Provider):', 'Party B (Client):'],
        ['', ''],
        ['', ''],
        ['_________________________', '_________________________'],
        ['John Smith, CEO', 'Jane Doe, Procurement Manager'],
        ['Tech Solutions Inc.', 'ABC Corporation'],
        ['Date: _______________', 'Date: _______________'],
    ]
    sig_table = Table(signature_data, colWidths=[3*inch, 3*inch])
    sig_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(sig_table)
    
    # Build PDF
    doc.build(story)
    print(f"✅ Created test Contract PDF: {os.path.abspath(pdf_path)}")
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

