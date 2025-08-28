
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

export interface InventoryItem {
  id: number;
  name: string;
  totalCost: number;
  profitAmount: number;
  finalPrice: number;
}

interface InventorySummaryProps {
  items: InventoryItem[];
  setItems: (items: InventoryItem[]) => void;
}

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function InventorySummary({ items, setItems }: InventorySummaryProps) {
  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalCost += item.totalCost;
        acc.totalProfit += item.profitAmount;
        acc.totalRevenue += item.finalPrice;
        return acc;
      },
      { totalCost: 0, totalProfit: 0, totalRevenue: 0 }
    );
  }, [items]);

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  }
  
  const handleClearAll = () => {
    setItems([]);
  }

  return (
    <Card className="w-full shadow-lg border-2 border-primary/20">
      <CardHeader>
        <CardTitle>Inventory Summary</CardTitle>
        <CardDescription>A summary of your saved items.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.totalCost)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.profitAmount)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.finalPrice)}</TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold text-accent">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{formatCurrency(summary.totalCost)}</TableCell>
              <TableCell className="text-right">{formatCurrency(summary.totalProfit)}</TableCell>
              <TableCell className="text-right">{formatCurrency(summary.totalRevenue)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
       <CardFooter>
        <Button variant="destructive" onClick={handleClearAll} size="sm">Clear All Items</Button>
      </CardFooter>
    </Card>
  );
}
