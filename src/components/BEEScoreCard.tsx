import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BEECalculationResult } from "@/lib/api";

interface BEEScoreCardProps {
  beeResult?: BEECalculationResult | null;
}

export function BEEScoreCard({ beeResult }: BEEScoreCardProps) {
  // Use real data if available, otherwise default values
  const score = beeResult ? beeResult.totalScore : 8;
  const maxScore = 11;

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