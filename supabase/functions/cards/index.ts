import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const MOCK_CONTENT = {
  game: "riftbound",
  version: "mock-1",
  lastUpdated: new Date().toISOString(),
  sets: [],
};

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (_req, _ctx) => {
      try {
        const key = Deno.env.get("RIOT_API_KEY");

        if (!key?.trim()) {
          return Response.json({
            success: false,
            mode: "mock",
            reason: "Missing RIOT_API_KEY",
            data: MOCK_CONTENT,
          });
        }

        const endpoints = [
          "https://americas.api.riotgames.com/riftbound/content/v1/content?locale=en",
          // fallback (in case routing differs)
          "https://europe.api.riotgames.com/riftbound/content/v1/content?locale=en",
        ];

        const results: any[] = [];

        for (const url of endpoints) {
          const start = Date.now();

          console.log("➡️ Requesting:", url);
          console.log("🔑 API Key length:", key.length);

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "X-Riot-Token": key.trim(),
              "User-Agent": "riftbound-debug/1.0",
              "Accept": "application/json",
            },
          });

          const duration = Date.now() - start;
          const responseText = await response.text();

          const headersObj: Record<string, string> = {};
          response.headers.forEach((v, k) => {
            headersObj[k] = v;
          });

          results.push({
            url,
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            durationMs: duration,
            responseHeaders: headersObj,
            responseBody: safeJson(responseText),
          });
        }

        return Response.json({
          success: true,
          debug: {
            keyPresent: !!key,
            keyLength: key.length,
            timestamp: new Date().toISOString(),
          },
          results,
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    },
  ),
};

// safely parse JSON or return raw
function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}