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
    <div className={`roots-shell ${className}`}>
      {hero ? (
        <section className={`heritage-hero text-center ${heroClassName}`}>
          {hero}
        </section>
      ) : null}
      <div className="space-y-10">{children}</div>
    </div>
  );
}

export default memo(RootsPageShell);
