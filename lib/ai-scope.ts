export const AI_SCOPE = {
  assistedCapabilities: 4,
  totalCapabilities: 16,
  percentage: 25,
  label: '25% AI-assisted',
} as const

if (AI_SCOPE.assistedCapabilities / AI_SCOPE.totalCapabilities * 100 !== AI_SCOPE.percentage) {
  throw new Error('AI scope percentage must remain exactly 25%.')
}
