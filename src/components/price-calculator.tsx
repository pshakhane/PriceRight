
'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Save,
  Globe,
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
import InventorySummary, { type InventoryItem } from './inventory-summary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LOCAL_STORAGE_KEY_CALCULATOR = 'priceRightCalculatorState';
const LOCAL_STORAGE_KEY_INVENTORY = 'priceRightInventoryState';

const formSchema = z.object({
  itemName: z.string().min(1, 'Item name is required.').default(''),
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

const currencies = [
  { code: 'USD', name: 'United States Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'SLL', name: 'Sierra Leonean', symbol: 'LE' },
];

const exchangeRates: { [key: string]: number } = {
  USD: 1,
  EUR: 0.92,
  JPY: 157,
  GBP: 0.79,
  CAD: 1.37,
  AUD: 1.52,
  SLL: 22500
};

const InputField = ({ name, label, icon: Icon, control, tooltip, type = "number", error }: { name: keyof FormValues, label: string, icon: React.ElementType, control: any, tooltip: string, type?: string, error?: string }) => (
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
        {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
);

export default function PriceCalculator() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currency, setCurrency] = useState('USD');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const { control, watch, setValue, reset, trigger, getValues, formState: { errors } } = form;

  useEffect(() => {
    const savedCalculatorState = localStorage.getItem(LOCAL_STORAGE_KEY_CALCULATOR);
    if (savedCalculatorState) {
      try {
        const parsedState = JSON.parse(savedCalculatorState);
        reset(formSchema.parse(parsedState.values));
        setCurrency(parsedState.currency || 'USD');
      } catch (e) {
        console.error("Failed to parse saved calculator state:", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY_CALCULATOR);
      }
    }

    const savedInventoryState = localStorage.getItem(LOCAL_STORAGE_KEY_INVENTORY);
    if (savedInventoryState) {
        try {
            const parsedState = JSON.parse(savedInventoryState);
            setInventory(parsedState);
        } catch(e) {
            console.error("Failed to parse saved inventory state:", e);
            localStorage.removeItem(LOCAL_STORAGE_KEY_INVENTORY);
        }
    }
  }, [reset]);

  const watchedValues = watch();

  useEffect(() => {
    const subscription = watch((value) => {
      const stateToSave = {
          values: value,
          currency: currency,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_CALCULATOR, JSON.stringify(stateToSave));
    });
    return () => subscription.unsubscribe();
  }, [watch, currency]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  const { totalCost, profitAmount, finalPrice } = useMemo(() => {
    const { baseCost, packaging, localShipping, overseasShipment, customs, profitMargin } = watchedValues;
    const rate = exchangeRates[currency] || 1;
    const totalCostUSD = (baseCost || 0) + (packaging || 0) + (localShipping || 0) + (overseasShipment || 0) + (customs || 0);
    const totalCost = totalCostUSD * rate;
    const profitAmount = totalCost * ((profitMargin || 0) / 100);
    const finalPrice = totalCost + profitAmount;
    return { totalCost, profitAmount, finalPrice };
  }, [watchedValues, currency]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol'
    });
  }

  const handleApplySuggestion = (margin: number) => {
    setValue('profitMargin', margin, { shouldDirty: true });
  };
  
  const handleReset = () => {
    reset(initialValues);
    setCurrency('USD');
    localStorage.removeItem(LOCAL_STORAGE_KEY_CALCULATOR);
  };
  
  const handleSaveItem = async () => {
    const isValid = await trigger();
    if (isValid) {
        const values = getValues();
        const baseTotalCost = (values.baseCost || 0) + (values.packaging || 0) + (values.localShipping || 0) + (values.overseasShipment || 0) + (values.customs || 0);
        const baseProfitAmount = baseTotalCost * ((values.profitMargin || 0) / 100);
        const baseFinalPrice = baseTotalCost + baseProfitAmount;

        const newItem: InventoryItem = {
            id: Date.now(),
            name: values.itemName,
            totalCost: baseTotalCost,
            profitAmount: baseProfitAmount,
            finalPrice: baseFinalPrice,
        };
        setInventory(prev => [...prev, newItem]);
        reset(initialValues);
    }
  }

  return (
    <>
      <Card className="w-full shadow-lg border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Price Calculator</CardTitle>
          <CardDescription>
            Enter your costs and desired profit margin to determine the final selling price.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <InputField name="itemName" label="Item Name" icon={Text} control={control} tooltip="The name of the item you are selling." type="text" error={errors.itemName?.message} />
                 <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="currency">Currency</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Select your desired currency. All costs should be entered in USD.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="relative">
                       <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                       <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>
                                        {c.code} - {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField name="baseCost" label="Base Item Cost (USD)" icon={Coins} control={control} tooltip="The original cost of the item from the supplier." />
              <InputField name="packaging" label="Packaging Cost (USD)" icon={Package} control={control} tooltip="Cost of boxes, wrap, and other packaging materials." />
              <InputField name="localShipping" label="Local Shipping (USD)" icon={Truck} control={control} tooltip="Cost to ship the item to a local port or warehouse." />
              <InputField name="overseasShipment" label="Overseas Shipment (USD)" icon={Ship} control={control} tooltip="Cost of international freight and shipping." />
              <InputField name="customs" label="Customs & Duties (USD)" icon={Landmark} control={control} tooltip="Taxes and fees for importing the item." />
              <InputField name="profitMargin" label="Desired Profit Margin (%)" icon={TrendingUp} control={control} tooltip="The percentage of profit you want to make on top of the total cost." />
            </div>
          </form>
        </CardContent>
        <Separator className="my-4" />
        <CardFooter className="flex flex-col items-start gap-6">
           <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-md">
                  <span className="text-muted-foreground">Total Cost:</span>
                  <span className="font-medium">{formatCurrency(totalCost)}</span>
              </div>
               <div className="flex justify-between items-center text-md">
                  <span className="text-muted-foreground">Profit Amount:</span>
                  <span className="font-medium">{formatCurrency(profitAmount)}</span>
              </div>
               <div className="flex justify-between items-center text-2xl font-bold text-accent">
                  <span>Final Selling Price:</span>
                  <span>{formatCurrency(finalPrice)}</span>
              </div>
           </div>
           <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
              <ProfitEstimator onApplySuggestion={handleApplySuggestion} />
              <Button variant="outline" onClick={handleSaveItem} className="w-full">
                  <Save className="mr-2 h-4 w-4" /> Save Item
              </Button>
              <Button variant="ghost" onClick={handleReset} className="w-full border border-input">
                  Reset Values
              </Button>
           </div>
        </CardFooter>
      </Card>
      {inventory.length > 0 && <InventorySummary items={inventory} setItems={setInventory} />}
    </>
  );
}
