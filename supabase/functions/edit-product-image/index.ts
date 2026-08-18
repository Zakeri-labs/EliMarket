// Stub — returns original image URL until AI pipeline is implemented
Deno.serve(async (req) => {
  const { imageUrl } = await req.json();
  return Response.json({ url: imageUrl });
});
