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
    label: 'Servicios',
    href: '#',
    children: [
      { label: 'Cirugías Corporales', href: '/procedimientos-corporales/', heading: true },
      { label: 'Liposucción Vaser', href: '/procedimientos-corporales/liposuccion-vaser/' },
      { label: 'Abdominoplastia', href: '/procedimientos-corporales/abdominoplastia/' },
      { label: 'Lipoescultura', href: '/procedimientos-corporales/lipoescultura/' },
      { label: 'CelluSculpt Pro', href: '/procedimientos-corporales/cellusculpt-pro/' },
      { label: 'Ver todos →', href: '/procedimientos-corporales/' },
      { label: 'Armonización Facial', href: '/procedimientos-faciales/', heading: true },
      { label: 'Toxina Botulínica', href: '/procedimientos-faciales/toxina-botulinica/' },
      { label: 'Rellenos Faciales', href: '/procedimientos-faciales/rellenos-faciales/' },
      { label: 'Hilos Tensores', href: '/procedimientos-faciales/hilos-tensores/' },
      { label: 'Blefaroplastia', href: '/procedimientos-faciales/blefaroplastia/' },
      { label: 'Ver todos →', href: '/procedimientos-faciales/' },
      { label: 'Ginecoestética', href: '/procedimientos-intimos/', heading: true },
      { label: 'Rejuvenecimiento Láser CO2', href: '/procedimientos-intimos/rejuvenecimiento-intimo-laser-co2/' },
      { label: 'Labioplastia Láser', href: '/procedimientos-intimos/labioplastia-laser/' },
      { label: 'Vaginoplastia', href: '/procedimientos-intimos/vaginoplastia/' },
      { label: 'Ver todos →', href: '/procedimientos-intimos/' },
      { label: 'Cirugías Mamarias', href: '/procedimientos-corporales/aumento-mamario/', heading: true },
      { label: 'Aumento Mamario', href: '/procedimientos-corporales/aumento-mamario/' },
      { label: 'Bienestar Hormonal', href: '/procedimientos-corporales/lifechip-testosterona/', heading: true },
      { label: 'LifeChip Testosterona', href: '/procedimientos-corporales/lifechip-testosterona/' },
    ],
  },
  { label: 'Blog', href: '/blog/' },
  { label: 'Certificados', href: '/autorizaciones/' },
  { label: 'Contacto', href: '/contacto/' },
];

// Mobile navigation: all 5 pillars grouped under "Servicios"
export const mobileNavigation: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Sobre Nosotros', href: '/sobre-nosotros/' },
  {
    label: 'Servicios',
    href: '#',
    children: [
      {
        label: 'Cirugías Corporales',
        href: '/procedimientos-corporales/',
        children: [
          { label: 'Ver todos los procedimientos', href: '/procedimientos-corporales/' },
          { label: 'Liposucción Vaser', href: '/procedimientos-corporales/liposuccion-vaser/' },
          { label: 'Abdominoplastia', href: '/procedimientos-corporales/abdominoplastia/' },
          { label: 'Lipo en Ginecomastia', href: '/procedimientos-corporales/lipo-en-ginecomastia/' },
          { label: 'Lipo Transferencia', href: '/procedimientos-corporales/lipo-transferencia/' },
          { label: 'Lipoescultura', href: '/procedimientos-corporales/lipoescultura/' },
          { label: 'Minilipo Vaser', href: '/procedimientos-corporales/minilipo-vaser/' },
          { label: 'Lifting de Brazos', href: '/procedimientos-corporales/lifting-de-brazos/' },
          { label: 'Hiperhidrosis', href: '/procedimientos-corporales/hiperhidrosis/' },
          { label: 'CelluSculpt Pro', href: '/procedimientos-corporales/cellusculpt-pro/' },
          { label: 'Carboxiterapia', href: '/procedimientos-corporales/carboxiterapia/' },
        ],
      },
      {
        label: 'Armonización Facial',
        href: '/procedimientos-faciales/',
        children: [
          { label: 'Ver todos los procedimientos', href: '/procedimientos-faciales/' },
          { label: 'Toxina Botulínica', href: '/procedimientos-faciales/toxina-botulinica/' },
          { label: 'Rellenos Faciales', href: '/procedimientos-faciales/rellenos-faciales/' },
          { label: 'Blefaroplastia', href: '/procedimientos-faciales/blefaroplastia/' },
          { label: 'Lifting Facial', href: '/procedimientos-faciales/lifting-facial/' },
          { label: 'Hilos Tensores', href: '/procedimientos-faciales/hilos-tensores/' },
          { label: 'Plasma Rico en Plaquetas', href: '/procedimientos-faciales/plasma-rico-en-plaquetas/' },
          { label: 'Bioestimulador de Colágeno', href: '/procedimientos-faciales/bioestimulador-de-colageno/' },
          { label: 'Mesoterapia con Elástica', href: '/procedimientos-faciales/mesoterapia-con-elastica/' },
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
        label: 'Ginecoestética',
        href: '/procedimientos-intimos/',
        children: [
          { label: 'Ver todos los procedimientos', href: '/procedimientos-intimos/' },
          { label: 'Rejuvenecimiento Íntimo Láser CO2', href: '/procedimientos-intimos/rejuvenecimiento-intimo-laser-co2/' },
          { label: 'Labioplastia Láser', href: '/procedimientos-intimos/labioplastia-laser/' },
          { label: 'Lifting Labios Mayores', href: '/procedimientos-intimos/lifting-labios-mayores/' },
          { label: 'Plasma Rico en Plaquetas Íntimo', href: '/procedimientos-intimos/plasma-rico-en-plaquetas-intimo/' },
          { label: 'Mesoterapia Íntima', href: '/procedimientos-intimos/mesoterapia-intima/' },
          { label: 'Vaginoplastia', href: '/procedimientos-intimos/vaginoplastia/' },
        ],
      },
      { label: 'Cirugías Mamarias', href: '/procedimientos-corporales/aumento-mamario/' },
      { label: 'Bienestar Hormonal', href: '/procedimientos-corporales/lifechip-testosterona/' },
    ],
  },
  {
    label: 'Blog',
    href: '/blog/',
    children: [
      { label: 'Ver todos los artículos', href: '/blog/' },
      { label: 'Procedimientos Corporales', href: '/blog/' },
      { label: 'Armonización Facial', href: '/blog/' },
      { label: 'Ginecología Estética', href: '/blog/' },
      { label: 'Cirugía Mamaria', href: '/blog/' },
      { label: 'Bienestar Hormonal', href: '/blog/' },
    ],
  },
  { label: 'Certificados', href: '/autorizaciones/' },
  { label: 'Contacto', href: '/contacto/' },
];

export const footerNavigation = {
  procedimientos: [
    { label: 'Cirugías Corporales', href: '/procedimientos-corporales/' },
    { label: 'Armonización Facial', href: '/procedimientos-faciales/' },
    { label: 'Ginecoestética', href: '/procedimientos-intimos/' },
    { label: 'Cirugías Mamarias', href: '/procedimientos-corporales/aumento-mamario/' },
    { label: 'Bienestar Hormonal', href: '/procedimientos-corporales/lifechip-testosterona/' },
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
