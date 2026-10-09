import { Photo } from "@/components/photo";

export function AuthShell({ title, blurb, children }: { title: string; blurb: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div className="order-2 lg:order-1">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-ink-soft">{blurb}</p>
        <div className="mt-6 max-w-md">{children}</div>
      </div>
      <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-[2rem] ring-1 ring-line lg:order-2">
        <Photo imageKey="scene-pickup" sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
    </div>
  );
}
