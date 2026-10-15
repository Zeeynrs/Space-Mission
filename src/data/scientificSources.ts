export interface ScientificCitation {
  id: string;
  title: string;
  provider: string;
  canonicalUrl: string;
  retrievalDate: string;
  relevantUnits: string;
  attribution: string;
  usedInFeature: string;
  summary: string;
  formulaOrData?: string;
}

export const SCIENTIFIC_CITATIONS: ScientificCitation[] = [
  {
    id: 'src-mro-specs',
    title: 'Mars Reconnaissance Orbiter (MRO) Spacecraft Systems & Payload',
    provider: 'NASA / Jet Propulsion Laboratory (JPL) / Caltech',
    canonicalUrl: 'https://mars.nasa.gov/mro/mission/spacecraft/',
    retrievalDate: 'October 2024 verification',
    relevantUnits: 'Mass (kg), Power (W), Antenna diameter (m), Delta-V (m/s)',
    attribution: 'NASA/JPL-Caltech public mission archives',
    usedInFeature: 'Spacecraft Bus dimensions, Subsystem Mass baselines, HiRISE camera model',
    summary:
      'MRO launched with a wet mass of 2,180 kg, 3.0-meter high-gain antenna, and two 9.5-square-meter solar panels generating ~1,000 W at Mars. Serves as direct engineering inspiration for AURORA heavy bus and payload sizing.',
    formulaOrData: 'Launch Mass: 2,180 kg; Solar Array Area: ~19 m²; Downlink Rate: 0.5 - 4.0 Mbps',
  },
  {
    id: 'src-mars-pds-constants',
    title: 'NASA Planetary Data System (PDS) — Mars Geodesy & Constants',
    provider: 'NASA PDS Geosciences Node / USGS Astrogeology',
    canonicalUrl: 'https://pds-geosciences.wustl.edu/missions/mro/',
    retrievalDate: '2024',
    relevantUnits: 'Radius (km), Gravitational Parameter (m³/s²), Distance (AU)',
    attribution: 'NASA Planetary Data System / MGS MOLA Science Team',
    usedInFeature: 'Mars 3D rendering scale, orbital velocity calculations, eclipse period modeling',
    summary:
      'Mean Mars radius R = 3,389.5 km, gravitational parameter mu = 4.2828 x 10¹³ m³/s², orbital semi-major axis = 1.5237 AU. Used to compute circular orbital velocity and 38-minute low-orbit eclipse duration.',
    formulaOrData: 'R_Mars = 3,389.5 km; Orbital Period at 400 km = ~118 min; Shadow time = ~38 min',
  },
  {
    id: 'src-solar-inverse-square',
    title: 'Solar Power for Mars Missions — Technical Memorandum NASA/TM-2004-213076',
    provider: 'NASA Glenn Research Center Photovoltaics Branch',
    canonicalUrl: 'https://ntrs.nasa.gov/citations/20040084042',
    retrievalDate: '2024',
    relevantUnits: 'Solar Irradiance (W/m²), Multi-junction efficiency (%)',
    attribution: 'NASA Glenn Research Center Technical Reports',
    usedInFeature: 'Power subsystem generation drop at Mars distance (43.1% of Earth 1 AU output)',
    summary:
      'At 1.524 AU from the Sun, solar irradiance drops from 1,361 W/m² (Earth) to ~586 W/m² via the inverse-square law S(r) = S0 / r². Photovoltaic output must be sized for low flux and cold cell operating temperatures.',
    formulaOrData: 'S_Mars = 1361 / (1.524)² = 586.3 W/m² (43.08% of Earth flux)',
  },
  {
    id: 'src-deep-space-link',
    title: 'Deep Space Network Telecommunications Link Design Handbook (810-005)',
    provider: 'NASA JPL Deep Space Network',
    canonicalUrl: 'https://deepspace.jpl.nasa.gov/dsndocs/810-005/',
    retrievalDate: '2024',
    relevantUnits: 'Frequency (GHz), Antenna Gain (dBi), Data Rate (kbps)',
    attribution: 'NASA / JPL Deep Space Network',
    usedInFeature: 'Communications antenna trade-offs, radio light-time delays, data transfer limits',
    summary:
      'One-way radio propagation delay from Mars to Earth ranges from 4.3 minutes (at closest approach, 0.52 AU) to 21.3 minutes (at maximum separation, 2.52 AU). High-gain directional antennas with gimbal tracking are required to achieve megabit data rates.',
    formulaOrData: 'Light time delay tau = d / c; Free space path loss L_fs proportional to (4 * pi * d / lambda)²',
  },
  {
    id: 'src-rocket-equation',
    title: 'Tsiolkovsky Rocket Equation & Deep Space Propellant Budgets',
    provider: 'AIAA / NASA Space Flight Handbooks (SP-33)',
    canonicalUrl: 'https://ntrs.nasa.gov/citations/19710019994',
    retrievalDate: '2024',
    relevantUnits: 'Specific Impulse Isp (s), Delta-V (m/s), Standard Gravity g0 (m/s²)',
    attribution: 'Classical Astrodynamics Formulation',
    usedInFeature: 'Propulsion engine performance, delta-v calculation, tank sizing',
    summary:
      'Governs the change in velocity achievable by expelling reaction mass: Delta-V = Isp * g0 * ln(M_wet / M_dry). Mars capture requires ~1,050 - 1,450 m/s depending on entry hyperbola and target orbit eccentricity.',
    formulaOrData: 'Delta_v = Isp * 9.80665 * ln(M_wet / M_dry)',
  },
];
