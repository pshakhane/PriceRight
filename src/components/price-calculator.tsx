
'use client';

import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import {
  Coins,
  Package,
  Truck,
  Ship,
  Landmark,
  TrendingUp,
  Info,
  Text,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import ProfitEstimator from './profit-estimator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const LOCAL_STORAGE_KEY = 'priceRightCalculatorState';

const formSchema = z.object({
  itemName: z.string().default(''),
  baseCost: z.coerce.number().min(0).default(0),
  packaging: z.coerce.number().min(0).default(0),
  localShipping: z.coerce.number().min(0).default(0),
  overseasShipment: z.coerce.number().min(0).default(0),
  customs: z.coerce.number().min(0).default(0),
  profitMargin: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

const initialValues: FormValues = {
  itemName: '',
  baseCost: 100,
  packaging: 5,
  localShipping: 10,
  overseasShipment: 20,
  customs: 15,
  profitMargin: 25,
};

const InputField = ({ name, label, icon: Icon, control, tooltip, type = "number" }: { name: keyof FormValues, label: string, icon: React.ElementType, control: any, tooltip: string, type?: string }) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2">
            <Label htmlFor={name}>{label}</Label>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        id={name}
                        type={type}
                        step={type === 'number' ? '0.01' : undefined}
                        placeholder={type === 'number' ? '0.00' : 'Enter value'}
                        className="pl-10"
                        onChange={e => {
                            if (type === 'number') {
                                field.onChange(parseFloat(e.target.value) || 0);
                            } else {
                                field.onChange(e.target.value);
                            }
                        }}
                    />
                )}
            />
        </div>
    </div>
);

export default function PriceCalculator() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const { control, watch, setValue, reset } = form;

  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        reset(formSchema.parse(parsedState));
      } catch (e) {
        console.error("Failed to parse saved state:", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const watchedValues = watch();

  const { totalCost, profitAmount, finalPrice } = useMemo(() => {
    const { baseCost, packaging, localShipping, overseasShipment, customs, profitMargin } = watchedValues;
    const totalCost = (baseCost || 0) + (packaging || 0) + (localShipping || 0) + (overseasShipment || 0) + (customs || 0);
    const profitAmount = totalCost * ((profitMargin || 0) / 100);
    const finalPrice = totalCost + profitAmount;
    return { totalCost, profitAmount, finalPrice };
  }, [watchedValues]);

  const handleApplySuggestion = (margin: number) => {
    setValue('profitMargin', margin, { shouldDirty: true });
  };
  
  const handleReset = () => {
    reset(initialValues);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <Card className="w-full shadow-lg border-2 border-primary/20">
      <CardHeader>
        <CardTitle>Price Calculator</CardTitle>
        <CardDescription>
          Enter your costs and desired profit margin to determine the final selling price.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
           <div className="mb-6">
                <InputField name="itemName" label="Item Name" icon={Text} control={control} tooltip="The name of the item you are selling." type="text" />
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField name="baseCost" label="Base Item Cost" icon={Coins} control={control} tooltip="The original cost of the item from the supplier." />
            <InputField name="packaging" label="Packaging Cost" icon={Package} control={control} tooltip="Cost of boxes, wrap, and other packaging materials." />
            <InputField name="localShipping" label="Local Shipping" icon={Truck} control={control} tooltip="Cost to ship the item to a local port or warehouse." />
            <InputField name="overseasShipment" label="Overseas Shipment" icon={Ship} control={control} tooltip="Cost of international freight and shipping." />
            <InputField name="customs" label="Customs & Duties" icon={Landmark} control={control} tooltip="Taxes and fees for importing the item." />
            <InputField name="profitMargin" label="Desired Profit Margin (%)" icon={TrendingUp} control={control} tooltip="The percentage of profit you want to make on top of the total cost." />
          </div>
        </form>
      </CardContent>
      <Separator className="my-4" />
      <CardFooter className="flex flex-col items-start gap-6">
         <div className="w-full space-y-4">
            <div className="flex justify-between items-center text-md">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-medium">{totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
             <div className="flex justify-between items-center text-md">
                <span className="text-muted-foreground">Profit Amount:</span>
                <span className="font-medium">{profitAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
             <div className="flex justify-between items-center text-2xl font-bold text-accent">
                <span>Final Selling Price:</span>
                <span>{finalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
         </div>
         <div className="w-full flex flex-col sm:flex-row gap-2">
            <ProfitEstimator onApplySuggestion={handleApplySuggestion} />
            <Button variant="ghost" onClick={handleReset} className="flex-grow border border-input">
                Reset Values
            </Button>
         </div>
      </CardFooter>
    </Card>
  );
}
