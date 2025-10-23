import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BEECalculationResult } from "@/lib/api";

interface DisabilityTrackingProps {
  beeResult?: BEECalculationResult | null;
}

export function DisabilityTracking({ beeResult }: DisabilityTrackingProps) {
  if (!beeResult?.disabilities) {
    return null;
  }

  const { disabilities } = beeResult;
  const isOnTarget = disabilities.blackDisabledPercentage >= disabilities.target;
  const progressPercentage = Math.min((disabilities.blackDisabledPercentage / disabilities.target) * 100, 100);

  return (
    <Card className="shadow-card hover:shadow-hover transition-shadow duration-200 card-border-medium equal-height">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Employees with Disabilities
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          B-BBEE 4.6.1: Black employees with disabilities (2 points, 2% target)
        </p>
      </CardHeader>
      
      <CardContent className="flex flex-col justify-center h-full">
        <div className="space-y-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Current: {disabilities.blackDisabledPercentage}%</span>
            <span>Target: {disabilities.target}%</span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Black Disabled:</span>
              <span className="ml-2 font-medium">{disabilities.blackDisabled}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Employees:</span>
              <span className="ml-2 font-medium">{disabilities.total}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium text-foreground">
              Points: {disabilities.points}/2
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              isOnTarget
                ? "bg-success/10 text-success" 
                : "bg-warning/10 text-warning"
            }`}>
              {isOnTarget ? "Target Met" : "Below Target"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
