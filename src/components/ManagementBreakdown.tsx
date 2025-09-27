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
    current: 45,
    points: "2/3",
  },
  {
    title: "Middle Management", 
    current: 68,
    points: "2/3",
  },
  {
    title: "Junior Management",
    current: 82,
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
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Current: {level.current}%</span>
                    <span>Target: {
                      level.title === "Senior Management" ? "60%" :
                      level.title === "Middle Management" ? "75%" : "88%"
                    }</span>
                  </div>
                  
                  <Progress 
                    value={level.current} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Points: {level.points}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      (level.title === "Senior Management" && level.current >= 60) ||
                      (level.title === "Middle Management" && level.current >= 75) ||
                      (level.title === "Junior Management" && level.current >= 88)
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    }`}>
                      {(level.title === "Senior Management" && level.current >= 60) ||
                       (level.title === "Middle Management" && level.current >= 75) ||
                       (level.title === "Junior Management" && level.current >= 88)
                        ? "On Target" : "Gap"}
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