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

export function mapGradeToGpa(grade: number): number {
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