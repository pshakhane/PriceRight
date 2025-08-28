
'use client';

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight, Bot, Loader2 } from 'lucide-react';
import { getProfitMarginSuggestion, ActionState } from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ProfitEstimatorProps {
  onApplySuggestion: (margin: number) => void;
}

const initialState: ActionState = {
  data: null,
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Estimating...
        </>
      ) : (
        <>
          Estimate Margin <Bot className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export default function ProfitEstimator({ onApplySuggestion }: ProfitEstimatorProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(getProfitMarginSuggestion, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Estimation Error',
        description: state.error,
      });
    }
  }, [state, toast]);
  
  const handleApply = () => {
    if (state.data?.profitMargin) {
      onApplySuggestion(Number((state.data.profitMargin * 100).toFixed(2)));
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-grow">
          <Bot className="mr-2 h-4 w-4" /> Get AI Suggestion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Profit Margin Estimator</DialogTitle>
          <DialogDescription>
            Enter a product category to get an estimated optimal profit margin based on market data.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productCategory">Product Category</Label>
            <Input
              id="productCategory"
              name="productCategory"
              placeholder="e.g., consumer electronics"
              required
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
             <SubmitButton />
          </DialogFooter>
        </form>

        {state.success && state.data && (
          <div className="mt-4 space-y-4 p-4 border rounded-lg bg-secondary/50">
            <div>
              <Label className="text-sm text-muted-foreground">Suggested Profit Margin</Label>
              <p className="text-2xl font-bold text-accent">
                {(state.data.profitMargin * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Reasoning</Label>
              <p className="text-sm text-foreground/80">{state.data.reasoning}</p>
            </div>
             <Button onClick={handleApply} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Apply Suggestion <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
