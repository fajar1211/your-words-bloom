import { ReactNode, useMemo } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

type StepKey = "domain" | "design" | "details" | "plan" | "payment";

type Step = {
  key: StepKey;
  label: string;
};

function stepIndex(steps: Step[], activeKey: Step["key"]) {
  const idx = steps.findIndex((s) => s.key === activeKey);
  return idx === -1 ? 0 : idx;
}

export function OrderLayout({
  title,
  step,
  children,
  sidebar,
}: {
  title: string;
  step: StepKey;
  children: ReactNode;
  sidebar: ReactNode | null;
}) {
  const { t } = useI18n();

  const steps = useMemo<Step[]>(
    () => [
      { key: "domain", label: t("order.step.domain") },
      { key: "design", label: t("order.step.design") },
      { key: "details", label: t("order.step.details") },
      { key: "plan", label: t("order.step.plan") },
      { key: "payment", label: t("order.step.payment") },
    ],
    [t],
  );

  const active = stepIndex(steps, step);

  return (
    <PublicLayout>
      <main className="container py-10 md:py-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
          <div className="mt-4">
            <Card className="border-0 bg-muted/40">
              <CardContent className="py-4">
                <ol className="grid grid-cols-2 gap-y-3 gap-x-4 md:grid-cols-5">
                  {steps.map((s, idx) => (
                    <li key={s.key} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full border flex items-center justify-center text-xs font-semibold",
                          idx <= active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border",
                        )}
                      >
                        {idx + 1}
                      </div>
                      <span className={cn("text-sm", idx <= active ? "text-foreground" : "text-muted-foreground")}>
                        {s.label}
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </header>

        <section className={cn("grid gap-6", sidebar ? "lg:grid-cols-[1fr_360px]" : "")}>
          <div>{children}</div>
          {sidebar ? <aside className="lg:sticky lg:top-6 h-fit">{sidebar}</aside> : null}
        </section>
      </main>
    </PublicLayout>
  );
}

