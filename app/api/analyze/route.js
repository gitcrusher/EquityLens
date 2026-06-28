import { NextResponse } from 'next/server';
import { analyzeCompany } from '../../../lib/orchestrator.js';

export async function POST(request) {
  let body;
  
  // 1. Safe JSON Parsing
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json(
      { type: "error", message: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const { companyName } = body;

  // 2. Strict Input Validation (Type, Empty, Max Length)
  if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
    return NextResponse.json(
      { type: "error", message: "A valid company name or ticker is required." },
      { status: 400 }
    );
  }

  if (companyName.length > 100) {
    return NextResponse.json(
      { type: "error", message: "Company name exceeds maximum length of 100 characters." },
      { status: 400 }
    );
  }

  const query = companyName.trim();
  console.log(`[API] Processing analysis request for: "${query}"`);

  // 3. Orchestration
  try {
    // The orchestrator returns { type: "disambiguation" | "result" | "error" }
    const result = await analyzeCompany(query);

    // 4. Normalize orchestrator type to match EDD API contract
    // The orchestrator returns a flat object with type: "analysis", 
    // but the EDD specifies: { type: "result", analysis: { ... } }.
    if (result.type === "analysis") {
      const { type, ...analysisData } = result;
      return NextResponse.json({ type: "result", analysis: analysisData }, { status: 200 });
    }

    // 5. RESTful Status Code Mapping
    if (result.type === "error") {
      const isNotFound = result.message.toLowerCase().includes("not found");
      const status = isNotFound ? 404 : 400;
      
      console.warn(`[API] Orchestrator returned error (${status}): ${result.message}`);
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    // 5. Secure Error Handling (Prevent stack trace leaks)
    console.error("[API] Unhandled Route Exception:", error);
    return NextResponse.json(
      { type: "error", message: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
