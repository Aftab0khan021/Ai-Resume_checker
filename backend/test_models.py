import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables from .env file if it exists
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("EMERGENT_LLM_KEY")

if not api_key:
    print("❌ Error: GEMINI_API_KEY not found in environment")
    exit(1)

print(f"🔑 Using API Key: {api_key[:5]}...{api_key[-5:]}")

try:
    genai.configure(api_key=api_key)
    print("\n📡 Listing available models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
            
    print("\n✨ Testing generation with 'gemini-pro'...")
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Hello")
    print(f"✅ Success! Response: {response.text}")

except Exception as e:
    print(f"\n❌ Error: {e}")
