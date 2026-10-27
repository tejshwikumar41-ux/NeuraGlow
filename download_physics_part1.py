import os
import shutil
import requests
from bulk_ingest import ingest_all_pdfs

# NCERT Class 11 Physics Part 1 Chapter Mapping
PHYSICS_CHAPTERS = {
    "https://ncert.nic.in/textbook/pdf/keph101.pdf": "Physics_UnitsAndMeasurements.pdf",
    "https://ncert.nic.in/textbook/pdf/keph102.pdf": "Physics_MotionInAStraightLine.pdf",
    "https://ncert.nic.in/textbook/pdf/keph103.pdf": "Physics_MotionInAPlane.pdf",
    "https://ncert.nic.in/textbook/pdf/keph104.pdf": "Physics_LawsOfMotion.pdf",
    "https://ncert.nic.in/textbook/pdf/keph105.pdf": "Physics_WorkEnergyAndPower.pdf",
    "https://ncert.nic.in/textbook/pdf/keph106.pdf": "Physics_SystemOfParticlesAndRotationalMotion.pdf",
    "https://ncert.nic.in/textbook/pdf/keph107.pdf": "Physics_Gravitation.pdf"
}

PDF_FOLDER = "pdf_library"

def download_and_setup():
    if not os.path.exists(PDF_FOLDER):
        os.makedirs(PDF_FOLDER)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://ncert.nic.in/textbook.php"
    }

    print("🚀 Starting download of Class 11 Physics Part 1 chapters...\n")

    base_dir = os.path.dirname(os.path.abspath(__file__))

    for url, formatted_filename in PHYSICS_CHAPTERS.items():
        file_path = os.path.join(PDF_FOLDER, formatted_filename)
        
        if os.path.exists(file_path):
            print(f"⏭️  Already exists: {formatted_filename}")
            continue

        raw_code = os.path.basename(url)
        local_candidate = os.path.join(base_dir, raw_code)

        print(f"📥 Downloading: {formatted_filename} ...")
        download_success = False

        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code == 200:
                with open(file_path, "wb") as f:
                    f.write(res.content)
                print(f"   ✅ Saved as: {formatted_filename}\n")
                download_success = True
            else:
                print(f"   ❌ Failed to download (Status Code: {res.status_code})\n")
        except Exception as e:
            print(f"   ⚠️ Network fetch error: {e}")

        # Seamless fallback if NCERT connection was refused/aborted
        if not download_success and os.path.exists(local_candidate):
            shutil.copyfile(local_candidate, file_path)
            print(f"   ✅ Sourced from local {raw_code} and saved as: {formatted_filename}\n")

    print("🎉 All Physics Class 11 Part 1 chapters downloaded and renamed!")
    print("⚡ Starting automatic bulk upload to Supabase...\n")
    
    # Run the bulk ingestion automatically
    ingest_all_pdfs(PDF_FOLDER)

if __name__ == "__main__":
    download_and_setup()
