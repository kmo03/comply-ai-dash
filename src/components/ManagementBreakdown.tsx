import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BEECalculationResult } from "@/lib/api";

interface ManagementBreakdownProps {
  beeResult?: BEECalculationResult | null;
}

export function ManagementBreakdown({ beeResult }: ManagementBreakdownProps) {
  // Default static data if no BEE result is available
  const defaultData = [
    {
      title: "Senior Management",
      current: 45,
      points: "2/3",
      target: 60,
    },
    {
      title: "Middle Management", 
      current: 68,
      points: "2/3",
      target: 75,
    },
    {
      title: "Junior Management",
      current: 82,
      points: "3/3",
      target: 88,
    },
  ];

  // Use real data if available, otherwise fall back to default
  const managementLevels = beeResult ? [
    {
      title: "Senior Management",
      current: Math.round(beeResult.seniorManagement.blackPercentage),
      points: `${beeResult.seniorManagement.totalPoints}/3`,
      target: 60,
    },
    {
      title: "Middle Management",
      current: Math.round(beeResult.middleManagement.blackPercentage),
      points: `${beeResult.middleManagement.totalPoints}/3`,
      target: 75,
    },
    {
      title: "Junior Management",
      current: Math.round(beeResult.juniorManagement.blackPercentage),
      points: `${beeResult.juniorManagement.totalPoints}/3`,
      target: 88,
    },
  ] : defaultData;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Management Control Breakdown
      </h3>
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {managementLevels.map((level) => {
          const isOnTarget = level.current >= level.target;
          
          return (
            <Card key={level.title} className="shadow-card hover:shadow-hover transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">{level.title}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Current: {level.current}%</span>
                    <span>Target: {level.target}%</span>
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
                      isOnTarget
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    }`}>
                      {isOnTarget ? "On Target" : "Gap"}
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