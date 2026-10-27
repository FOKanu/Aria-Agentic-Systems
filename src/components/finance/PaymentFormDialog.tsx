import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface PaymentFormData {
  id?: string;
  type: 'incoming' | 'outgoing';
  description: string;
  amount: number;
  currency: string;
  counterparty: string;
  method: string;
  date: string;
  reference?: string;
}

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: PaymentFormData | null;
  onSave: (data: PaymentFormData) => void;
}

const paymentMethods = ['Wire Transfer', 'ACH', 'Credit Card', 'Check', 'PayPal', 'Crypto'];

export function PaymentFormDialog({ open, onOpenChange, payment, onSave }: PaymentFormDialogProps) {
  const [type, setType] = useState<'incoming' | 'outgoing'>('outgoing');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');
  const [counterparty, setCounterparty] = useState('');
  const [method, setMethod] = useState('');
  const [date, setDate] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (payment) {
      setType(payment.type);
      setDescription(payment.description);
      setAmount(payment.amount);
      setCurrency(payment.currency);
      setCounterparty(payment.counterparty);
      setMethod(payment.method);
      setDate(payment.date);
      setReference(payment.reference || '');
    } else {
      setType('outgoing');
      setDescription('');
      setAmount(0);
      setCurrency('USD');
      setCounterparty('');
      setMethod('');
      setDate(new Date().toISOString().split('T')[0]);
      setReference('');
    }
  }, [payment, open]);

  const handleSave = () => {
    if (!description.trim() || !amount || !counterparty.trim() || !method) return;
    onSave({
      id: payment?.id,
      type,
      description: description.trim(),
      amount,
      currency,
      counterparty: counterparty.trim(),
      method,
      date,
      reference: reference.trim() || undefined,
    });
    onOpenChange(false);
  };

  const isEditing = !!payment?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Payment' : 'New Payment'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type */}
          <div className="space-y-2">
            <Label>Payment Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === 'outgoing' ? 'default' : 'outline'}
                onClick={() => setType('outgoing')}
                className="w-full"
              >
                Outgoing (Pay)
              </Button>
              <Button
                type="button"
                variant={type === 'incoming' ? 'default' : 'outline'}
                onClick={() => setType('incoming')}
                className="w-full"
              >
                Incoming (Receive)
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Supplier Payment"
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

          {/* Counterparty & Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="counterparty">{type === 'incoming' ? 'From' : 'To'}</Label>
              <Input
                id="counterparty"
                placeholder="Company or person name"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Reference */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                placeholder="e.g., INV-2024-001"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!description.trim() || !amount || !counterparty.trim() || !method}>
            {isEditing ? 'Save Changes' : 'Create Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
