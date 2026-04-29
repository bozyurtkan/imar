export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const accept = request.headers.get("Accept") || "";

    // Homepage Markdown Negotiation
    if (url.pathname === "/" && accept.includes("text/markdown")) {
      try {
        const response = await env.ASSETS.fetch(new URL("/index.md", request.url));
        if (response.ok) {
          const body = await response.text();
          const tokens = body.split(/\s+/).length;
          return new Response(body, {
            headers: {
              "Content-Type": "text/markdown; charset=utf-8",
              "x-markdown-tokens": tokens.toString(),
              "Vary": "Accept",
              "Cache-Control": "public, max-age=3600"
            }
          });
        }
      } catch (e) {
        // Fallback to default if index.md not found
      }
    }

    // Default behavior: serve static assets
    return env.ASSETS.fetch(request);
  }
};
