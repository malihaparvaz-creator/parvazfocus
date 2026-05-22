import { useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { MoneyTrackerDateEntry, MoneyTrackerEntry, MoneyTrackerState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Globe, Trash2 } from 'lucide-react';

const EXCHANGE_RATES_TO_INR: Record<'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY', number> = {
  INR: 1,
  USD: 83.5,
  EUR: 90.2,
  GBP: 103.8,
  AED: 22.8,
  JPY: 0.55,
};

const DEFAULT_MONEY_DRAFT = {
  person: '',
  item: '',
  amount: '',
  currency: 'INR' as const,
  method: 'ONLINE' as const,
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

const DEFAULT_DATE_DRAFT = {
  title: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
  type: 'FUTURE' as const,
};

export function MoneyTracker() {
  const { state, updateState } = useAppContext();
  const tracker = state.moneyTracker;
  const draft = tracker?.draft || DEFAULT_MONEY_DRAFT;
  const dateDraft = tracker?.dateDraft || DEFAULT_DATE_DRAFT;
  const entries = tracker?.entries || [];
  const dateEntries = tracker?.dateEntries || [];

  const totals = useMemo(() => {
    const totalInRupees = entries.reduce((sum, entry) => {
      const rate = EXCHANGE_RATES_TO_INR[entry.currency] ?? 1;
      return sum + entry.amount * rate;
    }, 0);

    const onlineInRupees = entries
      .filter(entry => entry.method === 'ONLINE')
      .reduce((sum, entry) => sum + entry.amount * (EXCHANGE_RATES_TO_INR[entry.currency] ?? 1), 0);

    const offlineInRupees = entries
      .filter(entry => entry.method === 'OFFLINE')
      .reduce((sum, entry) => sum + entry.amount * (EXCHANGE_RATES_TO_INR[entry.currency] ?? 1), 0);

    return {
      totalInRupees,
      onlineInRupees,
      offlineInRupees,
      count: entries.length,
    };
  }, [entries]);

  const [selectedSection, setSelectedSection] = useState<'MONEY' | 'DATES'>('MONEY');

  const setTracker = (updater: (tracker: MoneyTrackerState | undefined) => MoneyTrackerState) => {
    updateState(prev => ({
      ...prev,
      moneyTracker: updater(prev.moneyTracker),
    }));
  };

  const updateDraft = (field: keyof typeof draft, value: string) => {
    setTracker(current => ({
      entries: current?.entries || [],
      draft: {
        ...(current?.draft || DEFAULT_MONEY_DRAFT),
        [field]: value,
      },
      dateEntries: current?.dateEntries || [],
      dateDraft: current?.dateDraft || DEFAULT_DATE_DRAFT,
    }));
  };

  const updateDateDraft = (field: keyof typeof dateDraft, value: string) => {
    setTracker(current => ({
      entries: current?.entries || [],
      draft: current?.draft || DEFAULT_MONEY_DRAFT,
      dateEntries: current?.dateEntries || [],
      dateDraft: {
        ...(current?.dateDraft || DEFAULT_DATE_DRAFT),
        [field]: value,
      },
    }));
  };

  const addEntry = () => {
    const amount = parseFloat(draft.amount);
    if (!draft.person.trim() || !draft.item.trim() || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    setTracker(current => ({
      entries: [
        {
          id: `money_${Date.now()}`,
          person: draft.person.trim(),
          item: draft.item.trim(),
          amount,
          currency: draft.currency,
          method: draft.method,
          date: draft.date,
          notes: draft.notes.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...(current?.entries || []),
      ],
      draft: {
        ...DEFAULT_MONEY_DRAFT,
        date: new Date().toISOString().slice(0, 10),
      },
      dateEntries: current?.dateEntries || [],
      dateDraft: current?.dateDraft || DEFAULT_DATE_DRAFT,
    }));
  };

  const addDateEntry = () => {
    if (!dateDraft.title.trim() || !dateDraft.date) {
      return;
    }

    setTracker(current => ({
      entries: current?.entries || [],
      draft: current?.draft || DEFAULT_MONEY_DRAFT,
      dateEntries: [
        {
          id: `date_${Date.now()}`,
          title: dateDraft.title.trim(),
          date: dateDraft.date,
          notes: dateDraft.notes.trim(),
          type: dateDraft.type,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...(current?.dateEntries || []),
      ],
      dateDraft: {
        ...DEFAULT_DATE_DRAFT,
        date: new Date().toISOString().slice(0, 10),
      },
    }));
  };

  const removeDateEntry = (entryId: string) => {
    setTracker(current => ({
      entries: current?.entries || [],
      draft: current?.draft || DEFAULT_MONEY_DRAFT,
      dateEntries: (current?.dateEntries || []).filter((entry: MoneyTrackerDateEntry) => entry.id !== entryId),
      dateDraft: current?.dateDraft || DEFAULT_DATE_DRAFT,
    }));
  };

  const removeEntry = (entryId: string) => {
    setTracker(current => ({
      entries: (current?.entries || []).filter((entry: MoneyTrackerEntry) => entry.id !== entryId),
      draft: current?.draft || DEFAULT_MONEY_DRAFT,
      dateEntries: current?.dateEntries || [],
      dateDraft: current?.dateDraft || DEFAULT_DATE_DRAFT,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Button
          type="button"
          onClick={() => setSelectedSection('MONEY')}
          className={`rounded-3xl border p-6 text-left transition-all ${
            selectedSection === 'MONEY'
              ? 'border-accent bg-accent/10 shadow-sm'
              : 'border-border bg-card hover:border-accent'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-violet-600" />
            <div>
              <p className="text-sm font-semibold text-foreground">Money</p>
              <p className="text-xs text-muted-foreground">Track income, expenses, and conversions.</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">₹{totals.totalInRupees.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-2">{totals.count} entries logged</p>
        </Button>

        <Button
          type="button"
          onClick={() => setSelectedSection('DATES')}
          className={`rounded-3xl border p-6 text-left transition-all ${
            selectedSection === 'DATES'
              ? 'border-accent bg-accent/10 shadow-sm'
              : 'border-border bg-card hover:border-accent'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-sky-600" />
            <div>
              <p className="text-sm font-semibold text-foreground">Dates</p>
              <p className="text-xs text-muted-foreground">Save upcoming events, deadlines, and reminders.</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{dateEntries.length} saved</p>
          <p className="text-sm text-muted-foreground mt-2">{dateEntries.filter(entry => entry.type === 'FUTURE').length} upcoming</p>
        </Button>
      </div>

      {selectedSection === 'MONEY' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border border-violet-200/80 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-violet-600" />
                <p className="text-sm font-semibold text-violet-700">Money Dashboard</p>
              </div>
              <p className="text-3xl font-bold text-foreground">₹{totals.totalInRupees.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">Total converted to Indian Rupees using current exchange rates.</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-sky-50 via-sky-100 to-cyan-50 border border-sky-200/80 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-sky-600" />
                <p className="text-sm font-semibold text-sky-700">Online Payments</p>
              </div>
              <p className="text-3xl font-bold text-foreground">₹{totals.onlineInRupees.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">Digital purchases, freelance pay, subscriptions.</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-rose-600" />
                <p className="text-sm font-semibold text-rose-700">Offline Cash</p>
              </div>
              <p className="text-3xl font-bold text-foreground">₹{totals.offlineInRupees.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">Cash, receipts, and in-person purchases.</p>
            </Card>
          </div>

          <Card className="p-6 shadow-md border border-border/60">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <p className="text-lg font-semibold">Record a New Entry</p>
                <p className="text-sm text-muted-foreground">Everything you type is saved automatically.</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">Autosave Enabled</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Person / Source</label>
                <Input
                  placeholder="Client, friend, vendor"
                  value={draft.person}
                  onChange={(e) => updateDraft('person', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Item / Purpose</label>
                <Input
                  placeholder="Website design, tools, props"
                  value={draft.item}
                  onChange={(e) => updateDraft('item', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={draft.amount}
                  onChange={(e) => updateDraft('amount', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Currency</label>
                <select
                  value={draft.currency}
                  onChange={(e) => updateDraft('currency', e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-accent/30"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AED">AED</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <select
                  value={draft.method}
                  onChange={(e) => updateDraft('method', e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-accent/30"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => updateDraft('date', e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-accent/30"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={addEntry} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Add Entry
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <Textarea
                placeholder="Optional context for this transaction"
                value={draft.notes}
                onChange={(e) => updateDraft('notes', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </Card>

          <Card className="p-6 shadow-md border border-border/60">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <p className="text-lg font-semibold">Money Log</p>
                <p className="text-sm text-muted-foreground">Track all recent entries in one place.</p>
              </div>
              <span className="text-sm text-muted-foreground">{totals.count} entries</span>
            </div>

            {entries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/60 p-10 text-center text-muted-foreground">
                <p className="font-medium text-foreground mb-2">No money entries yet.</p>
                <p>Start by logging one transaction above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <Card key={entry.id} className="p-4 border border-border/60 bg-background">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-slate-100 text-slate-700 border-transparent">{entry.method}</Badge>
                          <span className="text-sm text-muted-foreground">{entry.date}</span>
                        </div>
                        <p className="text-xl font-semibold">{entry.person}</p>
                        <p className="text-sm text-muted-foreground">{entry.item}</p>
                        {entry.notes ? <p className="text-sm text-muted-foreground mt-2">{entry.notes}</p> : null}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{entry.currency} {entry.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Recorded</p>
                          <p className="text-xs text-muted-foreground mt-1">₹{(entry.amount * (EXCHANGE_RATES_TO_INR[entry.currency] ?? 1)).toFixed(2)} in INR</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => removeEntry(entry.id)}
                          className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-6 shadow-md border border-border/60">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <p className="text-lg font-semibold">Important Dates</p>
                <p className="text-sm text-muted-foreground">Record special dates and why they matter.</p>
              </div>
              <Badge className="bg-slate-100 text-slate-700">Date Log</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <Input
                  placeholder="Meeting, deadline, anniversary"
                  value={dateDraft.title}
                  onChange={(e) => updateDateDraft('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={dateDraft.date}
                  onChange={(e) => updateDateDraft('date', e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-accent/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <select
                  value={dateDraft.type}
                  onChange={(e) => updateDateDraft('type', e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-accent/30"
                >
                  <option value="FUTURE">Upcoming</option>
                  <option value="PAST">Past</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={addDateEntry} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  Add Date
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-muted-foreground">What happened / will happen</label>
              <Textarea
                placeholder="Describe the importance of this date"
                value={dateDraft.notes}
                onChange={(e) => updateDateDraft('notes', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </Card>

          <Card className="p-6 shadow-md border border-border/60">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <p className="text-lg font-semibold">Date Log</p>
                <p className="text-sm text-muted-foreground">Browse saved important dates.</p>
              </div>
              <span className="text-sm text-muted-foreground">{dateEntries.length} saved</span>
            </div>

            {dateEntries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/60 p-10 text-center text-muted-foreground">
                <p className="font-medium text-foreground mb-2">No dates recorded yet.</p>
                <p>Add an important date to keep it visible and accessible.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dateEntries.map((entry) => (
                  <Card key={entry.id} className="p-4 border border-border/60 bg-background">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-slate-100 text-slate-700 border-transparent">{entry.type === 'FUTURE' ? 'Upcoming' : 'Past'}</Badge>
                          <span className="text-sm text-muted-foreground">{entry.date}</span>
                        </div>
                        <p className="text-xl font-semibold">{entry.title}</p>
                        {entry.notes ? <p className="text-sm text-muted-foreground mt-2">{entry.notes}</p> : null}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
                        <Button
                          variant="outline"
                          onClick={() => removeDateEntry(entry.id)}
                          className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

