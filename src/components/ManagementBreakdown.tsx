import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ManagementLevel {
  title: string;
  current: number;
  points: string;
}

const managementLevels: ManagementLevel[] = [
  {
    title: "Senior Management",
    current: 15,
    points: "1/3",
  },
  {
    title: "Middle Management", 
    current: 35,
    points: "2/2",
  },
  {
    title: "Junior Management",
    current: 65,
    points: "3/3",
  },
];

export function ManagementBreakdown() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Management Control Breakdown
      </h3>
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {managementLevels.map((level) => {
          return (
            <Card key={level.title} className="shadow-card hover:shadow-hover transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">{level.title}</h3>
                </div>
                
                <div className="space-y-3">
                  <Progress 
                    value={level.current} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {level.current}% = {level.points} points
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}