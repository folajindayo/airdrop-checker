"use client";

import React from "react";
import Card from "../ui/Card";
import Badge, { BadgeWithDot } from "../ui/Badge";
import Button from "../ui/Button";

interface AirdropCardProps {
  name: string;
  logo?: string;
  status: "active" | "upcoming" | "ended";
  eligibility?: boolean;
  amount?: string;
  claimBy?: string;
  description?: string;
  onClaim?: () => void;
  onCheckEligibility?: () => void;
}

/**
 * AirdropCard Component
 * Displays airdrop information with claim functionality
 */
export default function AirdropCard({
  name,
  logo,
  status,
  eligibility,
  amount,
  claimBy,
  description,
  onClaim,
  onCheckEligibility,
}: AirdropCardProps) {
  const statusVariant = {
    active: "success" as const,
    upcoming: "warning" as const,
    ended: "default" as const,
  };

  const statusLabel = {
    active: "Active",
    upcoming: "Upcoming",
    ended: "Ended",
  };

  return (
    <Card hover padding="md" className="h-full">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {logo && (
            <img
              src={logo}
              alt={name}
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            {amount && (
              <p className="text-sm text-gray-600">Est. {amount}</p>
            )}
          </div>
        </div>
        <BadgeWithDot variant={statusVariant[status]}>
          {statusLabel[status]}
        </BadgeWithDot>
      </div>

      {description && (
        <p className="mt-3 text-sm text-gray-700 line-clamp-2">{description}</p>
      )}

      {eligibility !== undefined && (
        <div className="mt-4">
          {eligibility ? (
            <Badge variant="success">✓ Eligible</Badge>
          ) : (
            <Badge variant="danger">✗ Not Eligible</Badge>
          )}
        </div>
      )}

      {claimBy && (
        <p className="mt-3 text-xs text-gray-500">Claim by: {claimBy}</p>
      )}

      <div className="mt-4 flex gap-2">
        {eligibility && onClaim && status === "active" && (
          <Button variant="primary" size="sm" fullWidth onClick={onClaim}>
            Claim Airdrop
          </Button>
        )}
        {eligibility === undefined && onCheckEligibility && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={onCheckEligibility}
          >
            Check Eligibility
          </Button>
        )}
      </div>
    </Card>
  );
}

