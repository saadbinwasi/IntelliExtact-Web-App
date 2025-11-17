#!/usr/bin/env python3
"""
Create all test documents (Invoice, Contract, Bill) for extraction testing
"""
import subprocess
import sys
import os

def run_script(script_name):
    """Run a Python script and handle errors"""
    try:
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=True, 
                              text=True, 
                              check=True)
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running {script_name}:")
        print(e.stdout)
        print(e.stderr)
        return False

def main():
    print("=" * 60)
    print("Creating Test Documents for Model Testing")
    print("=" * 60)
    print()
    
    scripts = [
        'create_test_invoice.py',
        'create_test_contract.py',
        'create_test_bill.py'
    ]
    
    created_files = []
    
    for script in scripts:
        if os.path.exists(script):
            print(f"\n📄 Creating {script.replace('create_test_', '').replace('.py', '')}...")
            run_script(script)
            # Extract PDF filename from script
            pdf_name = script.replace('create_test_', '').replace('.py', '') + '.pdf'
            if os.path.exists(pdf_name):
                created_files.append(pdf_name)
                file_size = os.path.getsize(pdf_name)
                print(f"   ✅ Created: {pdf_name} ({file_size:,} bytes)")
        else:
            print(f"⚠️  Script not found: {script}")
    
    print("\n" + "=" * 60)
    if created_files:
        print("✅ Successfully created test documents:")
        for file in created_files:
            abs_path = os.path.abspath(file)
            print(f"   📄 {file}")
            print(f"      Location: {abs_path}")
        print("\n💡 You can now upload these PDFs to test your extraction model!")
    else:
        print("❌ No files were created. Please check the errors above.")
    print("=" * 60)

if __name__ == '__main__':
    main()

