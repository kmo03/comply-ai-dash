import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Users, Target } from "lucide-react";

interface GapItem {
  category: string;
  message: string;
  priority: "high" | "medium" | "low";
  impact: string;
}

const gapAnalysis: GapItem[] = [
  {
    category: "Senior Management",
    message: "Need 2 more black senior managers for full points",
    priority: "high",
    impact: "+2 points",
  },
  {
    category: "Middle Management",
    message: "Require 15% increase in black middle management",
    priority: "medium", 
    impact: "+1 point",
  },
  {
    category: "Junior Management",
    message: "Close to target - need 10% improvement",
    priority: "low",
    impact: "+1 point",
  },
];

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

const priorityIcons = {
  high: AlertTriangle,
  medium: TrendingUp,
  low: Target,
};

export function GapAnalysis() {
  return (
    <Card className="shadow-card hover:shadow-hover transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Users className="h-5 w-5 text-primary" />
          Gap Analysis & Recommendations
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {gapAnalysis.map((gap, index) => {
          const Icon = priorityIcons[gap.priority];
          
          return (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors duration-200"
            >
              <div className="flex-shrink-0">
                <Icon className={`h-5 w-5 ${
                  gap.priority === 'high' ? 'text-destructive' :
                  gap.priority === 'medium' ? 'text-warning' : 'text-success'
                }`} />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">{gap.category}</h4>
                  <Badge variant="outline" className={priorityColors[gap.priority]}>
                    {gap.priority} priority
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {gap.message}
                </p>
                
                <div className="text-xs text-primary font-medium">
                  Potential Impact: {gap.impact}
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">Quick Actions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Review current recruitment policies</li>
            <li>• Implement mentorship programs for advancement</li>
            <li>• Track progress monthly with updated data uploads</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}