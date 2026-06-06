import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://65.1.135.224:3001";

type Context = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyRequest(request: NextRequest, context: Context) {
  const { path } = await context.params;

  const endpoint = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();

  const targetUrl = `${BACKEND_API_URL}/${endpoint}${
    searchParams ? `?${searchParams}` : ""
  }`;

  const headers = new Headers();

  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (authorization) {
    headers.set("authorization", authorization);
  }

  if (contentType) {
    headers.set("content-type", contentType);
  } else {
    headers.set("content-type", "application/json");
  }

  let body: BodyInit | undefined;

  if (request.method !== "GET" && request.method !== "HEAD") {
    const text = await request.text();
    body = text || undefined;
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseText = await response.text();

    let data: unknown = responseText;

    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = responseText;
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Proxy request failed",
        error: error?.message || "Failed to fetch backend",
        targetUrl,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: NextRequest, context: Context) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: Context) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: Context) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: Context) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: Context) {
  return proxyRequest(request, context);
}