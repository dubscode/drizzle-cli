export async function formatFile(filePath: string): Promise<void> {
  const denoFmt = new Deno.Command('deno', {
    args: ['fmt', filePath],
  });
  await denoFmt.output();
}
