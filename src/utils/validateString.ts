// utils/validateString.ts

export function isEmail(value: string): boolean {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(value);
}

export function isPhoneNumber(value: string): boolean {
  const phonePattern = /^[0-9]{10}$/;  // Simple phone validation (you can enhance it for international formats)
  return phonePattern.test(value);
}
