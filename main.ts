// main.ts: Starts basic webserver to serve html and javascripts and passes on websocket handling to server.ts

import { message, open, close, clients, players } from "./server/server";

async function httpRequest(req: Request, server: Bun.Server): Promise<Response | undefined> {
  const url = new URL(req.url);
  const remoteIP = server.requestIP(req);

  // Check if path is /ws and client tries to do a WebSocket upgrade, let Bun handle it.
  if (url.pathname === "/ws" && server.upgrade(req, { data: { remoteIP } })) {
    return;
  }

  // Serve / and /index.html, otherwise check if files exists and serve them.
  if (url.pathname === "/" || url.pathname === "/index.html") {
    const filePath = import.meta.dir + "/client" + "/index.html";
    console.log("Serving file: ", filePath);
    return new Response(Bun.file(filePath));
  } else if (url.pathname === "/.well-known/appspecific/com.chrome.devtools.json") {
    // Handle Chrome DevTools.
    const respone = {
      workspace: {
        "root": import.meta.dir,
        "uuid": crypto.randomUUID()
      }
    }
    console.log("Handling Chrome DevTools.");
    return new Response(respone as any);

  } else {
    const filePath = import.meta.dir + "/client" + url.pathname;
    const file = Bun.file(filePath);
    if (await file.exists()) {
      console.log("Serving file: ", filePath);
      return new Response(file);
    }
  }
  // Fallback for other routes
  console.log("Not found: ", url.pathname);
  return new Response("Not Found", { status: 404 });
}

// Start server.
export const server = Bun.serve({
  port: 1337,
  fetch: httpRequest,
  websocket: {
    open: open,
    message: message,
    close: close,
  }
})

// Enable raw mode to get keypresses immediately.
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

console.log("Listening on http://localhost:1337, press 'q' to quit and 'c' to print client connection info.");

process.stdin.on("data", (key: string) => {
  if (key === "q" || key === "\u0003") { // '\u0003' is Ctrl+C
    console.log("Exiting...");
    process.exit();
  } else if (key === "c") {
    console.log(Bun.inspect.table(clients, ["remoteIP", "name", "connectedAt"]))
  } else if (key === "p") {
    console.log(players);
  }
})
