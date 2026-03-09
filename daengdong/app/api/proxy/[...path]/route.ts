import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL (NEXT_PUBLIC_API_BASE_URL) is not defined");
}

async function handleProxy(request: NextRequest, path: string[]) {
  const targetPath = path.join("/");

  const url = new URL(request.url);
  const search = url.search || "";

  const targetUrl = `${BACKEND_BASE_URL}/${targetPath}${search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  const init: RequestInit = {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  };

  const backendResponse = await fetch(targetUrl, init);

  const responseHeaders = new Headers(backendResponse.headers);
  const hopByHop = ["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade"];
  hopByHop.forEach((h) => responseHeaders.delete(h));

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

type ProxyRouteParams = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function POST(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function PUT(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function PATCH(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function DELETE(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function OPTIONS(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

