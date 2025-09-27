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

interface Employee {
  id: number;
  name: string;
  race: string;
  gender: string;
  managementLevel: string;
}

const mockEmployeeData: Employee[] = [
  { id: 1, name: "Sarah Johnson", race: "Black African", gender: "Female", managementLevel: "Senior" },
  { id: 2, name: "Michael Chen", race: "Chinese", gender: "Male", managementLevel: "Middle" },
  { id: 3, name: "Nomsa Mbeki", race: "Black African", gender: "Female", managementLevel: "Senior" },
  { id: 4, name: "David Wilson", race: "White", gender: "Male", managementLevel: "Middle" },
  { id: 5, name: "Priya Patel", race: "Indian", gender: "Female", managementLevel: "Junior" },
  { id: 6, name: "Thabo Mthembu", race: "Black African", gender: "Male", managementLevel: "Junior" },
  { id: 7, name: "Lisa van der Merwe", race: "Coloured", gender: "Female", managementLevel: "Middle" },
  { id: 8, name: "Ahmed Hassan", race: "Black African", gender: "Male", managementLevel: "Senior" },
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

export function DataPreviewTable() {
  return (
    <Card className="shadow-card hover:shadow-hover transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Employee Data Preview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Showing {mockEmployeeData.length} employees from uploaded data
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Race</TableHead>
                <TableHead className="font-semibold">Gender</TableHead>
                <TableHead className="font-semibold">Management Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEmployeeData.map((employee) => (
                <TableRow 
                  key={employee.id}
                  className="hover:bg-secondary/30 transition-colors duration-150"
                >
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.race}</TableCell>
                  <TableCell>{employee.gender}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getLevelBadgeColor(employee.managementLevel)}
                    >
                      {employee.managementLevel}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
          <span>Total employees: {mockEmployeeData.length}</span>
          <span>Last updated: Today at 2:30 PM</span>
        </div>
      </CardContent>
    </Card>
  );
}