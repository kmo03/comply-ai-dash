import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ManagementLevel {
  title: string;
  current: number;
  required: number;
  points: number;
  maxPoints: number;
}

const managementLevels: ManagementLevel[] = [
  {
    title: "Senior Management",
    current: 15,
    required: 25,
    points: 3,
    maxPoints: 5,
  },
  {
    title: "Middle Management", 
    current: 35,
    required: 50,
    points: 4,
    maxPoints: 5,
  },
  {
    title: "Junior Management",
    current: 65,
    required: 75,
    points: 4,
    maxPoints: 5,
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
          const percentage = (level.current / level.required) * 100;
          const isCompliant = level.current >= level.required;
          
          return (
            <Card key={level.title} className="shadow-card hover:shadow-hover transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-foreground">
                  {level.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    {level.current}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Target: {level.required}%
                  </span>
                </div>
                
                <Progress
                  value={Math.min(percentage, 100)}
                  className="h-3"
                />
                
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isCompliant ? 'bg-success' : 'bg-warning'
                    }`} />
                    <span className="text-sm font-medium">
                      {level.points}/{level.maxPoints} points
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isCompliant 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {isCompliant ? 'Compliant' : 'Gap'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}