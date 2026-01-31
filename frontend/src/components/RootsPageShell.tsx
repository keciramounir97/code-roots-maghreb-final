import { memo, ReactNode } from "react";

interface RootsPageShellProps {
  hero?: ReactNode;
  heroClassName?: string;
  children: ReactNode;
  className?: string;
}

function RootsPageShell({
  hero,
  heroClassName = "",
  children,
  className = "",
}: RootsPageShellProps) {
  return (
    <div className={`roots-shell page-container w-full mx-auto ${className}`}>
      {hero ? (
        <section className={`heritage-hero text-center ${heroClassName}`}>
          {hero}
        </section>
      ) : null}
      <div className="space-y-6 sm:space-y-8 lg:space-y-10 xl:space-y-12">{children}</div>
    </div>
  );
}

export default memo(RootsPageShell);
