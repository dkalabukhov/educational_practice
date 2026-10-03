// Извлекаем только цифры и приводим к формату +7XXXXXXXXXX.
// Принимаем ввод как с 8, так и с 7 в начале.
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')

  if (digits.length === 0) return ''

  // 8XXXXXXXXXX → 7XXXXXXXXXX
  let normalized = digits
  if (normalized.startsWith('8')) {
    normalized = '7' + normalized.slice(1)
  }
  if (!normalized.startsWith('7')) {
    normalized = '7' + normalized
  }

  return '+' + normalized.slice(0, 11)
}

// Форматируем цифры в читаемый вид: +7 (904) 303-2211
export function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 0) return ''

  let normalized = digits
  if (normalized.startsWith('8')) {
    normalized = '7' + normalized.slice(1)
  }
  if (!normalized.startsWith('7')) {
    normalized = '7' + normalized
  }

  const rest = normalized.slice(1, 11) // максимум 10 цифр после семёрки

  const p1 = rest.slice(0, 3)
  const p2 = rest.slice(3, 6)
  const p3 = rest.slice(6, 8)
  const p4 = rest.slice(8, 10)

  let out = '+7'
  if (p1) out += ` (${p1}`
  if (p1.length === 3) out += ')'
  if (p2) out += ` ${p2}`
  if (p3) out += `-${p3}`
  if (p4) out += `-${p4}`

  return out
}

// Проверка: после нормализации ровно 11 цифр и начинается с 7
export function isValidPhone(input: string): boolean {
  const normalized = normalizePhone(input)
  return /^\+7\d{10}$/.test(normalized)
}
