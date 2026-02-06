export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  heading?: boolean; // for section headings in mega-menu style dropdowns
}

export const mainNavigation: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Sobre Nosotros', href: '/sobre-nosotros/' },
  {
    label: 'Procedimientos',
    href: '#',
    children: [
      { label: 'Corporales', href: '/procedimientos-corporales/', heading: true },
      { label: 'Liposucción Vaser', href: '/procedimientos-corporales/liposuccion-vaser/' },
      { label: 'Abdominoplastia', href: '/procedimientos-corporales/abdominoplastia/' },
      { label: 'Aumento Mamario', href: '/procedimientos-corporales/aumento-mamario/' },
      { label: 'Lipoescultura', href: '/procedimientos-corporales/lipoescultura/' },
      { label: 'CelluSculpt Pro', href: '/procedimientos-corporales/cellusculpt-pro/' },
      { label: 'Ver todos →', href: '/procedimientos-corporales/' },
      { label: 'Faciales', href: '/procedimientos-faciales/', heading: true },
      { label: 'Toxina Botulínica', href: '/procedimientos-faciales/toxina-botulinica/' },
      { label: 'Rellenos Faciales', href: '/procedimientos-faciales/rellenos-faciales/' },
      { label: 'Blefaroplastia', href: '/procedimientos-faciales/blefaroplastia/' },
      { label: 'Hilos Tensores', href: '/procedimientos-faciales/hilos-tensores/' },
      { label: 'Lifting Facial', href: '/procedimientos-faciales/lifting-facial/' },
      { label: 'Ver todos →', href: '/procedimientos-faciales/' },
      { label: 'Íntimos', href: '/procedimientos-intimos/', heading: true },
      { label: 'Rejuvenecimiento Láser CO2', href: '/procedimientos-intimos/rejuvenecimiento-intimo-laser-co2/' },
      { label: 'Labioplastia Láser', href: '/procedimientos-intimos/labioplastia-laser/' },
      { label: 'Vaginoplastia', href: '/procedimientos-intimos/vaginoplastia/' },
      { label: 'Ver todos →', href: '/procedimientos-intimos/' },
    ],
  },
  { label: 'Lifechip', href: '/procedimientos-corporales/lifechip-testosterona/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Certificados', href: '/autorizaciones/' },
  { label: 'Contacto', href: '/contacto/' },
];

// Separate full navigation for mobile (keeps all items expanded)
export const mobileNavigation: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Sobre Nosotros', href: '/sobre-nosotros/' },
  {
    label: 'Procedimientos Corporales',
    href: '/procedimientos-corporales/',
    children: [
      { label: 'Liposucción Vaser', href: '/procedimientos-corporales/liposuccion-vaser/' },
      { label: 'Abdominoplastia', href: '/procedimientos-corporales/abdominoplastia/' },
      { label: 'Lipo en Ginecomastia', href: '/procedimientos-corporales/lipo-en-ginecomastia/' },
      { label: 'Lipo Transferencia', href: '/procedimientos-corporales/lipo-transferencia/' },
      { label: 'Lipoescultura', href: '/procedimientos-corporales/lipoescultura/' },
      { label: 'Minilipo Vaser', href: '/procedimientos-corporales/minilipo-vaser/' },
      { label: 'Lifting de Brazos', href: '/procedimientos-corporales/lifting-de-brazos/' },
      { label: 'Aumento Mamario', href: '/procedimientos-corporales/aumento-mamario/' },
      { label: 'Hiperhidrosis', href: '/procedimientos-corporales/hiperhidrosis/' },
      { label: 'CelluSculpt Pro', href: '/procedimientos-corporales/cellusculpt-pro/' },
      { label: 'Carboxiterapia', href: '/procedimientos-corporales/carboxiterapia/' },
    ],
  },
  {
    label: 'Procedimientos Faciales',
    href: '/procedimientos-faciales/',
    children: [
      { label: 'Blefaroplastia', href: '/procedimientos-faciales/blefaroplastia/' },
      { label: 'Lifting Facial', href: '/procedimientos-faciales/lifting-facial/' },
      { label: 'Toxina Botulínica', href: '/procedimientos-faciales/toxina-botulinica/' },
      { label: 'Rellenos Faciales', href: '/procedimientos-faciales/rellenos-faciales/' },
      { label: 'Plasma Rico en Plaquetas', href: '/procedimientos-faciales/plasma-rico-en-plaquetas/' },
      { label: 'Bioestimulador de Colágeno', href: '/procedimientos-faciales/bioestimulador-de-colageno/' },
      { label: 'Mesoterapia con Elástica', href: '/procedimientos-faciales/mesoterapia-con-elastica/' },
      { label: 'Hilos Tensores', href: '/procedimientos-faciales/hilos-tensores/' },
      { label: 'Bichectomía', href: '/procedimientos-faciales/bichectomia/' },
      { label: 'Bioplastia de Mentón', href: '/procedimientos-faciales/bioplastia-de-menton/' },
      { label: 'Bioplastia de Pómulos', href: '/procedimientos-faciales/bioplastia-de-pomulos/' },
      { label: 'Rinomodelación', href: '/procedimientos-faciales/rinomodelacion/' },
      { label: 'Láser Fraccionado de CO2', href: '/procedimientos-faciales/laser-fraccionado-co2/' },
      { label: 'Lobuloplastia', href: '/procedimientos-faciales/lobuloplastia/' },
      { label: 'Perfilado Mandibular', href: '/procedimientos-faciales/perfilado-mandibular/' },
    ],
  },
  {
    label: 'Procedimientos Íntimos',
    href: '/procedimientos-intimos/',
    children: [
      { label: 'Rejuvenecimiento Íntimo Láser CO2', href: '/procedimientos-intimos/rejuvenecimiento-intimo-laser-co2/' },
      { label: 'Labioplastia Láser', href: '/procedimientos-intimos/labioplastia-laser/' },
      { label: 'Lifting Labios Mayores', href: '/procedimientos-intimos/lifting-labios-mayores/' },
      { label: 'Plasma Rico en Plaquetas Íntimo', href: '/procedimientos-intimos/plasma-rico-en-plaquetas-intimo/' },
      { label: 'Mesoterapia Íntima', href: '/procedimientos-intimos/mesoterapia-intima/' },
      { label: 'Vaginoplastia', href: '/procedimientos-intimos/vaginoplastia/' },
    ],
  },
  { label: 'Lifechip', href: '/procedimientos-corporales/lifechip-testosterona/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Certificados', href: '/autorizaciones/' },
  { label: 'Contacto', href: '/contacto/' },
];

export const footerNavigation = {
  procedimientos: [
    { label: 'Procedimientos Corporales', href: '/procedimientos-corporales/' },
    { label: 'Procedimientos Faciales', href: '/procedimientos-faciales/' },
    { label: 'Procedimientos Íntimos', href: '/procedimientos-intimos/' },
    { label: 'Lifechip', href: '/procedimientos-corporales/lifechip-testosterona/' },
  ],
  clinica: [
    { label: 'Sobre Nosotros', href: '/sobre-nosotros/' },
    { label: 'Experiencias', href: '/experiencias/' },
    { label: 'Blog', href: '/blog/' },
  ],
  legal: [
    { label: 'Términos y Condiciones', href: '/terminos-y-condiciones/' },
    { label: 'Autorizaciones', href: '/autorizaciones/' },
  ],
};
