import {
  Accessibility,
  AirVent,
  Armchair,
  Baby,
  Bike,
  BookOpen,
  Cigarette,
  Coffee,
  CreditCard,
  Dog,
  Laptop,
  Leaf,
  Music,
  PlugZap,
  ShoppingBag,
  SquareParking,
  Sun,
  TreePine,
  Utensils,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

// Facility.icon is a free-form string in the DB, so match on icon and name keywords.
const MATCHERS: Array<[RegExp, LucideIcon]> = [
  [/wi-?fi|internet/i, Wifi],
  [/plug|power|socket|outlet|priz/i, PlugZap],
  [/park/i, SquareParking],
  [/pet|dog|animal/i, Dog],
  [/terrace|terasa|outdoor|garden|gradina/i, TreePine],
  [/sun|patio/i, Sun],
  [/vegan|vegetarian|plant|leaf/i, Leaf],
  [/laptop|work|cowork/i, Laptop],
  [/access|wheel/i, Accessibility],
  [/card|contactless|pay/i, CreditCard],
  [/take-?away|to go|pickup/i, ShoppingBag],
  [/air|a\/?c|condition/i, AirVent],
  [/music|vinyl/i, Music],
  [/baby|kid|child|family/i, Baby],
  [/smok/i, Cigarette],
  [/bike|bicycle/i, Bike],
  [/book|library|read/i, BookOpen],
  [/food|brunch|kitchen|breakfast/i, Utensils],
  [/seat|sofa|lounge/i, Armchair],
]

export function facilityIcon(name: string, icon?: string | null): LucideIcon {
  const haystack = `${icon ?? ''} ${name}`
  return MATCHERS.find(([re]) => re.test(haystack))?.[1] ?? Coffee
}
