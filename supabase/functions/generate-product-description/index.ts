// Stub — returns a placeholder Persian description
Deno.serve(async (req) => {
  const { name, category } = await req.json();
  const description = `${name} — محصول تازه و باکیفیت${category ? ` در دسته ${category}` : ""}.`;
  return Response.json({ description });
});
