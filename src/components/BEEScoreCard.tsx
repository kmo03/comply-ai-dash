import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BEEScoreCardProps {
  score: number;
  maxScore: number;
  level: string;
}

export function BEEScoreCard({ score, maxScore, level }: BEEScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  
  return (
    <Card className="shadow-card hover:shadow-hover transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          BEE Score Overview
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {score}
            <span className="text-lg text-muted-foreground">/{maxScore}</span>
          </div>
          <div className="text-sm text-muted-foreground">Total Points</div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-3"
          />
        </div>
        
        <div className="bg-secondary rounded-lg p-4 text-center">
          <div className="text-sm text-muted-foreground mb-1">Current Level</div>
          <div className="text-lg font-semibold text-primary">{level}</div>
        </div>
      </CardContent>
    </Card>
  );
}