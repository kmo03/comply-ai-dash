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
      blackCurrent: Math.round(beeResult.seniorManagement.blackPercentage),
      blackFemaleCurrent: Math.round(beeResult.seniorManagement.blackFemalePercentage),
      points: `${beeResult.seniorManagement.totalPoints}/3`,
      blackTarget: 60,
      blackFemaleTarget: 30,
    },
    {
      title: "Middle Management",
      blackCurrent: Math.round(beeResult.middleManagement.blackPercentage),
      blackFemaleCurrent: Math.round(beeResult.middleManagement.blackFemalePercentage),
      points: `${beeResult.middleManagement.totalPoints}/3`,
      blackTarget: 75,
      blackFemaleTarget: 38,
    },
    {
      title: "Junior Management",
      blackCurrent: Math.round(beeResult.juniorManagement.blackPercentage),
      blackFemaleCurrent: Math.round(beeResult.juniorManagement.blackFemalePercentage),
      points: `${beeResult.juniorManagement.totalPoints}/3`,
      blackTarget: 88,
      blackFemaleTarget: 44,
    },
    {
      title: "Employees with Disabilities",
      blackCurrent: Math.round(beeResult.disabilities?.blackDisabledPercentage || 0),
      blackFemaleCurrent: 0, // Not applicable for disability tracking
      points: `${beeResult.disabilities?.points || 0}/2`,
      blackTarget: 2,
      blackFemaleTarget: 0, // Not applicable
      isDisability: true,
    },
  ] : defaultData;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Management Control Breakdown
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-stretch">
        {managementLevels.map((level) => {
          const isBlackOnTarget = level.blackCurrent >= level.blackTarget;
          const isBlackFemaleOnTarget = level.blackFemaleCurrent >= level.blackFemaleTarget;
          const isFullyCompliant = level.isDisability ? isBlackOnTarget : (isBlackOnTarget && isBlackFemaleOnTarget);
          
          return (
            <Card key={level.title} className="shadow-card hover:shadow-hover transition-shadow duration-200 card-border-thin equal-height">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">{level.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Black Employees / Black Disabled Employees */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{level.isDisability ? 'Black Disabled' : 'Black'}: {level.blackCurrent}%</span>
                      <span>Target: {level.blackTarget}%</span>
                    </div>
                    <Progress 
                      value={level.blackCurrent} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {level.blackCurrent >= level.blackTarget ? `✓ ${level.isDisability ? '2' : '2'} pts` : "0 pts"}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isBlackOnTarget
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      }`}>
                        {isBlackOnTarget ? "Met" : "Gap"}
                      </span>
                    </div>
                  </div>

                  {/* Black Female Employees - Only show if not disability */}
                  {!level.isDisability && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Black Female: {level.blackFemaleCurrent}%</span>
                        <span>Target: {level.blackFemaleTarget}%</span>
                      </div>
                      <Progress 
                        value={level.blackFemaleCurrent} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {level.blackFemaleCurrent >= level.blackFemaleTarget ? "✓ 1 pt" : "0 pts"}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isBlackFemaleOnTarget
                            ? "bg-success/10 text-success" 
                            : "bg-warning/10 text-warning"
                        }`}>
                          {isBlackFemaleOnTarget ? "Met" : "Gap"}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium text-foreground">
                      Total: {level.points}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isFullyCompliant
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    }`}>
                      {isFullyCompliant ? "Fully Compliant" : "Partial"}
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