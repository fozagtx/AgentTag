import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { getSiteConfig } from "../lib/db";
import { crawlUrl } from "../lib/firecrawl";
import { runToolAgainstSnapshot } from "../lib/run-tool";

const PORT = parseInt(process.env.PORT || "10000", 10);

// Map of active browser tab WebSocket connections: siteId -> Set<WebSocket>
const activeBrowserTabs = new Map<string, Set<WebSocket>>();

// Map of active SSE client streams: sessionId -> http.ServerResponse
const sseClients = new Map<string, http.ServerResponse>();

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 1. Health check
  if (pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", activeTabs: activeBrowserTabs.size }));
    return;
  }

  // 2. MCP Server-Sent Events (SSE) Endpoint: /mcp/v1/:siteId/sse
  if (pathname.startsWith("/mcp/v1/") && pathname.endsWith("/sse")) {
    const parts = pathname.split("/");
    const siteId = parts[3];

    const sessionId = `session_${Math.random().toString(36).substring(2, 10)}`;
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    sseClients.set(sessionId, res);

    // Send endpoint URI for incoming JSON-RPC POST messages
    const endpointEvent = `event: endpoint\ndata: /mcp/v1/${siteId}/message?sessionId=${sessionId}\n\n`;
    res.write(endpointEvent);

    req.on("close", () => {
      sseClients.delete(sessionId);
    });
    return;
  }

  // 3. MCP JSON-RPC Message Endpoint: POST /mcp/v1/:siteId/message
  if (pathname.startsWith("/mcp/v1/") && pathname.includes("/message") && req.method === "POST") {
    const parts = pathname.split("/");
    const siteId = parts[3];
    const sessionId = url.searchParams.get("sessionId");

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const rpcRequest = JSON.parse(body);
        const rpcResponse = await handleMcpRpc(siteId, rpcRequest);

        // If SSE client exists, send via SSE
        if (sessionId && sseClients.has(sessionId)) {
          const clientRes = sseClients.get(sessionId)!;
          clientRes.write(`event: message\ndata: ${JSON.stringify(rpcResponse)}\n\n`);
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(rpcResponse));
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not found" }));
});

// WebSocket Server for In-Browser WebMCP Clients
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  if (url.pathname === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws, request) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const siteId = url.searchParams.get("site_id") || "default";

  if (!activeBrowserTabs.has(siteId)) {
    activeBrowserTabs.set(siteId, new Set());
  }
  activeBrowserTabs.get(siteId)!.add(ws);
  console.log(`[Relay WS] Tab connected for site: ${siteId}`);

  ws.on("close", () => {
    activeBrowserTabs.get(siteId)?.delete(ws);
  });
});

// Handle MCP Protocol JSON-RPC
async function handleMcpRpc(siteId: string, request: any): Promise<any> {
  const { id, method, params } = request;
  const config = await getSiteConfig(siteId);

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: {
          name: config ? config.title : "WebMCP Server",
          version: "1.0.0",
        },
      },
    };
  }

  if (method === "tools/list") {
    const tools = (config?.tools || [])
      .filter((t) => t.is_enabled)
      .map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.parameters,
      }));

    return {
      jsonrpc: "2.0",
      id,
      result: { tools },
    };
  }

  if (method === "tools/call") {
    const toolName = params?.name;
    const args = params?.arguments || {};

    const tabs = activeBrowserTabs.get(siteId);
    if (tabs && tabs.size > 0) {
      const activeWs = Array.from(tabs)[0];
      if (activeWs.readyState === WebSocket.OPEN) {
        return new Promise((resolve) => {
          const correlationId = Math.random().toString(36);
          const timeout = setTimeout(() => {
            activeWs.off("message", messageHandler);
            resolve(runHeadlessTool(id, siteId, toolName, args));
          }, 5000);

          const messageHandler = (data: any) => {
            try {
              const parsed = JSON.parse(data.toString());
              if (parsed.correlationId === correlationId) {
                clearTimeout(timeout);
                activeWs.off("message", messageHandler);
                resolve({
                  jsonrpc: "2.0",
                  id,
                  result: { content: [{ type: "text", text: JSON.stringify(parsed.result, null, 2) }] },
                });
              }
            } catch {}
          };

          activeWs.on("message", messageHandler);
          activeWs.send(JSON.stringify({ type: "execute_tool", correlationId, toolName, args }));
        });
      }
    }

    return runHeadlessTool(id, siteId, toolName, args);
  }

  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method ${method} not found` },
  };
}

async function runHeadlessTool(
  id: any,
  siteId: string,
  toolName: string,
  args: Record<string, any>
) {
  const config = await getSiteConfig(siteId);
  if (!config) {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32004, message: "Site not found" },
    };
  }

  const tool = config.tools.find((t) => t.name === toolName && t.is_enabled);
  if (!tool) {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32602, message: `Tool ${toolName} is not on this site.` },
    };
  }

  let markdown = config.markdown_snapshot || "";
  try {
    const live = await crawlUrl(config.url);
    if (live.markdown) markdown = live.markdown;
  } catch (err) {
    console.error("[Relay] Live read failed, using stored snapshot:", err);
  }

  if (!markdown) {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32002, message: "Could not read this site." },
    };
  }

  const result = runToolAgainstSnapshot(
    tool.name,
    tool.execution_type,
    args,
    markdown,
    config.url
  );

  return {
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    },
  };
}

server.listen(PORT, () => {
  console.log(`[WebMCP Cloud Relay] Running on port ${PORT}`);
});
