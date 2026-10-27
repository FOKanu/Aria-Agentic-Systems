import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface BudgetFormData {
  id?: string;
  name: string;
  category: string;
  allocated: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
}

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: BudgetFormData | null;
  onSave: (data: BudgetFormData) => void;
}

const categoryOptions = ['Operations', 'Marketing', 'Development', 'Sales', 'HR', 'Legal', 'Travel', 'Equipment', 'Other'];

export function BudgetFormDialog({ open, onOpenChange, budget, onSave }: BudgetFormDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [allocated, setAllocated] = useState<number>(0);
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (budget) {
      setName(budget.name);
      setCategory(budget.category);
      setAllocated(budget.allocated);
      setPeriod(budget.period);
      setStartDate(budget.startDate);
    } else {
      setName('');
      setCategory('');
      setAllocated(0);
      setPeriod('monthly');
      setStartDate(new Date().toISOString().split('T')[0]);
    }
  }, [budget, open]);

  const handleSave = () => {
    if (!name.trim() || !category || !allocated) return;
    onSave({
      id: budget?.id,
      name: name.trim(),
      category,
      allocated,
      period,
      startDate,
    });
    onOpenChange(false);
  };

  const isEditing = !!budget?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Budget Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name</Label>
            <Input
              id="name"
              placeholder="e.g., Q1 Marketing Budget"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount & Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allocated">Amount</Label>
              <Input
                id="allocated"
                type="number"
                placeholder="0"
                value={allocated || ''}
                onChange={(e) => setAllocated(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !category || !allocated}>
            {isEditing ? 'Save Changes' : 'Create Budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
