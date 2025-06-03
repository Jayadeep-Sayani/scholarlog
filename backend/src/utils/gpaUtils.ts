type Assignment = {
  grade: number
  weight: number
}

type Course = {
  grade: number
  credits: number
}

export function calculateWeightedGPA(assignments: Assignment[]): number {
  let totalWeight = 0
  let totalScore = 0

  for (const a of assignments) {
    totalScore += a.grade * a.weight
    totalWeight += a.weight
  }

  if (totalWeight === 0) return 0
  return parseFloat((totalScore / totalWeight).toFixed(2))
}

export function calculateOverallGPA(courses: Course[], scale: string = 'uvic9'): number {
  if (courses.length === 0) return 0

  let totalPoints = 0
  let totalCredits = 0

  for (const course of courses) {
    const courseGPA = mapGradeToGpa(course.grade, scale)
    totalPoints += courseGPA * course.credits
    totalCredits += course.credits
  }

  if (totalCredits === 0) return 0
  return parseFloat((totalPoints / totalCredits).toFixed(2))
}

export function mapGradeToGpa(grade: number, scale: string = 'uvic9'): number {
  if (scale === 'ubc4') {
    return mapGradeToGpaUBC(grade)
  }
  
  // Default UVic 9.0 scale
  if (grade >= 90) return 9.0
  if (grade >= 85) return 8.0
  if (grade >= 80) return 7.0
  if (grade >= 77) return 6.0
  if (grade >= 73) return 5.0
  if (grade >= 70) return 4.0
  if (grade >= 65) return 3.0
  if (grade >= 60) return 2.0
  if (grade >= 50) return 1.0
  return 0.0
}

export function mapGradeToGpaUBC(grade: number): number {
  if (grade >= 90) return 4.33
  if (grade >= 89) return 4.30
  if (grade >= 88) return 4.20
  if (grade >= 87) return 4.10
  if (grade >= 86) return 4.00
  if (grade >= 85) return 3.95
  if (grade >= 84) return 3.90
  if (grade >= 83) return 3.85
  if (grade >= 82) return 3.80
  if (grade >= 81) return 3.75
  if (grade >= 80) return 3.70
  if (grade >= 79) return 3.60
  if (grade >= 78) return 3.50
  if (grade >= 77) return 3.40
  if (grade >= 76) return 3.30
  if (grade >= 75) return 3.20
  if (grade >= 74) return 3.10
  if (grade >= 73) return 3.00
  if (grade >= 72) return 2.95
  if (grade >= 71) return 2.90
  if (grade >= 70) return 2.80
  if (grade >= 69) return 2.70
  if (grade >= 68) return 2.65
  if (grade >= 67) return 2.60
  if (grade >= 66) return 2.55
  if (grade >= 65) return 2.50
  if (grade >= 64) return 2.40
  if (grade >= 63) return 2.30
  if (grade >= 62) return 2.20
  if (grade >= 61) return 2.10
  if (grade >= 60) return 2.00
  if (grade >= 59) return 1.90
  if (grade >= 58) return 1.80
  if (grade >= 57) return 1.70
  if (grade >= 56) return 1.60
  if (grade >= 55) return 1.50
  if (grade >= 54) return 1.40
  if (grade >= 53) return 1.30
  if (grade >= 52) return 1.20
  if (grade >= 51) return 1.10
  if (grade >= 50) return 1.00
  return 0.0
}