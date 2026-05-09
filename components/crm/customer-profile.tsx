"use client";
import { useState } from "react";
import { Mail, Phone, Building2, CreditCard, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getClaimsByCustomer } from "@/data/seed-data";
import { formatCurrency } from "@/lib/utils";
import type { Customer } from "@/types";
import { toast } from "sonner";

interface CustomerProfileProps {
  customer: Customer;
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  const claims = getClaimsByCustomer(customer.id);
  const [notes, setNotes] = useState("");

  const openClaims = claims.filter((c) => ["OPEN", "IN_PROGRESS"].includes(c.status));
  const claimsValue = openClaims.reduce((s, c) => s + (c.value ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">{customer.name}</h2>
              <p className="text-muted-foreground">{customer.segment} · {customer.country}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                {customer.paymentTerms && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CreditCard size={13} />
                    Net {customer.paymentTerms} days
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="rounded-lg border border-border bg-muted/20 px-4 py-2">
                <p className="text-xs text-muted-foreground">Annual Revenue</p>
                <p className="text-lg font-bold">{customer.annualRevenue ? formatCurrency(customer.annualRevenue) : "—"}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 px-4 py-2">
                <p className="text-xs text-muted-foreground">Credit Limit</p>
                <p className="text-lg font-bold">{customer.creditLimit ? formatCurrency(customer.creditLimit) : "—"}</p>
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
                  {claimsValue > 0 ? formatCurrency(claimsValue) : "€0"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Contacts */}
        <TabsContent value="contacts" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customer.contacts.map((contact, i) => (
              <Card key={i}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{contact.name}</p>
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

        {/* Claims */}
        <TabsContent value="claims" className="mt-4">
          <Card>
            <CardContent className="pt-4 p-0">
              <div className="divide-y divide-border">
                {claims.length === 0 && <p className="text-sm text-muted-foreground p-6 text-center">No claims</p>}
                {claims.map((claim) => (
                  <div key={claim.id} className="flex items-start gap-3 px-4 py-3">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{claim.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{claim.openDate} · {claim.status.replace("_", " ")}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px]">{claim.priority}</Badge>
                      {claim.value ? (
                        <p className="text-sm font-semibold text-red-400">{formatCurrency(claim.value)}</p>
                      ) : null}
                    </div>
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
