import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export interface ExpenseFormData {
  id?: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  vendor: string;
  date: string;
  hasReceipt: boolean;
  notes?: string;
}

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseFormData | null;
  onSave: (data: ExpenseFormData) => void;
}

const categories = ['Meals', 'Travel', 'Software', 'Supplies', 'Events', 'Equipment', 'Services', 'Other'];

export function ExpenseFormDialog({ open, onOpenChange, expense, onSave }: ExpenseFormDialogProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState('');
  const [hasReceipt, setHasReceipt] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount);
      setCurrency(expense.currency);
      setCategory(expense.category);
      setVendor(expense.vendor);
      setDate(expense.date);
      setHasReceipt(expense.hasReceipt);
      setNotes(expense.notes || '');
    } else {
      setDescription('');
      setAmount(0);
      setCurrency('USD');
      setCategory('');
      setVendor('');
      setDate(new Date().toISOString().split('T')[0]);
      setHasReceipt(false);
      setNotes('');
    }
  }, [expense, open]);

  const handleSave = () => {
    if (!description.trim() || !amount || !category || !vendor.trim()) return;
    onSave({
      id: expense?.id,
      description: description.trim(),
      amount,
      currency,
      category,
      vendor: vendor.trim(),
      date,
      hasReceipt,
      notes: notes.trim(),
    });
    onOpenChange(false);
  };

  const isEditing = !!expense?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Client Dinner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category & Vendor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                placeholder="e.g., Amazon"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Receipt Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label>Receipt Attached</Label>
              <p className="text-xs text-muted-foreground">Do you have a receipt for this expense?</p>
            </div>
            <Switch checked={hasReceipt} onCheckedChange={setHasReceipt} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!description.trim() || !amount || !category || !vendor.trim()}>
            {isEditing ? 'Save Changes' : 'Add Expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
