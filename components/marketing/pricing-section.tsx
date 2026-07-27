"use client";

import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { useT } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const t = useT();
  const free = t.pricing.free;
  const pro = t.pricing.pro;

  const freeFeatures = [free.feature1, free.feature2, free.feature3, free.feature4, free.feature5];
  const proFeatures = [pro.feature1, pro.feature2, pro.feature3, pro.feature4, pro.feature5];

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.pricing.title}</h2>
          <p className="mt-2 text-muted-foreground">{t.pricing.subtitle}</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
          <Reveal>
            <PlanCard
              name={free.name}
              price={free.price}
              period={free.period}
              features={freeFeatures}
            >
              <Button className="w-full" nativeButton={false} render={<Link href="/editor" />}>
                {free.cta}
              </Button>
            </PlanCard>
          </Reveal>

          <Reveal delay={100}>
            <PlanCard
              name={pro.name}
              price={pro.price}
              period={pro.period}
              features={proFeatures}
              badge={pro.badge}
              highlighted
            >
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast(pro.ctaToast)}
              >
                {pro.cta}
              </Button>
            </PlanCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  name,
  price,
  period,
  features,
  badge,
  highlighted = false,
  children,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  badge?: string;
  highlighted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {badge && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium whitespace-nowrap text-primary-foreground">
          {badge}
        </span>
      )}
      <Card
        className={cn(
          "h-full shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
          highlighted
            ? "border-primary/40 hover:shadow-primary/10"
            : "hover:border-foreground/20 hover:shadow-foreground/5",
        )}
      >
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">{name}</p>
          <p className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight">{price}</span>
            <span className="text-sm text-muted-foreground">{period}</span>
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
