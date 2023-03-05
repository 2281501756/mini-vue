export function isObject(obj: any) {
  return typeof obj === 'object' && obj !== null
}

export function isFunction(obj: any) {
  return typeof obj === 'function'
}
export function isNumber(obj: any) {
  return typeof obj === 'number'
}
export function isString(obj: any) {
  return typeof obj === 'string'
}
export function isChange(oldValue: any, value: any) {
  return oldValue !== value && !(Number.isNaN(oldValue) && Number.isNaN(value))
}

export function isArray(target: any) {
  return Array.isArray(target)
}
