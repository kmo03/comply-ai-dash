import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BEEScoreCardProps {
  score: number;
  maxScore: number;
  level: string;
}

export function BEEScoreCard({ score, maxScore, level }: BEEScoreCardProps) {
  return (
    <Card className="shadow-card hover:shadow-hover transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Employment Equity Score
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {score}
            <span className="text-lg text-muted-foreground">/{maxScore}</span>
          </div>
          <div className="text-sm text-muted-foreground">Employment Equity Points</div>
        </div>
      </CardContent>
    </Card>
  );
}