import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, business_name, company, message } = body;

    // Validate email
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid work email address is required." },
        { status: 400 }
      );
    }

    const finalBusinessName = (business_name || company || "").trim();

    const payload = {
      name: (name || "").trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim(),
      company: finalBusinessName,
      business_name: finalBusinessName,
      category: "WhatsApp Automation Early Access",
      services: ["WhatsApp & CRM Automations", "LeadFlow Early Access"],
      message: (message || "").trim(),
    };

    // Forward to existing backend /api/v1/leads if available
    let backendSuccess = false;
    try {
      const backendRes = await fetch(`${API_URL}/api/v1/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });

      if (backendRes.ok) {
        backendSuccess = true;
      }
    } catch {
      // Backend offline or unreachable in local dev; proceed gracefully
      backendSuccess = false;
    }

    return NextResponse.json({
      success: true,
      message: "You're on the early access list! We'll notify you as soon as LeadFlow launches.",
      syncedWithBackend: backendSuccess,
      lead: payload,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Failed to join early access.";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
