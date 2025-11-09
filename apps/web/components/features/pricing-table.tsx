'use client';

import * as React from 'react';
import { Check, X, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency?: string;
  features: Array<{
    name: string;
    included: boolean;
    tooltip?: string;
  }>;
  popular?: boolean;
  cta?: string;
  badge?: string;
}

export interface PricingTableProps {
  plans: PricingPlan[];
  billingPeriod?: 'monthly' | 'yearly';
  onSelectPlan?: (planId: string) => void;
  className?: string;
}

export function PricingTable({
  plans,
  billingPeriod = 'monthly',
  onSelectPlan,
  className,
}: PricingTableProps) {
  const [period, setPeriod] = React.useState<'monthly' | 'yearly'>(billingPeriod);

  return (
    <div className={cn('space-y-8', className)}>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={cn('text-sm', period === 'monthly' && 'font-semibold')}>
          Monthly
        </span>
        <Switch checked={period === 'yearly'} onCheckedChange={(checked) => setPeriod(checked ? 'yearly' : 'monthly')} />
        <span className={cn('text-sm', period === 'yearly' && 'font-semibold')}>
          Yearly
          <Badge variant="secondary" className="ml-2">
            Save 20%
          </Badge>
        </span>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = period === 'monthly' ? plan.price.monthly : plan.price.yearly;
          const currency = plan.currency || '$';

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative',
                plan.popular && 'border-primary shadow-lg scale-105'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.badge && !plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary">{plan.badge}</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      {currency}{price}
                    </span>
                    <span className="text-muted-foreground">
                      /{period === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {period === 'yearly' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {currency}{(price / 12).toFixed(2)}/month billed annually
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  onClick={() => onSelectPlan?.(plan.id)}
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta || 'Get Started'}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          !feature.included && 'text-muted-foreground line-through'
                        )}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Compact pricing comparison
export function CompactPricing({
  plans,
  billingPeriod = 'monthly',
  className,
}: {
  plans: PricingPlan[];
  billingPeriod?: 'monthly' | 'yearly';
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)}>
      {plans.map((plan) => {
        const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly;
        const currency = plan.currency || '$';

        return (
          <Card key={plan.id} className={cn(plan.popular && 'border-primary')}>
            <CardContent className="p-6 text-center space-y-4">
              <div>
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-2xl font-bold mt-2">
                  {currency}{price}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </p>
              </div>
              <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                Choose Plan
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Feature comparison table
export function PricingComparisonTable({
  plans,
  features,
  className,
}: {
  plans: Array<{ id: string; name: string; popular?: boolean }>;
  features: Array<{
    category: string;
    items: Array<{
      name: string;
      plans: Record<string, boolean | string>;
    }>;
  }>;
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-semibold">Features</th>
            {plans.map((plan) => (
              <th key={plan.id} className="p-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-semibold">{plan.name}</span>
                  {plan.popular && (
                    <Badge variant="default" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((category, catIndex) => (
            <React.Fragment key={catIndex}>
              <tr className="bg-muted/50">
                <td colSpan={plans.length + 1} className="p-3 font-semibold">
                  {category.category}
                </td>
              </tr>
              {category.items.map((item, itemIndex) => (
                <tr key={itemIndex} className="border-b">
                  <td className="p-4">{item.name}</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="p-4 text-center">
                      {typeof item.plans[plan.id] === 'boolean' ? (
                        item.plans[plan.id] ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{item.plans[plan.id]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Simple price card
export function PriceCard({
  title,
  price,
  period = 'month',
  currency = '$',
  features,
  cta,
  onSelect,
  popular,
  className,
}: {
  title: string;
  price: number;
  period?: string;
  currency?: string;
  features: string[];
  cta?: string;
  onSelect?: () => void;
  popular?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn(popular && 'border-primary', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="mt-4">
          <span className="text-3xl font-bold">
            {currency}{price}
          </span>
          <span className="text-muted-foreground">/{period}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={onSelect} className="w-full" variant={popular ? 'default' : 'outline'}>
          {cta || 'Get Started'}
        </Button>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Enterprise pricing CTA
export function EnterprisePricing({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Enterprise</h3>
          <p className="text-muted-foreground mt-2">
            Custom solutions for large organizations
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm">
            ✓ Unlimited everything<br />
            ✓ Advanced security<br />
            ✓ Dedicated support<br />
            ✓ Custom integrations<br />
            ✓ SLA guarantees
          </p>
        </div>
        <Button size="lg" className="w-full">
          Contact Sales
        </Button>
      </CardContent>
    </Card>
  );
}

