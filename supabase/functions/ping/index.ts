Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  let name = 'world';
  try {
    const body = await req.json();
    if (body?.name) name = body.name;
  } catch (_) {
    // empty body is fine
  }

  return Response.json(
    { message: `pong — hello ${name}`, time: new Date().toISOString() },
    { headers: cors },
  );
});