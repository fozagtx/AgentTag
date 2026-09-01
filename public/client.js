/**
 * In-page WebMCP host. Tools register from the canvas.
 * Agents can call window.WebMCP or postMessage JSON-RPC.
 */
(function () {
  if (window.__WEBMCP_INITIALIZED__) return;
  window.__WEBMCP_INITIALIZED__ = true;

  const registry = new Map();

  window.WebMCP = {
    registerTool: function (tool) {
      if (!tool || !tool.name) return;
      registry.set(tool.name, tool);
    },
    getTools: function () {
      return Array.from(registry.values()).map((t) => ({
        name: t.name,
        description: t.description || "",
        inputSchema: t.parameters || t.inputSchema || { type: "object", properties: {} },
        requires_approval: !!t.requires_approval,
      }));
    },
    executeTool: async function (toolName, args) {
      const tool = registry.get(toolName);
      if (!tool) throw new Error(`Unknown tool: ${toolName}`);
      if (tool.requires_approval) {
        const ok = await ask(toolName, args || {});
        if (!ok) return { error: "Cancelled in the browser." };
      }
      if (typeof tool.handler === "function") return await tool.handler(args || {});
      throw new Error(`Tool ${toolName} has no handler.`);
    },
  };

  function ask(toolName, args) {
    return new Promise((resolve) => {
      const existing = document.getElementById("webmcp-toast");
      if (existing) existing.remove();
      const toast = document.createElement("div");
      toast.id = "webmcp-toast";
      toast.style.cssText =
        "position:fixed;bottom:24px;right:24px;z-index:999999;background:#111;color:#fff;border:1px solid rgba(255,107,74,.5);border-radius:12px;padding:16px 20px;font:14px/1.4 Inter,sans-serif;max-width:360px;";
      toast.innerHTML =
        "<div style='font-weight:600;margin-bottom:8px'>Agent wants to run " +
        escapeHtml(toolName) +
        "</div><pre style='font-size:11px;background:#1a1a1a;padding:8px;border-radius:8px;overflow:auto'>" +
        escapeHtml(JSON.stringify(args, null, 2)) +
        "</pre><div style='display:flex;gap:8px;justify-content:flex-end;margin-top:12px'><button id='webmcp-no' style='background:#222;color:#ddd;border:0;padding:8px 12px;border-radius:8px'>No</button><button id='webmcp-yes' style='background:#e6e6e6;color:#2f3031;border:0;padding:8px 12px;border-radius:8px;font-weight:600'>Yes</button></div>";
      document.body.appendChild(toast);
      document.getElementById("webmcp-yes").onclick = () => {
        toast.remove();
        resolve(true);
      };
      document.getElementById("webmcp-no").onclick = () => {
        toast.remove();
        resolve(false);
      };
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  window.addEventListener("message", async (event) => {
    const msg = event.data;
    if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return;
    const id = msg.id;
    const reply = (result, error) => {
      const payload = error
        ? { jsonrpc: "2.0", id, error }
        : { jsonrpc: "2.0", id, result };
      if (event.source && event.source.postMessage) {
        event.source.postMessage(payload, event.origin || "*");
      }
    };
    try {
      if (msg.method === "tools/list") {
        reply({ tools: window.WebMCP.getTools() });
        return;
      }
      if (msg.method === "tools/call") {
        const name = msg.params?.name;
        const args = msg.params?.arguments || msg.params?.args || {};
        const out = await window.WebMCP.executeTool(name, args);
        reply({ content: [{ type: "text", text: JSON.stringify(out) }] });
        return;
      }
      reply(null, { code: -32601, message: "Unknown method" });
    } catch (err) {
      reply(null, { code: -32000, message: err.message || "Tool failed" });
    }
  });
})();
