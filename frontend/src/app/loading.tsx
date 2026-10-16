export default function Loading() {
  return (
    <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 py-10">
      <div className="grid w-full gap-4 rounded-xl border p-8 text-center">
        <div className="border-muted border-t-primary mx-auto h-10 w-10 animate-spin rounded-full border-4" />
        <div className="grid gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Loading your workspace
          </h1>
          <p className="text-muted-foreground text-sm">
            The template is pulling together page data and shared app chrome.
          </p>
        </div>
      </div>
    </main>
  );
}
