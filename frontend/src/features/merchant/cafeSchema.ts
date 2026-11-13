import { rules, type Rule } from '../../lib/validation'

// Same limits as CoffeeShopRequestDTO
const phone: Rule = (v) => (!v.trim() || /^\+?[0-9. ()-]{7,15}$/.test(v.trim()) ? null : 'Invalid phone number format provided')

export const cafeSchema = {
  name: [rules.required('Coffee shop name is required'), rules.length(2, 100, 'Name must be between 2 and 100 characters')],
  address: [rules.required('Address is required'), rules.maxLength(255)],
  description: [rules.maxLength(500, 'Description cannot exceed 500 characters')],
  contactEmail: [rules.required('Email is required'), rules.email('Invalid email format'), rules.maxLength(255)],
  contactPhone: [phone],
  lat: [rules.required('Click the map to place your café')],
}
