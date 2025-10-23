import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Employee } from "@/lib/api";

interface DataPreviewTableProps {
  employees?: Employee[];
}

const mockEmployeeData: Employee[] = [
  { id: 1, name: "Sarah Johnson", race: "African", gender: "Female", management_level: "Senior" },
  { id: 2, name: "Michael Chen", race: "White", gender: "Male", management_level: "Middle" },
  { id: 3, name: "Nomsa Mbeki", race: "African", gender: "Female", management_level: "Senior" },
  { id: 4, name: "David Wilson", race: "White", gender: "Male", management_level: "Middle" },
  { id: 5, name: "Priya Patel", race: "Indian", gender: "Female", management_level: "Junior" },
  { id: 6, name: "Thabo Mthembu", race: "African", gender: "Male", management_level: "Junior" },
  { id: 7, name: "Lisa van der Merwe", race: "Coloured", gender: "Female", management_level: "Middle" },
  { id: 8, name: "Ahmed Hassan", race: "African", gender: "Male", management_level: "Senior" },
];

const getLevelBadgeColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'senior':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'middle':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'junior':
      return 'bg-success/10 text-success border-success/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function DataPreviewTable({ employees = [] }: DataPreviewTableProps) {
  // Use real data if available, otherwise show mock data
  const displayData = employees.length > 0 ? employees : mockEmployeeData;
  const isRealData = employees.length > 0;
  
  return (
