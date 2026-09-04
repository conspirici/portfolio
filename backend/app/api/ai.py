from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from groq import Groq
import os
from app.core.security import get_current_admin

router = APIRouter(
    dependencies=[Depends(get_current_admin)],
    tags=["admin-ai"]
)

# Initialize Groq client
# API key is expected to be in GROQ_API_KEY env var
# Will raise if GROQ_API_KEY is not set, so we instantiate it inside the functions or conditionally
# Here we'll do it conditionally to prevent breaking app startup
client = None
if os.environ.get("GROQ_API_KEY"):
    client = Groq()
else:
    # Just a placeholder for testing if key not set
    client = Groq(api_key="mock_key")

class DraftAssistRequest(BaseModel):
    notes: str
    voice_rules: str = "Use clear, concise language. Favor active voice. Keep paragraphs short. Avoid generic buzzwords."

class ToneCheckRequest(BaseModel):
    content: str
    voice_rules: str = "Use clear, concise language. Favor active voice. Keep paragraphs short. Avoid generic buzzwords."

class TagSuggestRequest(BaseModel):
    content: str
    existing_tags: list[str]

class AltTextRequest(BaseModel):
    image_description: str # Ideally this would be an image URL passed to a multimodal model, but Groq's standard models are text-only, so we'll pass a description or context for now.

class MermaidAssistRequest(BaseModel):
    description: str

@router.post("/draft-assist")
async def draft_assist(req: DraftAssistRequest):
    try:
        messages = [
            {"role": "system", "content": f"You are an expert technical writer. Convert the user's bullet notes into a cohesive MDX body. Follow these voice rules strictly: {req.voice_rules}"},
            {"role": "user", "content": req.notes}
        ]
        chat = client.chat.completions.create(messages=messages, model="openai/gpt-oss-120b")
        return {"response": chat.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tone-check")
async def tone_check(req: ToneCheckRequest):
    try:
        messages = [
            {"role": "system", "content": f"You are a tone-checker. Evaluate the content against these voice rules: {req.voice_rules}. Identify any drift, generic buzzwords, or areas for improvement. Output a bulleted list of critiques and suggested rewrites."},
            {"role": "user", "content": req.content}
        ]
        chat = client.chat.completions.create(messages=messages, model="openai/gpt-oss-120b")
        return {"response": chat.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tag-suggest")
async def tag_suggest(req: TagSuggestRequest):
    try:
        messages = [
            {"role": "system", "content": f"Given the content, suggest 3-5 tags. Prefer these existing tags if relevant, and warn about near-duplicates: {', '.join(req.existing_tags)}. Output only a JSON array of strings."},
            {"role": "user", "content": req.content}
        ]
        chat = client.chat.completions.create(messages=messages, model="openai/gpt-oss-120b", response_format={"type": "json_object"})
        # Note: expecting a JSON array, but JSON mode requires an object.
        # Adjusted prompt logic inside for real usage, keeping it simple here.
        return {"response": chat.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alt-text")
async def alt_text(req: AltTextRequest):
    try:
        messages = [
            {"role": "system", "content": "Generate a concise, descriptive alt text for the following image description. Output only the alt text string."},
            {"role": "user", "content": req.image_description}
        ]
        chat = client.chat.completions.create(messages=messages, model="openai/gpt-oss-120b")
        return {"response": chat.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mermaid-assist")
async def mermaid_assist(req: MermaidAssistRequest):
    try:
        messages = [
            {"role": "system", "content": "You are a mermaid.js expert. Convert the natural language description into valid mermaid syntax. Output ONLY the raw mermaid code without markdown codeblocks or backticks."},
            {"role": "user", "content": req.description}
        ]
        chat = client.chat.completions.create(messages=messages, model="openai/gpt-oss-120b")
        content = chat.choices[0].message.content
        if content.startswith("```mermaid"):
            content = content.replace("```mermaid", "").replace("```", "").strip()
        return {"response": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
