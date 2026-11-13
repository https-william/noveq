import { MaisonCharmLoader } from '@/components/ui/MaisonCharmLoader';

export default function Loading() {
  return (
    <div className="min-h-[65vh] w-full flex flex-col items-center justify-center bg-bone px-6 py-24">
      <MaisonCharmLoader size="lg" tone="dark" />
      <span className="mt-4 font-serif text-lg tracking-[0.28em] pl-[0.28em] lowercase text-espresso/75 select-none">
        noveq
      </span>
    </div>
  );
}
