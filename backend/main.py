import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # 1. Import CORS
from pydantic import BaseModel
import ollama
from supabase import create_client, Client
from dotenv import load_dotenv # 2. Import dotenv

# 3. Load the variables from your .env file BEFORE doing anything else
load_dotenv()

app = FastAPI()

# 4. Enable CORS so Next.js can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase connection safely
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials. Check your .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Define the exact JSON schema you want Gemma 4 to return
class CampusIssue(BaseModel):
    category: str
    urgency_level: int
    summary: str
    is_duplicate_likely: bool

# Define the incoming JSON payload from your Next.js frontend
class IssueRequest(BaseModel):
    description: str
    location: str | None = None
    image_url: str | None = None

@app.post("/process-issue")
async def process_issue(request: IssueRequest):
    try:
        # 1. GENERATE VECTOR EMBEDDING
        embed_response = ollama.embeddings(model="all-minilm", prompt=request.description)
        # Using dictionary access for compatibility with all ollama-python versions
        embedding_vector = embed_response["embedding"] 

        # 2. QUERY SUPABASE FOR DUPLICATES
        match_result = supabase.rpc(
            "match_documents",
            {
                "query_embedding": embedding_vector,
                "match_threshold": 0.85, 
                "match_count": 1
            }
        ).execute()

        # 3. HANDLE DUPLICATE LOGIC
        if match_result.data and len(match_result.data) > 0:
            return {
                "status": "duplicate",
                "message": "A similar issue was already reported.",
                "existing_issue": match_result.data[0]
            }

        # 4. STRUCTURED AI CATEGORIZATION (Gemma)
        prompt = f"Analyze this campus issue: '{request.description}'. Categorize it into Plumbing, IT, Facilities, or General."
        
        chat_response = ollama.chat(
            model="gemma4:e4b",
            messages=[{"role": "user", "content": prompt}],
            format=CampusIssue.model_json_schema()
        )
        
        # Using dictionary access for the chat response
        ai_analysis = CampusIssue.model_validate_json(chat_response["message"]["content"])

        # 5. INSERT NEW ISSUE INTO POSTGRES
        new_issue_data = {
            "description": request.description,
            "category": ai_analysis.category,
            "status": "Reported",
            "location": request.location,
            "image_url": request.image_url,
            "embedding": embedding_vector
        }
        
        insert_result = supabase.table("issues").insert(new_issue_data).execute()
        
        return {
            "status": "success",
            "ai_analysis": ai_analysis.model_dump(),
            "inserted_issue": insert_result.data[0]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))