// Mock API functions for local development when Supabase functions are not available
import { Employee, BEECalculationResult, UploadResponse, EmployeesResponse } from './api';

// Mock CSV processing function
export function mockProcessCSV(csvContent: string): { employees: Employee[], warnings: string[] } {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const dataRows = lines.slice(1);
  
  const employees: Employee[] = [];
  const warnings: string[] = [];
  
  // Helper functions for data standardization
  const standardizeRace = (race: string): string => {
    if (!race || race.trim() === '') return 'Unknown';
    const normalized = race.toLowerCase().trim();
    if (normalized.includes('black') || normalized === 'african') return 'African';
    if (normalized === 'coloured') return 'Coloured';
    if (normalized === 'indian') return 'Indian';
    if (normalized === 'chinese') return 'Chinese';
    if (normalized === 'white') return 'White';
    if (normalized === 'asian' && !normalized.includes('chinese')) return 'Asian';
    return race;
  };

  const standardizeGender = (gender: string): string => {
    if (!gender || gender.trim() === '') return 'Unknown';
    const normalized = gender.toLowerCase().trim();
    if (normalized === 'm' || normalized === 'male') return 'Male';
    if (normalized === 'f' || normalized === 'female') return 'Female';
    return gender;
  };

  const standardizeManagementLevel = (level: string): string => {
    if (!level || level.trim() === '') return 'Unknown';
    const normalized = level.toLowerCase().trim();
    if (normalized.includes('senior') || normalized.includes('snr') || normalized.includes('team lead')) return 'Senior';
    if (normalized.includes('middle') || normalized === 'manager') return 'Middle';
    if (normalized.includes('junior')) return 'Junior';
    return level;
  };

  // Process each row
  for (let i = 0; i < dataRows.length; i++) {
    try {
      const row = dataRows[i];
      if (!row.trim()) continue;

      // Simple CSV parsing
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let char of row) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      // Map values to expected structure
      const nameIndex = headers.findIndex((h: string) => h.toLowerCase().includes('name'));
      const raceIndex = headers.findIndex((h: string) => h.toLowerCase().includes('race'));
      const genderIndex = headers.findIndex((h: string) => h.toLowerCase().includes('gender'));
      const levelIndex = headers.findIndex((h: string) => h.toLowerCase().includes('management') || h.toLowerCase().includes('level'));

      const name = values[nameIndex] || `Employee ${i + 1}`;
      const rawRace = values[raceIndex] || '';
      const rawGender = values[genderIndex] || '';
      const rawLevel = values[levelIndex] || '';

      const employee: Employee = {
        id: i + 1,
        name: name.replace(/"/g, ''),
        race: standardizeRace(rawRace.replace(/"/g, '')),
        gender: standardizeGender(rawGender.replace(/"/g, '')),
        management_level: standardizeManagementLevel(rawLevel.replace(/"/g, ''))
      };

      // Add warnings for missing data
      if (!rawRace.trim()) warnings.push(`Race field empty for ${employee.name}`);
      if (!rawGender.trim()) warnings.push(`Gender field empty for ${employee.name}`);
      if (!rawLevel.trim()) warnings.push(`Management level field empty for ${employee.name}`);

      employees.push(employee);
    } catch (rowError) {
      console.error(`Error processing row ${i + 1}:`, rowError);
      warnings.push(`Failed to process row ${i + 1}`);
    }
  }

  return { employees, warnings };
}

// Mock BEE calculation function
export function mockCalculateBEE(employees: Employee[]): BEECalculationResult {
  // Helper function to check if employee is black
  const isBlack = (race: string) => ['African', 'Coloured', 'Indian', 'Chinese'].includes(race);
  
  // Separate employees by management level
  const senior = employees.filter(emp => emp.management_level === 'Senior');
  const middle = employees.filter(emp => emp.management_level === 'Middle');
  const junior = employees.filter(emp => emp.management_level === 'Junior');

  // Calculate points for each management level
  function calculateLevelPoints(levelEmployees: Employee[], blackThreshold: number, blackFemaleThreshold: number) {
    const total = levelEmployees.length;
    if (total === 0) return {
      total: 0,
      black: 0,
      blackFemale: 0,
      blackPercentage: 0,
      blackFemalePercentage: 0,
      blackPoints: 0,
      blackFemalePoints: 0,
      totalPoints: 0
    };

    const black = levelEmployees.filter(emp => isBlack(emp.race)).length;
    const blackFemale = levelEmployees.filter(emp => isBlack(emp.race) && emp.gender === 'Female').length;
    
    const blackPercentage = (black / total) * 100;
    const blackFemalePercentage = (blackFemale / total) * 100;

    // Calculate black representation points (0-2 points)
    let blackPoints = 0;
    if (blackPercentage >= blackThreshold) blackPoints = 2;
    else if (blackPercentage >= blackThreshold * 0.5) blackPoints = 1;

    // Calculate black female points (0-1 points)
    const blackFemalePoints = blackFemalePercentage >= blackFemaleThreshold ? 1 : 0;

    return {
      total,
      black,
      blackFemale,
      blackPercentage: Math.round(blackPercentage * 100) / 100,
      blackFemalePercentage: Math.round(blackFemalePercentage * 100) / 100,
      blackPoints,
      blackFemalePoints,
      totalPoints: blackPoints + blackFemalePoints
    };
  }

  // Calculate scores for each level
  const seniorManagement = calculateLevelPoints(senior, 60, 30);
  const middleManagement = calculateLevelPoints(middle, 75, 38);
  const juniorManagement = calculateLevelPoints(junior, 88, 44);

  // Calculate disabilities
  const totalEmployees = employees.length;
  const disabledEmployees = employees.filter(emp => 
    emp.race && emp.race.toLowerCase().includes('disabled')
  );
  const blackDisabledEmployees = disabledEmployees.filter(emp => isBlack(emp.race));
  const blackDisabledPercentage = totalEmployees > 0 ? (blackDisabledEmployees.length / totalEmployees) * 100 : 0;
  const disabilityPoints = blackDisabledPercentage >= 2 ? 2 : 0;

  const totalScore = seniorManagement.totalPoints + middleManagement.totalPoints + juniorManagement.totalPoints + disabilityPoints;

  return {
    seniorManagement,
    middleManagement,
    juniorManagement,
    disabilities: {
      total: totalEmployees,
      blackDisabled: blackDisabledEmployees.length,
      blackDisabledPercentage: Math.round(blackDisabledPercentage * 100) / 100,
      target: 2,
      points: disabilityPoints
    },
    totalScore,
    maxScore: 11
  };
}

// Mock API functions that use local processing
export async function mockUploadCSV(csvData: string, sessionId: string): Promise<UploadResponse> {
  console.log('Using mock CSV processing for sessionId:', sessionId);
  
  const { employees, warnings } = mockProcessCSV(csvData);
  
  // Store in localStorage for persistence
  localStorage.setItem(`employees_${sessionId}`, JSON.stringify(employees));
  
  return {
    success: true,
    employees,
    warnings,
    processedCount: employees.length
  };
}

export async function mockCalculateBEEFromSession(sessionId: string): Promise<BEECalculationResult> {
  console.log('Using mock BEE calculation for sessionId:', sessionId);
  
  const storedEmployees = localStorage.getItem(`employees_${sessionId}`);
  if (!storedEmployees) {
    throw new Error('No employee data found for this session');
  }
  
  const employees: Employee[] = JSON.parse(storedEmployees);
  return mockCalculateBEE(employees);
}

export async function mockGetEmployees(sessionId: string): Promise<EmployeesResponse> {
  console.log('Using mock get employees for sessionId:', sessionId);
  
  const storedEmployees = localStorage.getItem(`employees_${sessionId}`);
  if (!storedEmployees) {
    return {
      success: true,
      employees: [],
      count: 0
    };
  }
  
  const employees: Employee[] = JSON.parse(storedEmployees);
  return {
    success: true,
    employees,
    count: employees.length
  };
}

