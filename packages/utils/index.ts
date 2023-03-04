export function isObject(obj: any) {
  return typeof obj === 'object' && obj !== null
}

export function isChange(oldValue: any, value: any) {
  return oldValue !== value && !(Number.isNaN(oldValue) && Number.isNaN(value))
}

export function isArray(target: any) {
  return Array.isArray(target)
}
