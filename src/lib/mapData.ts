// Cerro Machín Volcano – Colombia
export const VOLCANO_POSITION: [number, number] = [4.487, -75.389];

export type VolcanoAlertLevel = "green" | "yellow" | "orange" | "red";

export const VOLCANO_ALERT_LEVELS: Record<
  VolcanoAlertLevel,
  { label: string; color: string; borderColor: string; status: string; description: string }
> = {
  green: {
    label: "Green",
    color: "#16a34a",
    borderColor: "border-green-500",
    status: "Normal activity",
    description: "Volcano behaving within normal parameters. No eruption expected.",
  },
  yellow: {
    label: "Yellow",
    color: "#ca8a04",
    borderColor: "border-yellow-400",
    status: "No important changes",
    description: "Active volcano with changes in the baseline behavior of monitored parameters.",
  },
  orange: {
    label: "Orange",
    color: "#ea580c",
    borderColor: "border-orange-500",
    status: "Heightened activity",
    description: "Increased unrest. Eruption possible within days to weeks.",
  },
  red: {
    label: "Red",
    color: "#dc2626",
    borderColor: "border-red-500",
    status: "Eruption imminent or in progress",
    description: "Eruption imminent, in progress, or recently ended. Immediate action required.",
  },
};

export const DEFAULT_VOLCANO_ALERT_LEVEL: VolcanoAlertLevel = "yellow";

export type DataPointType =
  | "sgi_geo"
  | "sgi_magnetometry"
  | "sgi_gravimetry"
  | "gidco"
  | "mt_acquisition"
  | "uis_geophysics";

export interface DataPoint {
  id: string;
  position: [number, number];
  type: DataPointType;
  label?: string;
  description?: string;
  acquired?: boolean;
}

export interface Participant {
  name: string;
  role: "field" | "office";
  position?: [number, number];
  status: "active" | "inactive";
  lastUpdate: string;
  location: string;
}

export const DATA_POINTS: DataPoint[] = [
  // ── GRAVIMETRIA (SGI GEO – Gravimetry) ───────────────────────────────────
  { id: "GRAV01", position: [4.488373, -75.378695], type: "sgi_gravimetry", label: "GRAV01", acquired: false, description: "Vía Hostal Termales del Machín - Cráter del VCM. Finca La Secreta, sobre los potreros de la entrada a la finca." },
  { id: "GRAV02", position: [4.486972, -75.381486], type: "sgi_gravimetry", label: "GRAV02", acquired: false, description: "Vía Hostal Termales del Machín - Cráter del VCM. Finca La Secreta, inicio del camino de piedras." },
  { id: "GRAV03", position: [4.482683, -75.382333], type: "sgi_gravimetry", label: "GRAV03", acquired: false, description: "Vía Hostal Termales del Machín - Cráter del VCM. Finca La Secreta, al llegar a la finca, bajar por el camino de piedras hasta llegar al punto." },
  { id: "GRAV04", position: [4.489064, -75.389773], type: "sgi_gravimetry", label: "GRAV04", acquired: false, description: "Vía desde Hostal Termales del Machín - Cráter, en la Y que hay entre la subida al cráter y la vía a Toche. Sendero marcado." },
  { id: "GRAV05", position: [4.491753, -75.394164], type: "sgi_gravimetry", label: "GRAV05", acquired: false, description: "Desde Hostal Termales del Machín subiendo hacia el borde del cráter por el NE." },
  { id: "GRAV06", position: [4.488734, -75.394672], type: "sgi_gravimetry", label: "GRAV06", acquired: false, description: "Vía Termales del Machín-Toche, en el margen izquierdo de la carretera sobre el terreno de la Finca Machín 5." },
  { id: "GRAV07", position: [4.487487, -75.396565], type: "sgi_gravimetry", label: "GRAV07", acquired: false, description: "Vía Hostal Termales del Machín - Toche, Finca Machín 5, a 10 metros de la Escuela Machín." },
  { id: "GRAV08", position: [4.478997, -75.394072], type: "sgi_gravimetry", label: "GRAV08", acquired: false, description: "Desde Hostal Termales del Machín subiendo hacia el borde del cráter por el NE." },
  { id: "GRAV09", position: [4.473522, -75.389281], type: "sgi_gravimetry", label: "GRAV09", acquired: false, description: "Vía Hostal Termales del Machín - Tapias, Finca Buenavista." },
  { id: "GRAV10", position: [4.471995, -75.388759], type: "sgi_gravimetry", label: "GRAV10", acquired: false, description: "Sobre la vía Hostal Termales del Machín - Tapias. Finca El Jardín." },
  { id: "GRAV11", position: [4.446883, -75.384339], type: "sgi_gravimetry", label: "GRAV11", acquired: false, description: "Vía Hostal Termales del Machín - Tapias, Finca Buenavista. Presencia de cercas eléctricas." },
  { id: "GRAV12", position: [4.472608, -75.380261], type: "sgi_gravimetry", label: "GRAV12", acquired: false, description: "Vía Hostal Termales del Machín - Tapias, Finca Buenavista. Para llegar se debe subir hasta los potreros de vacas y bajar hacia la Quebrada Azufral. Presencia de cercas eléctricas." },
  { id: "GRAV13", position: [4.474810, -75.376263], type: "sgi_gravimetry", label: "GRAV13", acquired: false, description: "Vía Hostal Faldas del Machín-Tapias, sendero marcado desde los invernaderos hasta la Finca del Señor Carlos." },
  { id: "GRAV14", position: [4.496579, -75.400240], type: "sgi_gravimetry", label: "GRAV14", acquired: false, description: "Vía Hostal Termales del Machín-Toche, Finca El Porvenir. Presencia de invernaderos y cultivos de tomate y frijol. Se permite acceso con el vehículo dentro de la finca." },
  { id: "GRAV15", position: [4.499696, -75.400997], type: "sgi_gravimetry", label: "GRAV15", acquired: false, description: "Vía Hostal Termales del Machín-Toche, Finca El Porvenir. Presencia de invernaderos y cultivos de tomate y frijol. Se permite acceso con el vehículo dentro de la finca." },
  { id: "GRAV16", position: [4.501244, -75.395549], type: "sgi_gravimetry", label: "GRAV16", acquired: false, description: "Vía Hostal Termales del Machín-Toche. Finca El Porvenir." },
  { id: "GRAV17", position: [4.505535, -75.396194], type: "sgi_gravimetry", label: "GRAV17", acquired: false, description: "Vía Hostal Termales del Machín-Toche. Finca El Vergel." },
  { id: "GRAV18", position: [4.505524, -75.400724], type: "sgi_gravimetry", label: "GRAV18", acquired: false, description: "Vía Hostal Termales del Machín-Toche. Finca El Vergel. Presencia de cultivos; el punto se ubicó cerca a la vía debido a que no se podía acceder." },
  { id: "GRAV19", position: [4.509333, -75.378456], type: "sgi_gravimetry", label: "GRAV19", acquired: false, description: "Vía Hostal Termales del Machín-Toche, desvío a la derecha hacia la Finca La Argelia. Al llegar a la Finca La Argelia, cruzar la quebrada San Juan y tomar el sendero hasta la finca. Presencia de cercas eléctricas y potreros de vacas." },
  { id: "GRAV20", position: [4.478377, -75.365305], type: "sgi_gravimetry", label: "GRAV20", acquired: false, description: "Vía Hostal Termales de Machín - Ascenso hacia el cráter. Llegada a la laguna y ascenso por la izquierda hacia la Finca La Aurora. En la Finca La Aurora tomar el sendero hacia el SE hasta llegar a la Finca El Silencio." },
  { id: "GRAV21", position: [4.480465, -75.366347], type: "sgi_gravimetry", label: "GRAV21", acquired: false, description: "Vía Hostal Termales de Machín - Ascenso hacia el cráter. Llegada a la laguna y ascenso por la izquierda hacia la Finca La Aurora. En la Finca La Aurora tomar el sendero hacia el SE hasta llegar a la Finca El Silencio." },
  { id: "GRAV22", position: [4.482235, -75.363010], type: "sgi_gravimetry", label: "GRAV22", acquired: false, description: "Vía Hostal Termales de Machín - Ascenso hacia el cráter. Llegada a la laguna y ascenso por la izquierda hacia la Finca La Aurora. En la Finca La Aurora tomar el sendero hacia el SE hasta llegar a la Finca El Silencio." },
  { id: "GRAV23", position: [4.487070, -75.366749], type: "sgi_gravimetry", label: "GRAV23", acquired: false, description: "Vía Hostal Termales de Machín - Ascenso hacia el cráter. Llegada a la laguna y ascenso por la izquierda hacia la Finca La Aurora. Para llegar se debe hacer un ascenso por el sendero marcado hacia el NE." },
  { id: "GRAV24", position: [4.485507, -75.371391], type: "sgi_gravimetry", label: "GRAV24", acquired: false, description: "Vía Hostal Termales de Machín - Ascenso hacia el cráter. Llegada a la laguna y ascenso por la izquierda hacia la Finca La Aurora." },
  { id: "GRAV25", position: [4.460502, -75.379584], type: "sgi_gravimetry", label: "GRAV25", acquired: false, description: "Vía Hostal Termales del Machín-Tapias, desvío a la derecha hacia la Finca de Aide Huelgos. Presencia de cultivos de plátano y café. El punto se reubicó en la vía." },
  { id: "GRAV26", position: [4.453971, -75.381044], type: "sgi_gravimetry", label: "GRAV26", acquired: false, description: "Vía Hostal Termales del Machín-Tapias, desvío a la derecha hacia la Finca Buenos Aires. Tomar el sendero hacia la Finca Buenos Aires. Presencia de cultivos de plátano y café. El punto se ubicó sobre un pastizal con guaduas." },
  { id: "GRAV27", position: [4.452345, -75.357490], type: "sgi_gravimetry", label: "GRAV27", acquired: false, description: "Vía Hostal Termales del Machín-Toche, desvío a la derecha en la Tienda El Moral. El punto se ubicó cerca a la vía ya que se encontró una zona con cultivos y vegetación densa." },
  { id: "GRAV28", position: [4.456458, -75.354333], type: "sgi_gravimetry", label: "GRAV28", acquired: false, description: "Vía Tapias - Hostal Termales del Machín, a 100 metros de una quebrada que atraviesa la vía; en la ladera se presentan cultivos de plátano." },
  { id: "GRAV29", position: [4.458407, -75.341473], type: "sgi_gravimetry", label: "GRAV29", acquired: false, description: "Vía Tapias-Ibagué, Finca La Aurora Tapias. El punto se ubicó cerca a la vía en una carpa plástica negra." },
  { id: "GRAV30", position: [4.460503, -75.337961], type: "sgi_gravimetry", label: "GRAV30", acquired: false, description: "Vía Tapias-Ibagué, Finca La Aurora Tapias. El punto se ubicó atravesando la cerca unos 5 metros." },
  { id: "GRAV31", position: [4.518578, -75.405425], type: "sgi_gravimetry", label: "GRAV31", acquired: false, description: "Vía Hostal Termales del Machín - Toche. Finca Alto de San Martín. Presencia de cercas eléctricas y potreros de vacas. Se puede acceder dentro de la finca en un vehículo." },
  { id: "GRAV32", position: [4.521918, -75.410110], type: "sgi_gravimetry", label: "GRAV32", acquired: false, description: "Vía Tapias-Toche, al llegar a Toche cruzar el puente colgante del río Toche y ubicar la primera finca. Finca La Esperanza. El punto se ubicó por el sendero de piedras al lado derecho (NE) de la finca." },

  // ── MAGNETOMETRIA (SGI GEO – Magnetometry) ───────────────────────────────
  { id: "MAG01", position: [4.488373, -75.378695], type: "sgi_magnetometry", label: "MAG01", acquired: false, description: "Vía Hostal Termales del Machín - Ascenso hacia el Cráter del VCM. Finca La Secreta, sobre los potreros de la entrada a la finca." },
  { id: "MAG02", position: [4.486972, -75.381486], type: "sgi_magnetometry", label: "MAG02", acquired: false, description: "Vía Hostal Termales del Machín - Cráter del VCM. Finca La Secreta, inicio del camino de piedras." },
  { id: "MAG03", position: [4.482683, -75.382333], type: "sgi_magnetometry", label: "MAG03", acquired: false, description: "Vía Hostal Termales del Machín - Cráter del VCM. Finca La Secreta, al llegar a la finca, bajar por el camino de piedras hasta llegar al punto." },
  { id: "MAG04", position: [4.491753, -75.394164], type: "sgi_magnetometry", label: "MAG04", acquired: false, description: "Desde Hostal Termales del Machín subiendo hacia el borde del cráter por el NE." },
  { id: "MAG05", position: [4.487487, -75.396565], type: "sgi_magnetometry", label: "MAG05", acquired: false, description: "Vía Hostal Termales del Machín - Toche, Finca Machín 5, a 10 metros de la Escuela Machín." },
  { id: "MAG06", position: [4.478997, -75.394072], type: "sgi_magnetometry", label: "MAG06", acquired: false, description: "Desde Hostal Termales del Machín subiendo hacia el borde del cráter por el NE." },
  { id: "MAG07", position: [4.471995, -75.388759], type: "sgi_magnetometry", label: "MAG07", acquired: false, description: "Sobre la vía Hostal Termales del Machín - Tapias. Finca El Jardín." },
  { id: "MAG08", position: [4.496579, -75.400240], type: "sgi_magnetometry", label: "MAG08", acquired: false, description: "Vía Hostal Termales del Machín-Toche, Finca El Porvenir. Presencia de invernaderos y cultivos de tomate y frijol. Se permite acceso con el vehículo dentro de la finca." },
  { id: "MAG09", position: [4.499696, -75.400997], type: "sgi_magnetometry", label: "MAG09", acquired: false, description: "Vía Hostal Termales del Machín-Toche, Finca El Porvenir. Presencia de invernaderos y cultivos de tomate y frijol. Se permite acceso con el vehículo dentro de la finca." },
  { id: "MAG10", position: [4.501244, -75.395549], type: "sgi_magnetometry", label: "MAG10", acquired: false, description: "Vía Hostal Termales del Machín-Toche. Finca El Porvenir." },
  { id: "MAG11", position: [4.505535, -75.396194], type: "sgi_magnetometry", label: "MAG11", acquired: false, description: "Vía Hostal Termales del Machín-Toche. Finca El Vergel." },
  { id: "MAG12", position: [4.505524, -75.400724], type: "sgi_magnetometry", label: "MAG12", acquired: false, description: "Vía Hostal Termales del Machín-Toche. Finca El Vergel. Presencia de cultivos; el punto se ubicó cerca a la vía debido a que no se podía acceder." },
  { id: "MAG13", position: [4.509333, -75.378456], type: "sgi_magnetometry", label: "MAG13", acquired: false, description: "Vía Hostal Termales del Machín-Toche, desvío a la derecha hacia la Finca La Argelia. Al llegar a la Finca La Argelia, cruzar la quebrada San Juan y tomar el sendero hasta la finca. Presencia de cercas eléctricas y potreros de vacas." },
  { id: "MAG14", position: [4.478377, -75.365305], type: "sgi_magnetometry", label: "MAG14", acquired: false, description: "Vía Hostal Termales de Machín - Ascenso hacia el Cráter del VCM. Llegada a la laguna y ascenso por la izquierda hacia la Finca La Aurora. En la Finca La Aurora tomar el sendero hacia el SE hasta llegar a la Finca El Silencio." },
  { id: "MAG15", position: [4.480465, -75.366347], type: "sgi_magnetometry", label: "MAG15", acquired: false, description: "Vía Hostal Termales de Machín - Ascenso hacia el Cráter del VCM. Llegada a la laguna y ascenso por la izquierda hacia la Finca La Aurora. En la Finca La Aurora tomar el sendero hacia el SE hasta llegar a la Finca El Silencio." },
  { id: "MAG16", position: [4.482238, -75.363010], type: "sgi_magnetometry", label: "MAG16", acquired: false, description: "Vía Hostal Termales de Machín - Ascenso hacia el cráter. Llegada a la laguna y ascenso por la izquierda hacia la Finca La Aurora. En la Finca La Aurora tomar el sendero hacia el SE hasta llegar a la Finca El Silencio." },
  { id: "MAG17", position: [4.460502, -75.379584], type: "sgi_magnetometry", label: "MAG17", acquired: false, description: "Vía Hostal Termales del Machín-Tapias, desvío a la derecha hacia la Finca de Aide Huelgos. Presencia de cultivos de plátano y café. El punto se reubicó en la vía." },
  { id: "MAG18", position: [4.466410, -75.365743], type: "sgi_magnetometry", label: "MAG18", acquired: false, description: "Vía Hostal Termales del Machín-Tapias, tomando el sendero en Moralito hacia la Finca El Mirador. Ascenso de ~50 min por sendero marcado. Al llegar a la finca, tomar el sendero hacia el potrero al NW." },
  { id: "MAG19", position: [4.471677, -75.358745], type: "sgi_magnetometry", label: "MAG19", acquired: false, description: "Vía Hostal Termales del Machín-Tapias, tomando el sendero en Moralito hacia la Finca El Mirador. Ascenso de ~50 min por sendero marcado. Al llegar a la finca, tomar el sendero que sube hacia el último potrero." },
  { id: "MAG20", position: [4.460378, -75.363864], type: "sgi_magnetometry", label: "MAG20", acquired: false, description: "Vía Hostal Termales del Machín-Tapias, tomando el sendero en Moralito hacia la Finca El Mirador. Acceso vehicular hasta el inicio del sendero." },
  { id: "MAG22", position: [4.460133, -75.360591], type: "sgi_magnetometry", label: "MAG22", acquired: false, description: "Vía Hostal Termales del Machín-Tapias, tomando el sendero en Moralito hacia la Finca El Mirador. Ascenso por sendero marcado. Se debe atravesar una zona de vegetación densa para llegar al punto." },
  { id: "MAG24", position: [4.446831, -75.361300], type: "sgi_magnetometry", label: "MAG24", acquired: false, description: "Vía Hostal Termales del Machín-Tapias, desvío a la derecha en la Tienda El Moral, Finca Patio Bonito. El vehículo puede acceder hasta la entrada de la finca." },
  { id: "MAG25", position: [4.445724, -75.353759], type: "sgi_magnetometry", label: "MAG25", acquired: false, description: "Vía Tapias-Ortega, 150 metros después de cruzar el puente de Madera de la quebrada Corrales. El punto se ubicó al lado de una casa de madera." },
  { id: "MAG27", position: [4.468540, -75.352841], type: "sgi_magnetometry", label: "MAG27", acquired: false, description: "Vía Tapias-Ibagué, Finca La Sierra. El vehículo puede acceder hasta la vía en la que comienza el sendero de alrededor de 35 minutos hasta el punto. Presencia de caminos enrastrojados." },
  { id: "MAG28", position: [4.461905, -75.350483], type: "sgi_magnetometry", label: "MAG28", acquired: false, description: "Vía Tapias-Ibagué, Finca El Arenal. El vehículo puede acceder hasta la vía en la que comienza el sendero de alrededor de 20 minutos hasta el punto. Presencia de caminos enrastrojados." },
  { id: "MAG29", position: [4.449637, -75.346739], type: "sgi_magnetometry", label: "MAG29", acquired: false, description: "Vía Tapias-Ortega, antes de llegar al puente de Madera de la quebrada Corrales. Se debe llegar hasta el puente de la quebrada Corrales y caminar por la quebrada hasta el punto." },
  { id: "MAG30", position: [4.456343, -75.345802], type: "sgi_magnetometry", label: "MAG30", acquired: false, description: "Vía Tapias-Ibagué, a 400 metros de Tapias saliendo hacia Ibagué." },
  { id: "MAG31", position: [4.458407, -75.341473], type: "sgi_magnetometry", label: "MAG31", acquired: false, description: "Vía Tapias-Ibagué, Finca La Aurora Tapias. El punto se ubicó cerca a la vía en una carpa plástica negra." },
  { id: "MAG32", position: [4.463837, -75.343736], type: "sgi_magnetometry", label: "MAG32", acquired: false, description: "Vía Tapias-Ibagué, Finca Alto Bonito. El vehículo puede acceder hasta la vía en la que comienza el sendero de alrededor de 45 minutos hasta el punto. Presencia de potreros de vacas y caminos enrastrojados." },
  { id: "MAG33", position: [4.460503, -75.337961], type: "sgi_magnetometry", label: "MAG33", acquired: false, description: "Vía Tapias-Ibagué, Finca La Aurora Tapias. El punto se ubicó atravesando la cerca unos 5 metros." },
  { id: "MAG34", position: [4.469418, -75.334748], type: "sgi_magnetometry", label: "MAG34", acquired: false, description: "Vía Tapias-Ibagué, Finca El Naranjal. El vehículo puede acceder hasta el inicio del sendero de alrededor de 1 hora hasta el punto. El sendero es complicado en algunos tramos, se recomienda ir cuando no haya llovido." },
  { id: "MAG35", position: [4.466955, -75.329924], type: "sgi_magnetometry", label: "MAG35", acquired: false, description: "Vía Tapias-Ibagué, Finca El Naranjal. El sendero es complicado en algunos tramos, se recomienda ir cuando no haya llovido. Se puede acceder desde el sendero que pasa cerca a la quebrada del puente de cemento." },
  { id: "MAG36", position: [4.459512, -75.328830], type: "sgi_magnetometry", label: "MAG36", acquired: false, description: "Vía Tapias-Ibagué, Finca La Mediación. El vehículo puede acceder hasta la vía en la que comienza el sendero de alrededor de 30 minutos hasta el punto. El sendero es complicado en algunos tramos, se recomienda ir cuando no haya llovido." },
  { id: "MAG37", position: [4.450508, -75.331009], type: "sgi_magnetometry", label: "MAG37", acquired: false, description: "Vía Tapias-Ibagué, Finca La Primavera. El vehículo puede acceder hasta la vía en la que comienza el sendero de alrededor de 45 minutos hasta el punto." },
  { id: "MAG38", position: [4.449114, -75.334442], type: "sgi_magnetometry", label: "MAG38", acquired: false, description: "Vía Tapias-Ibagué, Finca La Primavera. El vehículo puede acceder hasta la vía en la que comienza el sendero de alrededor de 30 minutos hasta el punto." },
  { id: "MAG39", position: [4.515438, -75.405225], type: "sgi_magnetometry", label: "MAG39", acquired: false, description: "Vía Hostal Termales del Machín-Toche. Finca La Aurora 2." },
  { id: "MAG40", position: [4.518578, -75.405425], type: "sgi_magnetometry", label: "MAG40", acquired: false, description: "Vía Hostal Termales del Machín - Toche. Finca Alto de San Martín. Presencia de cercas eléctricas y potreros de vacas. Se puede acceder dentro de la finca en un vehículo." },
  { id: "MAG41", position: [4.521918, -75.410110], type: "sgi_magnetometry", label: "MAG41", acquired: false, description: "Vía Tapias-Toche, al llegar a Toche cruzar el puente colgante del río Toche y ubicar la primera finca. Finca La Esperanza. El punto se ubicó por el sendero de piedras al lado derecho (NE) de la finca." },

  // ── MAGNETOTELURICA – UIS Geophysics Team ────────────────────────────────
  { id: "MT01-UIS", position: [4.487113, -75.378936], type: "uis_geophysics", label: "MT01-UIS", acquired: false, description: "Vía Hostal Termales del Machín - Cráter del VCM. Finca La Secreta, sobre los potreros de la entrada a la finca. Se presentan potreros con vacas y cercas eléctricas; solicitar desactivarlas en la adquisición." },
  { id: "MT02-UIS", position: [4.481066, -75.382456], type: "uis_geophysics", label: "MT02-UIS", acquired: false, description: "Vía Hostal Termales del Machín - Cráter del VCM. Finca La Secreta, al llegar a la finca, bajar por el camino de piedras hasta llegar al punto. Se presentan potreros con vacas y cercas eléctricas; solicitar desactivarlas en la adquisición." },
  { id: "MT03-UIS", position: [4.487930, -75.396421], type: "uis_geophysics", label: "MT03-UIS", acquired: false, description: "Vía Hostal Termales del Machín - Toche, Finca Machín 5, a 10 metros de la Escuela Machín. Se presentan potreros con vacas y cercas eléctricas; solicitar desactivarlas en la adquisición." },
  { id: "MT04-UIS", position: [4.472278, -75.388645], type: "uis_geophysics", label: "MT04-UIS", acquired: false, description: "Sobre la vía Hostal Termales del Machín - Tapias. Finca El Jardín. Pendiente mayor a 30°, presencia de redes eléctricas." },
  { id: "MT05-UIS", position: [4.467749, -75.390470], type: "uis_geophysics", label: "MT05-UIS", acquired: false, description: "Vía Hostal Termales del Machín - Tapias, primer desvío a la derecha luego segundo desvío a la derecha. Finca El Jardín. Camino entre cultivos de plátano y café hasta quebrada seca, luego ascenso a la ladera. Pendiente mayor a 30°. Presencia de pringamoza." },
  { id: "MT06-UIS", position: [4.473274, -75.385070], type: "uis_geophysics", label: "MT06-UIS", acquired: false, description: "Vía Hostal Termales del Machín - Tapias, Finca Buenavista. Se presentan cercas eléctricas." },
  { id: "MT07-UIS", position: [4.468924, -75.384584], type: "uis_geophysics", label: "MT07-UIS", acquired: false, description: "Vía Hostal Termales del Machín - Tapias, Finca Buenavista. Cercas eléctricas, pendiente ~20°. Calcular longitud real del dipolo." },
  { id: "MT08-UIS", position: [4.499465, -75.401057], type: "uis_geophysics", label: "MT08-UIS", acquired: false, description: "Vía Hostal Termales del Machín-Toche, Finca El Porvenir. Invernaderos y cultivos de tomate y frijol; acceso vehicular permitido dentro de la finca. Presencia de cercas eléctricas." },
  { id: "MT09-UIS", position: [4.511037, -75.380396], type: "uis_geophysics", label: "MT09-UIS", acquired: false, description: "Vía Hostal Termales del Machín-Toche, desvío a la derecha hacia la Finca La Argelia. Al llegar a la Finca La Argelia, cruzar la quebrada San Juan. Acceso vehicular hasta la entrada de la finca. Presencia de redes eléctricas. Terreno mayormente plano. La vía no está en buen estado, se recomienda ir cuando no haya llovido." },
  { id: "MT10-UIS", position: [4.470896, -75.374689], type: "uis_geophysics", label: "MT10-UIS", acquired: false, description: "Vía Hostal Faldas del Machín-Tapias, sendero marcado desde los invernaderos hasta la Finca del Señor Carlos. Pendiente mayor a 20°. Calcular longitud real del dipolo." },

  // ── MAGNETOTELURICA – GIDCO ──────────────────────────────────────────────
  { id: "MT01-GIDCO", position: [4.507784, -75.402035], type: "gidco", label: "MT01-GIDCO", acquired: false, description: "Vía Hostal Termales del Machín-Toche, Finca El Vergel. Presencia de cercas eléctricas y potreros de vacas." },
  { id: "MT02-GIDCO", position: [4.511108, -75.374945], type: "gidco", label: "MT02-GIDCO", acquired: false, description: "Vía Hostal Termales del Machín-Toche, desvío a la derecha hacia la Finca La Argelia. Al llegar a la Finca La Argelia, cruzar la quebrada San Juan y tomar el sendero hasta la finca. Acceso vehicular hasta la entrada. Presencia de redes eléctricas y cercas. Terreno plano; la vía no está en buen estado." },
  { id: "MT03-GIDCO", position: [4.514483, -75.376293], type: "gidco", label: "MT03-GIDCO", acquired: false, description: "Vía Hostal Termales del Machín-Toche, desvío a la derecha hacia la Finca La Pontevedra. Acceso vehicular hasta la entrada de la finca. Presencia de redes eléctricas. Terreno plano; la vía no está en buen estado. Presencia de cercas eléctricas y potreros de vacas." },
  { id: "MT04-GIDCO", position: [4.509692, -75.378208], type: "gidco", label: "MT04-GIDCO", acquired: false, description: "Vía Hostal Termales del Machín-Toche, desvío a la derecha hacia la Finca La Argelia. El punto se reubicó a una ubicación de terreno plano con acceso vehicular hasta la entrada de la Finca La Argelia. Presencia de cercas eléctricas y potreros de vacas." },
  { id: "MT05-GIDCO", position: [4.454275, -75.363428], type: "gidco", label: "MT05-GIDCO", acquired: false, description: "Vía Hostal Termales del Machín-Toche, desvío a la derecha hacia la finca El Moral. Se debe atravesar un invernadero de tomates en la finca para acceder al punto. Presencia de cercas eléctricas." },
  { id: "MT06-GIDCO", position: [4.450765, -75.356746], type: "gidco", label: "MT06-GIDCO", acquired: false, description: "Vía Hostal Termales del Machín-Tapias, desvío a la derecha en la Tienda El Moral, Finca San Roque. El vehículo puede acceder hasta la vía donde está la entrada de la finca. Presencia de potreros con vacas. Terreno mayormente plano." },
  { id: "MT08-GIDCO", position: [4.461740, -75.344803], type: "gidco", label: "MT08-GIDCO", acquired: false, description: "Vía Tapias-Ibagué, Finca Alto Bonito. El vehículo puede acceder hasta la vía en la que comienza el sendero de alrededor de 35 minutos hasta el punto. Presencia de potreros de vacas. La pendiente de la zona es alrededor de 30°. Calcular el dipolo real." },
  { id: "MT09-GIDCO", position: [4.454383, -75.336284], type: "gidco", label: "MT09-GIDCO", acquired: false, description: "Vía Tapias-Ibagué, Finca Santo Domingo. El vehículo puede acceder hasta la entrada de la finca. Se debe caminar por un sendero a la izquierda alrededor de 10 minutos hasta llegar al punto. Presencia de cercas eléctricas y potreros de vacas. La pendiente de la zona es alrededor de 30°." },
  { id: "MT10-GIDCO", position: [4.449300, -75.337630], type: "gidco", label: "MT10-GIDCO", acquired: false, description: "Vía Tapias-Ibagué, Finca La Primavera. El vehículo puede acceder hasta la vía en la que comienza el sendero de alrededor de 10 minutos hasta el punto. Presencia de potreros de vacas. La pendiente de la zona es alrededor de 30°." },
  { id: "MT11-GIDCO", position: [4.518572, -75.405380], type: "gidco", label: "MT11-GIDCO", acquired: false, description: "Vía Hostal Termales del Machín - Toche. Finca Alto de San Martín. Presencia de cercas eléctricas y potreros de vacas. Se puede acceder dentro de la finca en un vehículo." },
];

export const PARTICIPANTS: Participant[] = [
  {
    name: "Ana",
    role: "field",
    position: [4.535, -75.395],
    status: "active",
    lastUpdate: "0:42:53",
    location: "Cerro Machín",
  },
  {
    name: "Carlos",
    role: "office",
    status: "active",
    lastUpdate: "0:42:53",
    location: "Bogotá, Colombia",
  },
];

export const PROGRESS_DATA = [
  {
    label: "SGI GEO Magnetometry characterization",
    displayLabel: "SGI GEO Characterization – MAG",
    teamLabel: "SGI GEO (MAG)",
    total: 50,
    color: "#D946EF",
    teamType: "sgi_magnetometry" as const,
  },
  {
    label: "SGI GEO Gravimetry characterization",
    displayLabel: "SGI GEO Characterization – GRAV",
    teamLabel: "SGI GEO (GRAV)",
    total: 50,
    color: "#EC4899",
    teamType: "sgi_gravimetry" as const,
  },
  {
    label: "GIDCO characterization",
    displayLabel: "MT – GIDCO Characterization",
    teamLabel: "MT – GIDCO",
    total: 20,
    color: "#22C55E",
    teamType: "gidco" as const,
  },
  {
    label: "UIS Geophysics Team characterization",
    displayLabel: "MT – UIS Characterization",
    teamLabel: "MT – UIS",
    total: 10,
    color: "#F97316",
    teamType: "uis_geophysics" as const,
  },
];
