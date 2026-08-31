/**
 * WebMCP In-Browser Runtime Client v1.0.0
 * Turn any website into an AI-agent-ready MCP server with 1 script tag.
 */
(function () {
  if (window.__WEBMCP_INITIALIZED__) return;
  window.__WEBMCP_INITIALIZED__ = true;

  // Extract site ID from script tag attribute
  const currentScript =
    document.currentScript ||
    document.querySelector("script[data-site-id]") ||
    document.querySelector('script[src*="client.js"]');
  const siteId = currentScript ? currentScript.getAttribute("data-site-id") : null;
  const relayUrl = currentScript?.getAttribute("data-relay-url") || "https://webmcp-relay.onrender.com";

  console.log("[WebMCP] Initializing runtime for site:", siteId || "inline");

  const registry = {
    tools: new Map(),
    siteConfig: null,
  };

  // Public SDK exposed on window
  window.WebMCP = {
    registerTool: function (tool) {
      registry.tools.set(tool.name, tool);
      console.log(`[WebMCP] Registered tool: ${tool.name}`);
    },
    getTools: function () {
      return Array.from(registry.tools.values());
    },
    executeTool: async function (toolName, args) {
      const tool = registry.tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool ${toolName} not found in WebMCP registry.`);
      }

      // Check Human-in-the-Loop (HITL) permission
      if (tool.requires_approval) {
        const approved = await showApprovalToast(toolName, args);
        if (!approved) {
          return { error: "Action cancelled by user in browser" };
        }
      }

      if (typeof tool.handler === "function") {
        return await tool.handler(args);
      }

      // Default DOM execution strategies
      if (tool.execution_type === "dom_search") {
        return executeDomSearch(args.query);
      }

      return {
        message: `Executed tool ${toolName}`,
        args: args,
        url: window.location.href,
        title: document.title,
      };
    },
  };

  // Perform in-page DOM search
  function executeDomSearch(query) {
    if (!query) return { results: [] };
    const q = query.toLowerCase();
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, [role='heading']"));
    const matches = [];

    for (const h of headings) {
      const text = h.innerText || h.textContent;
      if (text && text.toLowerCase().includes(q)) {
        // Grab following sibling paragraph or content
        let content = "";
        let sibling = h.nextElementSibling;
        let count = 0;
        while (sibling && count < 3) {
          content += (sibling.innerText || sibling.textContent) + "\n";
          sibling = sibling.nextElementSibling;
          count++;
        }
        matches.push({
          heading: text.trim(),
          content: content.trim().slice(0, 500),
          url: window.location.href + (h.id ? `#${h.id}` : ""),
        });
      }
    }

    return {
      query: query,
      total_matches: matches.length,
      results: matches.slice(0, 5),
    };
  }

  // Render on-screen Human-In-The-Loop (HITL) Toast
  function showApprovalToast(toolName, args) {
    return new Promise((resolve) => {
      const existing = document.getElementById("webmcp-toast");
      if (existing) existing.remove();

      const toast = document.createElement("div");
      toast.id = "webmcp-toast";
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        background: #111116;
        color: #ffffff;
        border: 1px solid #3b82f6;
        border-radius: 12px;
        padding: 16px 20px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 12px 32px rgba(0,0,0,0.5);
        max-width: 380px;
        font-size: 14px;
      `;

      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 600; color: #60a5fa;">
          <span>🤖 AI Agent Requesting Action</span>
        </div>
        <div style="font-size: 13px; color: #d1d5db; margin-bottom: 12px;">
          Tool: <b style="color: #fff;">${toolName}</b><br>
          <pre style="background: #1e1e24; padding: 6px; border-radius: 6px; margin-top: 6px; font-size: 11px; overflow-x: auto;">${JSON.stringify(args, null, 2)}</pre>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button id="webmcp-reject" style="background: #27272a; color: #e4e4e7; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Reject</button>
          <button id="webmcp-approve" style="background: #2563eb; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">Approve</button>
        </div>
      `;

      document.body.appendChild(toast);

      document.getElementById("webmcp-approve").onclick = () => {
        toast.remove();
        resolve(true);
      };
      document.getElementById("webmcp-reject").onclick = () => {
        toast.remove();
        resolve(false);
      };
    });
  }

  // Render floating "Agent-Ready" badge
  function renderBadge() {
    if (document.getElementById("webmcp-badge")) return;
    const badge = document.createElement("div");
    badge.id = "webmcp-badge";
    badge.title = "This site is WebMCP Agent-Ready";
    badge.style.cssText = `
      position: fixed;
      bottom: 16px;
      left: 16px;
      z-index: 999990;
      background: rgba(17, 17, 22, 0.85);
      backdrop-filter: blur(8px);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 20px;
      padding: 6px 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      transition: all 0.2s ease;
    `;
    badge.innerHTML = `<span style="display: inline-block; width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></span> Agent-Ready`;
    badge.onmouseenter = () => (badge.style.borderColor = "#3b82f6");
    badge.onmouseleave = () => (badge.style.borderColor = "rgba(59, 130, 246, 0.3)");
    badge.onclick = () => {
      alert(`[WebMCP]\nSite ID: ${siteId || "Inline"}\nRegistered Tools: ${Array.from(registry.tools.keys()).join(", ") || "Auto-detecting"}`);
    };
    document.body.appendChild(badge);
  }

  // Initialize and register default DOM hooks
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      renderBadge();
    });
  } else {
    renderBadge();
  }
})();
