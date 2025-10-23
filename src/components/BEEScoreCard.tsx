import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BEECalculationResult, Employee } from "@/lib/api";
import { useState, useEffect } from "react";

interface BEEScoreCardProps {
  beeResult?: BEECalculationResult | null;
  employees?: Employee[];
}

export function BEEScoreCard({ beeResult, employees = [] }: BEEScoreCardProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Use real data if available, otherwise default values
  const score = beeResult ? beeResult.totalScore : 8;
  const maxScore = 11;

  // Generate AI recommendations based on specific employee data
  useEffect(() => {
    if (beeResult && employees.length > 0) {
      generateRecommendations();
    }
  }, [beeResult, employees]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      // Analyze current gaps and generate specific recommendations
      const gaps = analyzeGaps();
      const specificRecommendations = generateSpecificRecommendations(gaps);
      setRecommendations(specificRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations(['Unable to generate recommendations at this time.']);
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeGaps = () => {
    if (!beeResult) return {};

    // Analyze disability data from the actual employee dataset
    const totalEmployees = employees.length;
    const disabledEmployees = employees.filter(emp => {
      if (!emp.race) return false;
      const raceLower = emp.race.toLowerCase();
      return raceLower.includes('disabled') || 
             raceLower.includes('disability') ||
             raceLower.includes('handicap') ||
             raceLower.includes('impaired');
    });
    const blackDisabledEmployees = disabledEmployees.filter(emp => isBlackEmployee(emp.race));
    const blackDisabledPercentage = totalEmployees > 0 ? (blackDisabledEmployees.length / totalEmployees) * 100 : 0;
    
    // Debug logging to help understand disability data
    console.log('Disability Analysis:', {
      totalEmployees,
      disabledEmployees: disabledEmployees.length,
      blackDisabledEmployees: blackDisabledEmployees.length,
      blackDisabledPercentage,
      disabledRaces: disabledEmployees.map(emp => emp.race)
    });

    const gaps = {
      senior: {
        black: beeResult.seniorManagement.blackPercentage < 60,
        blackFemale: beeResult.seniorManagement.blackFemalePercentage < 30,
        current: beeResult.seniorManagement.total,
        black: beeResult.seniorManagement.black,
        blackFemale: beeResult.seniorManagement.blackFemale
      },
      middle: {
        black: beeResult.middleManagement.blackPercentage < 75,
        blackFemale: beeResult.middleManagement.blackFemalePercentage < 38,
        current: beeResult.middleManagement.total,
        black: beeResult.middleManagement.black,
        blackFemale: beeResult.middleManagement.blackFemale
      },
      junior: {
        black: beeResult.juniorManagement.blackPercentage < 88,
        blackFemale: beeResult.juniorManagement.blackFemalePercentage < 44,
        current: beeResult.juniorManagement.total,
        black: beeResult.juniorManagement.black,
        blackFemale: beeResult.juniorManagement.blackFemale
      },
      disability: {
        needed: blackDisabledPercentage < 2,
        current: blackDisabledEmployees.length,
        percentage: blackDisabledPercentage,
        totalEmployees: totalEmployees
      }
    };

    return gaps;
  };

  const generateSpecificRecommendations = (gaps: any) => {
    const recommendations: string[] = [];
    
    // Helper function to calculate needed employees (ensuring positive numbers)
    const calculateNeeded = (current: number, target: number, existing: number) => {
      const targetCount = Math.ceil(current * target / 100);
      const needed = Math.max(0, targetCount - existing);
      return needed;
    };
    
    // Senior Management recommendations
    if (gaps.senior?.black && gaps.senior.current > 0) {
      const needed = calculateNeeded(gaps.senior.current, 60, gaps.senior.black);
      if (needed > 0) {
        recommendations.push(`Hire ${needed} more black senior managers to reach 60% target`);
      }
    }
    if (gaps.senior?.blackFemale && gaps.senior.current > 0) {
      const needed = calculateNeeded(gaps.senior.current, 30, gaps.senior.blackFemale);
      if (needed > 0) {
        recommendations.push(`Promote ${needed} more black females to senior management`);
      }
    }
    
    // Middle Management recommendations
    if (gaps.middle?.black && gaps.middle.current > 0) {
      const needed = calculateNeeded(gaps.middle.current, 75, gaps.middle.black);
      if (needed > 0) {
        recommendations.push(`Recruit ${needed} black middle managers to meet 75% requirement`);
      }
    }
    if (gaps.middle?.blackFemale && gaps.middle.current > 0) {
      const needed = calculateNeeded(gaps.middle.current, 38, gaps.middle.blackFemale);
      if (needed > 0) {
        recommendations.push(`Develop ${needed} black female middle management candidates`);
      }
    }
    
    // Junior Management recommendations
    if (gaps.junior?.black && gaps.junior.current > 0) {
      const needed = calculateNeeded(gaps.junior.current, 88, gaps.junior.black);
      if (needed > 0) {
        recommendations.push(`Target ${needed} black junior management hires for 88% compliance`);
      }
    }
    if (gaps.junior?.blackFemale && gaps.junior.current > 0) {
      const needed = calculateNeeded(gaps.junior.current, 44, gaps.junior.blackFemale);
      if (needed > 0) {
        recommendations.push(`Focus on ${needed} black female junior management development`);
      }
    }
    
    // Disability recommendations - based on actual dataset analysis
    console.log('Disability recommendation check:', {
      totalEmployees: gaps.disability?.totalEmployees,
      current: gaps.disability?.current,
      needed: gaps.disability?.needed,
      percentage: gaps.disability?.percentage
    });
    
    if (gaps.disability?.totalEmployees > 0) {
      const targetDisabled = Math.ceil(gaps.disability.totalEmployees * 0.02);
      const needed = Math.max(0, targetDisabled - gaps.disability.current);
      
      console.log('Disability calculation:', {
        targetDisabled,
        needed,
        current: gaps.disability.current
      });
      
      if (gaps.disability.current === 0) {
        // No disabled employees found in dataset
        const rec = `Recruit ${targetDisabled} black employees with disabilities (2% of workforce - none currently identified)`;
        console.log('Adding disability recommendation:', rec);
        recommendations.push(rec);
      } else if (gaps.disability.needed) {
        // Some disabled employees but not enough
        const rec = `Recruit ${needed} more black employees with disabilities (currently ${gaps.disability.percentage.toFixed(1)}%, need 2% of workforce)`;
        console.log('Adding disability recommendation:', rec);
        recommendations.push(rec);
      }
    }

    // Add strategic recommendations based on current workforce
    const blackEmployees = employees.filter(emp => isBlackEmployee(emp.race));
    const blackFemaleEmployees = blackEmployees.filter(emp => emp.gender === 'Female');
    
    if (blackEmployees.length > 0 && blackFemaleEmployees.length < blackEmployees.length * 0.4) {
      recommendations.push('Focus on gender diversity within black employees - promote more black females');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Excellent! You are meeting all B-BBEE Employment Equity targets.');
    }

    console.log('Final recommendations:', recommendations);
    
    // Prioritize disability recommendations by putting them first
    const disabilityRecs = recommendations.filter(rec => rec.includes('disabilities'));
    const otherRecs = recommendations.filter(rec => !rec.includes('disabilities'));
    const prioritizedRecs = [...disabilityRecs, ...otherRecs];
    
    return prioritizedRecs.slice(0, 4); // Show top 4 recommendations to include disability
  };

  // Helper function to check if employee qualifies as black under B-BBEE
  const isBlackEmployee = (race: string) => {
    const blackRaces = ['African', 'Coloured', 'Indian', 'Chinese'];
    return blackRaces.includes(race);
  };

  return (
    <Card className="shadow-card hover:shadow-hover transition-shadow duration-200 card-border-thin equal-height">      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Employment Equity Score
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col justify-between h-full">
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-primary mb-2">
            {score}
            <span className="text-lg text-muted-foreground">/{maxScore}</span>
          </div>
          <div className="text-sm text-muted-foreground">Employment Equity Points</div>
        </div>
        
        {/* AI Recommendations Section */}
        {employees.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-2">AI Recommendations</h4>
            {isGenerating ? (
              <div className="text-xs text-muted-foreground">Analyzing your workforce...</div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-1">
                {recommendations.map((rec, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    • {rec}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Upload employee data for personalized recommendations</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}