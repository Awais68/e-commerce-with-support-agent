export interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  hoverImage: string
  description: string
  longDescription: string
  materials: string[]
  care: string[]
  sizes: { size: string; available: boolean }[]
  colors: { name: string; hex: string; available: boolean }[]
  details: string[]
  madeIn: string
}

export const products: Product[] = [
  {
    id: "silk-evening-coat",
    name: "Silk Evening Coat",
    price: 2450,
    category: "Outerwear",
    image: "/elegant-black-silk-evening-coat-luxury-fashion.jpg",
    hoverImage: "/elegant-black-silk-evening-coat-back-view-luxury.jpg",
    description: "A masterpiece of understated elegance",
    longDescription:
      "Crafted from the finest mulberry silk, this evening coat represents the pinnacle of Italian tailoring. Each piece is hand-finished by our master artisans in Florence, ensuring unparalleled quality and attention to detail. The fluid silhouette drapes effortlessly, creating a timeless look suitable for the most discerning occasions.",
    materials: ["100% Mulberry Silk", "Silk charmeuse lining", "Mother of pearl buttons"],
    care: ["Dry clean only", "Store on padded hanger", "Avoid direct sunlight"],
    sizes: [
      { size: "XS", available: true },
      { size: "S", available: true },
      { size: "M", available: true },
      { size: "L", available: false },
      { size: "XL", available: true },
    ],
    colors: [
      { name: "Noir", hex: "#0A0A0A", available: true },
      { name: "Ivory", hex: "#F5F5DC", available: true },
      { name: "Midnight", hex: "#191970", available: false },
    ],
    details: [
      "Hand-stitched lapels",
      "Interior pocket with silk trim",
      "Custom Awais Niaz hardware",
      "Numbered authenticity tag",
    ],
    madeIn: "Florence, Italy",
  },
  {
    id: "cashmere-wrap-dress",
    name: "Cashmere Wrap Dress",
    price: 1890,
    category: "Dresses",
    image: "/cream-cashmere-wrap-dress-elegant-luxury-fashion.jpg",
    hoverImage: "/cream-cashmere-wrap-dress-side-view-luxury.jpg",
    description: "Effortless sophistication in pure cashmere",
    longDescription:
      "This wrap dress is woven from Grade-A Mongolian cashmere, selected for its exceptional softness and durability. The wrap silhouette flatters every figure while the generous proportions ensure comfort without compromising elegance. A wardrobe essential that transitions seamlessly from day to evening.",
    materials: ["100% Grade-A Mongolian Cashmere", "Silk blend lining", "Self-tie belt"],
    care: ["Dry clean recommended", "May be hand washed in cold water", "Lay flat to dry"],
    sizes: [
      { size: "XS", available: true },
      { size: "S", available: false },
      { size: "M", available: true },
      { size: "L", available: true },
      { size: "XL", available: true },
    ],
    colors: [
      { name: "Cream", hex: "#FFFDD0", available: true },
      { name: "Camel", hex: "#C19A6B", available: true },
      { name: "Grey Mélange", hex: "#808080", available: true },
    ],
    details: ["Double-faced construction", "Hand-rolled edges", "Adjustable wrap closure", "Signature interior label"],
    madeIn: "Florence, Italy",
  },
  {
    id: "tailored-wool-blazer",
    name: "Tailored Wool Blazer",
    price: 1650,
    category: "Outerwear",
    image: "/navy-wool-tailored-blazer-luxury-menswear-fashion.jpg",
    hoverImage: "/navy-wool-tailored-blazer-open-luxury-fashion.jpg",
    description: "The foundation of modern elegance",
    longDescription:
      "Cut from Super 150s wool sourced from the finest Australian merino sheep, this blazer exemplifies Awais Niaz's commitment to exceptional quality. The half-canvas construction allows for a natural drape while maintaining structure. Each blazer requires over 30 hours of handwork to complete.",
    materials: ["100% Super 150s Merino Wool", "Bemberg cupro lining", "Horn buttons"],
    care: ["Dry clean only", "Steam to refresh", "Store with cedar blocks"],
    sizes: [
      { size: "46", available: true },
      { size: "48", available: true },
      { size: "50", available: true },
      { size: "52", available: true },
      { size: "54", available: false },
    ],
    colors: [
      { name: "Navy", hex: "#000080", available: true },
      { name: "Charcoal", hex: "#36454F", available: true },
      { name: "Black", hex: "#0A0A0A", available: true },
    ],
    details: ["Half-canvas construction", "Working cuff buttons", "Pick-stitched lapels", "Interior passport pocket"],
    madeIn: "Florence, Italy",
  },
  {
    id: "merino-turtleneck",
    name: "Merino Turtleneck",
    price: 485,
    category: "Knitwear",
    image: "/charcoal-merino-wool-turtleneck-sweater-luxury-min.jpg",
    hoverImage: "/charcoal-merino-turtleneck-detail-texture-luxury.jpg",
    description: "Essential luxury for every season",
    longDescription:
      "Knitted from extra-fine merino wool in a 12-gauge construction, this turtleneck offers exceptional warmth without bulk. The ribbed neck, cuffs, and hem provide subtle texture while maintaining a clean, minimal aesthetic. An indispensable foundation piece for the considered wardrobe.",
    materials: ["100% Extra-fine Merino Wool", "12-gauge knit construction"],
    care: ["Hand wash cold", "Dry flat", "Do not tumble dry"],
    sizes: [
      { size: "XS", available: true },
      { size: "S", available: true },
      { size: "M", available: true },
      { size: "L", available: true },
      { size: "XL", available: false },
    ],
    colors: [
      { name: "Charcoal", hex: "#36454F", available: true },
      { name: "Ecru", hex: "#F5F5DC", available: true },
      { name: "Burgundy", hex: "#722F37", available: true },
      { name: "Forest", hex: "#228B22", available: false },
    ],
    details: ["Fully fashioned construction", "Reinforced seams", "Ribbed trim details", "Embroidered interior label"],
    madeIn: "Florence, Italy",
  },
  {
    id: "leather-belt",
    name: "Artisan Leather Belt",
    price: 320,
    category: "Accessories",
    image: "/brown-leather-belt-gold-buckle-luxury-accessory-mi.jpg",
    hoverImage: "/brown-leather-belt-detail-stitching-luxury.jpg",
    description: "Handcrafted from Tuscan leather",
    longDescription:
      "Each belt is cut from a single piece of vegetable-tanned Tuscan leather, selected for its natural grain and character. The solid brass buckle is cast using traditional methods and finished by hand. With proper care, this belt will develop a beautiful patina over years of wear.",
    materials: ["Vegetable-tanned Tuscan leather", "Solid brass buckle", "Hand-stitched edges"],
    care: ["Condition with leather balm", "Store flat or rolled", "Avoid water exposure"],
    sizes: [
      { size: "80", available: true },
      { size: "85", available: true },
      { size: "90", available: true },
      { size: "95", available: true },
      { size: "100", available: true },
    ],
    colors: [
      { name: "Cognac", hex: "#9A463D", available: true },
      { name: "Dark Brown", hex: "#3E2723", available: true },
      { name: "Black", hex: "#0A0A0A", available: true },
    ],
    details: ["3.5cm width", "Single-prong buckle", "Burnished edges", "Embossed Awais Niaz logo"],
    madeIn: "Florence, Italy",
  },
  {
    id: "silk-scarf",
    name: "Silk Twill Scarf",
    price: 295,
    category: "Accessories",
    image: "/silk-scarf-abstract-pattern-luxury-accessory-elega.jpg",
    hoverImage: "/silk-scarf-draped-luxury-fashion-accessory.jpg",
    description: "Woven poetry in silk",
    longDescription:
      "Printed using traditional screen-printing techniques, each scarf requires up to 12 separate screens to achieve its depth of color. The hand-rolled edges are a hallmark of true luxury, executed by skilled artisans who have perfected this craft over decades.",
    materials: ["100% Silk twill", "Hand-rolled edges", "Screen-printed design"],
    care: ["Dry clean only", "Store in tissue paper", "Avoid perfume contact"],
    sizes: [
      { size: "70x70cm", available: true },
      { size: "90x90cm", available: true },
    ],
    colors: [
      { name: "Archive Print", hex: "#D4AF37", available: true },
      { name: "Geometric", hex: "#708090", available: true },
      { name: "Botanical", hex: "#228B22", available: true },
    ],
    details: ["12-color screen print", "Hand-rolled hem", "90x90cm dimensions", "Signature Awais Niaz motif"],
    madeIn: "Como, Italy",
  },
  {
    id: "linen-trousers",
    name: "Relaxed Linen Trousers",
    price: 580,
    category: "Trousers",
    image: "/beige-linen-trousers-relaxed-fit-luxury-fashion.jpg",
    hoverImage: "/beige-linen-trousers-detail-pocket-luxury.jpg",
    description: "Effortless summer elegance",
    longDescription:
      "Woven from Belgian linen renowned for its exceptional quality, these trousers offer a relaxed silhouette without sacrificing sophistication. The pre-washed fabric ensures minimal shrinkage and a soft hand feel from the first wear. Thoughtful details include interior waistband finishing and French seams throughout.",
    materials: ["100% Belgian Linen", "Cotton pocket lining", "Corozo nut buttons"],
    care: ["Machine wash cold", "Tumble dry low", "Iron while damp for crisp finish"],
    sizes: [
      { size: "XS", available: true },
      { size: "S", available: true },
      { size: "M", available: false },
      { size: "L", available: true },
      { size: "XL", available: true },
    ],
    colors: [
      { name: "Sand", hex: "#C2B280", available: true },
      { name: "White", hex: "#FFFFFF", available: true },
      { name: "Navy", hex: "#000080", available: true },
    ],
    details: ["Relaxed fit", "Elasticated back waist", "French seam construction", "Slash pockets"],
    madeIn: "Florence, Italy",
  },
  {
    id: "structured-handbag",
    name: "Structured Leather Handbag",
    price: 1890,
    category: "Accessories",
    image: "/black-structured-leather-handbag-luxury-minimal-de.jpg",
    hoverImage: "/placeholder.svg?height=800&width=600",
    description: "Architectural precision meets artisanal craft",
    longDescription:
      "This handbag represents the culmination of Awais Niaz's leather expertise. Each bag is constructed from a single hide, carefully selected for consistency of grain and texture. The architectural silhouette is achieved through meticulous internal construction, while the exterior remains elegantly minimal.",
    materials: ["Full-grain calfskin leather", "Suede interior lining", "Brass hardware with palladium finish"],
    care: ["Store in dust bag", "Condition bi-annually", "Avoid rain exposure"],
    sizes: [
      { size: "Small", available: true },
      { size: "Medium", available: true },
      { size: "Large", available: false },
    ],
    colors: [
      { name: "Noir", hex: "#0A0A0A", available: true },
      { name: "Burgundy", hex: "#722F37", available: true },
      { name: "Tan", hex: "#D2B48C", available: true },
    ],
    details: ["Single-hide construction", "Interior zip pocket", "Detachable shoulder strap", "Signature Awais Niaz clasp"],
    madeIn: "Florence, Italy",
  },
  {
    id: "baby-cotton-onesie",
    name: "Baby Cotton Onesie",
    price: 65,
    category: "Baby",
    image: "/baby-cotton-onesie.jpg",
    hoverImage: "/baby-cotton-onesie-hover.jpg",
    description: "Cloud-soft essentials for the littlest ones",
    longDescription:
      "Crafted from GOTS-certified organic cotton, this onesie is impossibly soft against delicate newborn skin. The snap closure makes dressing effortless, while the relaxed cut allows freedom of movement for crawling and play. Finished with a gentle ribbed trim and made to be washed again and again.",
    materials: ["100% GOTS-certified organic cotton", "Nickel-free snap closures", "Ribbed cotton trim"],
    care: ["Machine wash cold", "Tumble dry low", "Do not bleach"],
    sizes: [
      { size: "NB", available: true },
      { size: "0-3M", available: true },
      { size: "3-6M", available: true },
      { size: "6-12M", available: true },
      { size: "12-18M", available: false },
    ],
    colors: [
      { name: "Cloud White", hex: "#F5F5F5", available: true },
      { name: "Blush", hex: "#F4C2C2", available: true },
      { name: "Sky", hex: "#87CEEB", available: true },
    ],
    details: ["Snap-closure crotch", "Reinforced seams", "Breathable knit", "Tag-free neckline"],
    madeIn: "Florence, Italy",
  },
  {
    id: "baby-knit-romper",
    name: "Baby Knit Romper",
    price: 85,
    category: "Baby",
    image: "/baby-knit-romper.jpg",
    hoverImage: "/baby-knit-romper-hover.jpg",
    description: "Heirloom-quality knitwear for tiny explorers",
    longDescription:
      "This romper is knitted from extra-soft merino blend yarn, chosen for its warmth and gentle touch. The hand-finished details, including a delicate lace inset and mother-of-pearl buttons, elevate everyday dressing into something special. A piece meant to be passed down.",
    materials: ["70% Merino wool / 30% cotton", "Mother-of-pearl buttons", "Cotton lined"],
    care: ["Hand wash cold", "Lay flat to dry", "Warm iron"],
    sizes: [
      { size: "0-3M", available: true },
      { size: "3-6M", available: true },
      { size: "6-12M", available: true },
      { size: "12-18M", available: true },
      { size: "18-24M", available: false },
    ],
    colors: [
      { name: "Ivory", hex: "#FFFFF0", available: true },
      { name: "Powder Pink", hex: "#FFD1DC", available: true },
      { name: "Sage", hex: "#BCB88A", available: true },
    ],
    details: ["Merino blend knit", "Lace inset detail", "Mother-of-pearl buttons", "Envelope neckline"],
    madeIn: "Florence, Italy",
  },
  {
    id: "girls-floral-dress",
    name: "Girls Floral Party Dress",
    price: 145,
    category: "Girls",
    image: "/girls-floral-dress.jpg",
    hoverImage: "/girls-floral-dress-hover.jpg",
    description: "A twirl-worthy dress for special days",
    longDescription:
      "A joyful celebration of childhood, this dress features a hand-drawn floral print on soft cotton lawn. The gathered skirt gives an airy silhouette that spins beautifully, while the fully lined bodice ensures comfort all day. Finished with a satin bow at the waist for a touch of whimsy.",
    materials: ["100% Cotton lawn", "Silk-touch satin bow", "Cotton lining"],
    care: ["Machine wash cold", "Hang to dry", "Warm iron on reverse"],
    sizes: [
      { size: "2Y", available: true },
      { size: "4Y", available: true },
      { size: "6Y", available: true },
      { size: "8Y", available: true },
      { size: "10Y", available: true },
    ],
    colors: [
      { name: "Garden Bloom", hex: "#E8B4B8", available: true },
      { name: "Sky Meadow", hex: "#A9C6D9", available: true },
    ],
    details: ["Gathered twirl skirt", "Satin waist bow", "Hidden side zip", "Fully lined bodice"],
    madeIn: "Florence, Italy",
  },
  {
    id: "girls-knit-cardigan",
    name: "Girls Knit Cardigan",
    price: 120,
    category: "Girls",
    image: "/girls-knit-cardigan.jpg",
    hoverImage: "/girls-knit-cardigan-hover.jpg",
    description: "Cozy layers with timeless charm",
    longDescription:
      "An enduring classic reimagined for little ones, this cardigan is knitted from a supersoft cotton blend. Ribbed trims and polished buttons add a refined finish, while the relaxed fit layers beautifully over dresses or tees. Designed to be worn, washed, and loved all season long.",
    materials: ["100% Cotton", "Corozo nut buttons", "Ribbed knit trim"],
    care: ["Machine wash gentle", "Lay flat to dry", "Cool iron"],
    sizes: [
      { size: "2Y", available: true },
      { size: "4Y", available: true },
      { size: "6Y", available: true },
      { size: "8Y", available: true },
      { size: "10Y", available: false },
    ],
    colors: [
      { name: "Blush", hex: "#F4C2C2", available: true },
      { name: "Oat", hex: "#D6C9B8", available: true },
      { name: "Heather Grey", hex: "#B8B8B8", available: true },
    ],
    details: ["Relaxed fit", "Corozo nut buttons", "Ribbed cuffs and hem", "Reinforced shoulder seams"],
    madeIn: "Florence, Italy",
  },
  {
    id: "mens-wool-overcoat",
    name: "Men's Wool Overcoat",
    price: 1980,
    category: "Men Winter",
    image: "/mens-wool-overcoat.jpg",
    hoverImage: "/mens-wool-overcoat-hover.jpg",
    description: "A statement in engineered warmth",
    longDescription:
      "Cut from a dense double-faced wool, this overcoat delivers remarkable warmth without weight. The clean, sculpted lines are achieved through a full-canvas construction that maintains its shape season after season. Horn buttons and a hidden placket complete a look of quiet authority.",
    materials: ["100% Double-faced wool", "Bemberg cupro lining", "Natural horn buttons"],
    care: ["Dry clean only", "Steam to refresh", "Store on a padded hanger"],
    sizes: [
      { size: "46", available: true },
      { size: "48", available: true },
      { size: "50", available: true },
      { size: "52", available: true },
      { size: "54", available: false },
    ],
    colors: [
      { name: "Charcoal", hex: "#36454F", available: true },
      { name: "Camel", hex: "#C19A6B", available: true },
      { name: "Black", hex: "#0A0A0A", available: true },
    ],
    details: ["Full-canvas construction", "Hidden placket", "Interior chest pocket", "Double vent"],
    madeIn: "Florence, Italy",
  },
  {
    id: "mens-cashmere-sweater",
    name: "Men's Cashmere Sweater",
    price: 720,
    category: "Men Winter",
    image: "/mens-cashmere-sweater.jpg",
    hoverImage: "/mens-cashmere-sweater-hover.jpg",
    description: "Grade-A cashmere for the coldest days",
    longDescription:
      "Knitted from two-ply Grade-A Mongolian cashmere, this sweater is the definition of cozy luxury. The classic crew-neck silhouette and ribbed trims keep it timeless, while the 14-gauge knit gives it a refined, tailored drape. An investment in warmth that lasts a lifetime.",
    materials: ["100% Grade-A Mongolian cashmere", "Two-ply construction", "Ribbed knit trim"],
    care: ["Hand wash cold", "Lay flat to dry", "Store folded"],
    sizes: [
      { size: "XS", available: true },
      { size: "S", available: true },
      { size: "M", available: true },
      { size: "L", available: true },
      { size: "XL", available: true },
    ],
    colors: [
      { name: "Oatmeal", hex: "#E8DCC8", available: true },
      { name: "Charcoal", hex: "#36454F", available: true },
      { name: "Deep Burgundy", hex: "#722F37", available: true },
    ],
    details: ["14-gauge knit", "Ribbed crew neck", "Reinforced shoulder seams", "Fully fashioned construction"],
    madeIn: "Florence, Italy",
  },
  {
    id: "mens-linen-shirt",
    name: "Men's Linen Shirt",
    price: 320,
    category: "Men Summer",
    image: "/mens-linen-shirt.jpg",
    hoverImage: "/mens-linen-shirt-hover.jpg",
    description: "Breezy elegance for warm days",
    longDescription:
      "Woven from French flax linen renowned for its breathability, this shirt is designed for warm climates. The garment-dyed finish gives it a lived-in softness from the first wear, while the camp collar adds a relaxed yet polished character. An essential for the summer wardrobe.",
    materials: ["100% French flax linen", "Corozo nut buttons", "Garment-dyed finish"],
    care: ["Machine wash cold", "Tumble dry low", "Iron while damp"],
    sizes: [
      { size: "S", available: true },
      { size: "M", available: true },
      { size: "L", available: true },
      { size: "XL", available: true },
      { size: "XXL", available: false },
    ],
    colors: [
      { name: "Sand", hex: "#D8CBB8", available: true },
      { name: "Sky Blue", hex: "#87CEEB", available: true },
      { name: "White", hex: "#FFFFFF", available: true },
    ],
    details: ["Camp collar", "Garment-dyed", "Single chest pocket", "Reinforced placket"],
    madeIn: "Florence, Italy",
  },
  {
    id: "womens-satin-heels",
    name: "Women's Satin Heels",
    price: 540,
    category: "Shoes",
    image: "/womens-satin-heels.jpg",
    hoverImage: "/womens-satin-heels-hover.jpg",
    description: "Sculptural elegance for evening occasions",
    longDescription:
      "A study in refined glamour, these heels are wrapped in lustrous silk satin and set on a slender 90mm heel. The pointed toe elongates the silhouette, while the cushioned insole ensures comfort through the longest evenings. Hand-finished details make each pair unique.",
    materials: ["Silk satin upper", "Leather lining", "Leather sole"],
    care: ["Wipe with a soft dry cloth", "Store in the dust bag", "Protect from moisture"],
    sizes: [
      { size: "36", available: true },
      { size: "37", available: true },
      { size: "38", available: true },
      { size: "39", available: true },
      { size: "40", available: true },
    ],
    colors: [
      { name: "Blush", hex: "#F4C2C2", available: true },
      { name: "Noir", hex: "#0A0A0A", available: true },
      { name: "Bordeaux", hex: "#4A0404", available: true },
    ],
    details: ["90mm stiletto heel", "Pointed toe", "Cushioned insole", "Hand-stitched topline"],
    madeIn: "Florence, Italy",
  },
  {
    id: "mens-leather-oxfords",
    name: "Men's Leather Oxfords",
    price: 680,
    category: "Shoes",
    image: "/mens-leather-oxfords.jpg",
    hoverImage: "/mens-leather-oxfords-hover.jpg",
    description: "Timeless Goodyear-welted craftsmanship",
    longDescription:
      "Constructed using the traditional Goodyear welt method, these oxfords are built to be resoled and worn for decades. The full-grain calf leather develops a rich patina over time, while the Blake-stitched construction ensures flexibility from the first step.",
    materials: ["Full-grain calf leather", "Leather lining", "Leather sole"],
    care: ["Polish with neutral cream", "Use cedar shoe trees", "Condition monthly"],
    sizes: [
      { size: "40", available: true },
      { size: "41", available: true },
      { size: "42", available: true },
      { size: "43", available: true },
      { size: "44", available: false },
    ],
    colors: [
      { name: "Dark Brown", hex: "#3E2723", available: true },
      { name: "Black", hex: "#0A0A0A", available: true },
      { name: "Oxblood", hex: "#4A0404", available: true },
    ],
    details: ["Goodyear welt construction", "Full-grain calf leather", "Blind eyelets", "Leather insole"],
    madeIn: "Florence, Italy",
  },
  {
    id: "baby-leather-booties",
    name: "Baby Leather Booties",
    price: 55,
    category: "Shoes",
    image: "/baby-leather-booties.jpg",
    hoverImage: "/baby-leather-booties-hover.jpg",
    description: "First steps in supple leather",
    longDescription:
      "Made from chrome-free, vegetable-tanned leather, these booties are gentle on growing feet. The soft, flexible sole allows natural movement while the elastic ankle keeps them securely in place. A beautiful first-shoe keepsake, handcrafted with care.",
    materials: ["Vegetable-tanned leather", "Cotton lining", "Elastic ankle"],
    care: ["Wipe clean with damp cloth", "Air dry", "Condition with leather balm"],
    sizes: [
      { size: "0-3M", available: true },
      { size: "3-6M", available: true },
      { size: "6-12M", available: true },
      { size: "12-18M", available: true },
      { size: "18-24M", available: true },
    ],
    colors: [
      { name: "Tan", hex: "#D2B48C", available: true },
      { name: "White", hex: "#FFFFFF", available: true },
      { name: "Blush", hex: "#F4C2C2", available: true },
    ],
    details: ["Flexible soft sole", "Elastic ankle fit", "Chrome-free leather", "Hand-stitched detail"],
    madeIn: "Florence, Italy",
  },
]

export const categories = [
  "All",
  "Outerwear",
  "Dresses",
  "Knitwear",
  "Trousers",
  "Accessories",
  "Baby",
  "Girls",
  "Men Winter",
  "Men Summer",
  "Shoes",
]

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products
  return products.filter((p) => p.category === category)
}

export function getRelatedProducts(currentId: string, limit = 4): Product[] {
  const current = getProductById(currentId)
  if (!current) return products.slice(0, limit)

  const sameCategory = products.filter((p) => p.id !== currentId && p.category === current.category)
  const others = products.filter((p) => p.id !== currentId && p.category !== current.category)

  return [...sameCategory, ...others].slice(0, limit)
}
