import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Table, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reportTypes = [
  { id: 'income', name: 'Income Statement', icon: BarChart3 },
  { id: 'cashflow', name: 'Cash Flow Statement', icon: FileText },
  { id: 'balance', name: 'Balance Sheet', icon: Table },
  { id: 'expense', name: 'Expense Report', icon: FileText },
];

const formatOptions = [
  { id: 'pdf', name: 'PDF Document' },
  { id: 'xlsx', name: 'Excel Spreadsheet' },
  { id: 'csv', name: 'CSV File' },
];

export function ExportReportDialog({ open, onOpenChange }: ExportReportDialogProps) {
  const [reportType, setReportType] = useState('income');
  const [format, setFormat] = useState('pdf');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);

  const handleExport = () => {
    const report = reportTypes.find(r => r.id === reportType);
    toast.success(`Exporting ${report?.name} as ${format.toUpperCase()}...`);
    
    // Simulate export
    setTimeout(() => {
      toast.success('Report exported successfully!');
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Financial Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {reportTypes.map(type => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.id}
                    type="button"
                    variant={reportType === type.id ? 'default' : 'outline'}
                    onClick={() => setReportType(type.id)}
                    className="h-auto py-3 flex-col gap-1"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{type.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Options</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked === true)}
                />
                <Label htmlFor="charts" className="font-normal cursor-pointer">
                  Include charts and graphs
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="summary"
                  checked={includeSummary}
                  onCheckedChange={(checked) => setIncludeSummary(checked === true)}
                />
                <Label htmlFor="summary" className="font-normal cursor-pointer">
                  Include executive summary
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
