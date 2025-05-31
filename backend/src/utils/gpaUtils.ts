type Assignment = {
  grade: number
  weight: number
}

type Course = {
  grade: number
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




export function calculateOverallGPA(courses: Course[]): number {
  if (courses.length === 0) return 0

  const total = courses.reduce((acc, c) => acc + c.grade, 0)
  return parseFloat((total / courses.length).toFixed(2))
}

export function mapGradeToGpa(grade: number, scale: number): number {
  if (scale === 10.0) {
    return parseFloat((grade / 10).toFixed(2))
  }

  // Default to 4.0 scale
  if (grade >= 93) return 4.0
  if (grade >= 90) return 3.7
  if (grade >= 87) return 3.3
  if (grade >= 83) return 3.0
  if (grade >= 80) return 2.7
  if (grade >= 77) return 2.3
  if (grade >= 73) return 2.0
  if (grade >= 70) return 1.7
  if (grade >= 67) return 1.3
  if (grade >= 65) return 1.0
  return 0.0
}