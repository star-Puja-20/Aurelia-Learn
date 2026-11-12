// Compare typed answers leniently: ignore capitals, punctuation and extra spaces.
export function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:"“”()\-–—]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isTypedAnswerCorrect(input: string, answers: string[], caseSensitive = false) {
  if (caseSensitive) return answers.includes(input.trim())
  const typed = normalizeAnswer(input)
  return typed.length > 0 && answers.some(answer => normalizeAnswer(answer) === typed)
}

// Shuffle parts, making sure the result is not already in the correct order.
export function shuffleParts(parts: string[]) {
  if (parts.length < 2) return parts.map((text, index) => ({ text, index }))
  const indexed = parts.map((text, index) => ({ text, index }))
  for (let attempt = 0; attempt < 10; attempt++) {
    const copy = [...indexed]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    if (copy.some((item, position) => item.index !== position)) return copy
  }
  return [...indexed].reverse()
}

export function starsForScore(percent: number) {
  return percent >= 90 ? 3 : percent >= 60 ? 2 : 1
}
