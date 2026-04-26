"use client";
import { useState } from "react";
import { Mail, Phone, Star, Building2, CreditCard, FileText, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RfqStatusBadge } from "@/components/rfq/rfq-status-badge";
import { getRfqsByCustomer, getClaimsByCustomer } from "@/data/seed-data";
import { formatCurrency, formatPct, formatDate } from "@/lib/utils";
import type { Customer } from "@/types";
import { toast } from "sonner";
import Link from "next/link";

interface CustomerProfileProps {
  customer: Customer;
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  const rfqs = getRfqsByCustomer(customer.id);
  const claims = getClaimsByCustomer(customer.id);
  const [notes, setNotes] = useState(customer.notes ?? "");

  const wonRfqs = rfqs.filter((r) => r.status === "WON");
  const totalRevenue = wonRfqs.reduce((s, r) => s + (r.annualRevenue ?? 0), 0);
  const avgMargin = wonRfqs.length > 0
    ? wonRfqs.reduce((s, r) => s + (r.grossMarginPct ?? 0), 0) / wonRfqs.length
    : 0;
  const openClaims = claims.filter((c) => ["OPEN", "IN_PROGRESS"].includes(c.status));
  const claimsValue = openClaims.reduce((s, c) => s + (c.value ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
              {customer.flag}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">{customer.name}</h2>
              <p className="text-muted-foreground">{customer.industry} · {customer.country}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                {customer.paymentTerms && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CreditCard size={13} />
                    {customer.paymentTerms}
                  </div>
                )}
                {customer.creditRating && (
                  <Badge variant={customer.creditRating.startsWith("A") ? "success" : "warning"}>
                    {customer.creditRating}
                  </Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="rounded-lg border border-border bg-muted/20 px-4 py-2">
                <p className="text-xs text-muted-foreground">Won Revenue</p>
                <p className="text-lg font-bold">{formatCurrency(totalRevenue, "EUR", true)}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 px-4 py-2">
                <p className="text-xs text-muted-foreground">Avg Margin</p>
                <p className="text-lg font-bold">{avgMargin > 0 ? formatPct(avgMargin) : "—"}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 px-4 py-2">
                <p className="text-xs text-muted-foreground">Open Claims</p>
                <p className={`text-lg font-bold ${openClaims.length > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  {openClaims.length}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 px-4 py-2">
                <p className="text-xs text-muted-foreground">Claims Value</p>
                <p className="text-lg font-bold text-red-400">
                  {claimsValue > 0 ? formatCurrency(claimsValue, "EUR", true) : "€0"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="rfqs">RFQs ({rfqs.length})</TabsTrigger>
          <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Contacts */}
        <TabsContent value="contacts" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customer.contacts.map((contact) => (
              <Card key={contact.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{contact.name}</p>
                        {contact.isPrimary && <Star size={12} className="text-amber-400 fill-amber-400" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{contact.role}</p>
                      <div className="mt-2 space-y-1">
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                          <Mail size={11} />{contact.email}
                        </a>
                        {contact.phone && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone size={11} />{contact.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* RFQs */}
        <TabsContent value="rfqs" className="mt-4">
          <Card>
            <CardContent className="pt-4 p-0">
              <div className="divide-y divide-border">
                {rfqs.length === 0 && <p className="text-sm text-muted-foreground p-6 text-center">No RFQs yet</p>}
                {rfqs.map((rfq) => (
                  <Link key={rfq.id} href={`/rfq/${rfq.id}`}>
                    <div className="flex items-center gap-4 px-4 py-3 hover:bg-accent transition-colors">
                      <div>
                        <p className="text-xs font-mono text-muted-foreground">{rfq.rfqNumber}</p>
                        <p className="text-sm font-medium">{rfq.projectName}</p>
                      </div>
                      <RfqStatusBadge status={rfq.status} />
                      <div className="ml-auto text-right">
                        <p className="text-sm font-semibold">{rfq.annualRevenue ? formatCurrency(rfq.annualRevenue, rfq.currency, true) : "—"}</p>
                        <p className="text-xs text-muted-foreground">{rfq.grossMarginPct ? formatPct(rfq.grossMarginPct) : "—"}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims */}
        <TabsContent value="claims" className="mt-4">
          <Card>
            <CardContent className="pt-4 p-0">
              <div className="divide-y divide-border">
                {claims.length === 0 && <p className="text-sm text-muted-foreground p-6 text-center">No claims</p>}
                {claims.map((claim) => (
                  <div key={claim.id} className="flex items-start gap-3 px-4 py-3">
                    <Badge variant={
                      claim.priority === "CRITICAL" ? "danger" :
                      claim.priority === "HIGH" ? "warning" :
                      claim.priority === "MEDIUM" ? "info" : "secondary"
                    } className="shrink-0 mt-0.5">{claim.priority}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{claim.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(claim.createdAt)} · {claim.status.replace("_", " ")}</p>
                    </div>
                    {claim.value ? (
                      <p className="text-sm font-semibold text-red-400 shrink-0">{formatCurrency(claim.value, "EUR", true)}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="mt-4">
          <div className="space-y-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this customer..."
              className="min-h-[160px]"
            />
            <Button size="sm" onClick={() => toast.success("Notes saved")}>Save Notes</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
