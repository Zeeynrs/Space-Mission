export type CitationCategory = 'all' | 'propulsion' | 'power' | 'comm' | 'payload' | 'geodesy';

export interface ScientificCitation {
  id: string;
  title: string;
  category: 'propulsion' | 'power' | 'comm' | 'payload' | 'geodesy';
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
    category: 'payload',
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
    category: 'geodesy',
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
    category: 'power',
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
    category: 'comm',
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
    category: 'propulsion',
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
  {
    id: 'src-dsoc-optical',
    title: 'Deep Space Optical Communications (DSOC) Technology Demonstration',
    category: 'comm',
    provider: 'NASA / Jet Propulsion Laboratory (JPL) / Psyche Mission',
    canonicalUrl: 'https://www.jpl.nasa.gov/missions/deep-space-optical-communications-dsoc',
    retrievalDate: '2024',
    relevantUnits: 'Wavelength (1550 nm), Downlink Bitrate (Mbps), Laser Power (W)',
    attribution: 'NASA Space Technology Mission Directorate (STMD) / JPL',
    usedInFeature: 'DSOC Optical Laser Transceiver component specs and high-bandwidth downlink scoring',
    summary:
      'NASA demonstrated near-infrared (1,550 nm) laser communications from deep space on the Psyche spacecraft, achieving data downlink rates exceeding 25 Mbps over tens of millions of kilometers, an order of magnitude higher than X-band radio.',
    formulaOrData: 'Downlink rate: 25 Mbps at Mars transit distance; Subsystem mass: 32 kg; Power: 140 W',
  },
  {
    id: 'src-mmrtg-nuclear',
    title: 'Multi-Mission Radioisotope Thermoelectric Generator (MMRTG)',
    category: 'power',
    provider: 'NASA Planetary Science Division / US Department of Energy (DOE)',
    canonicalUrl: 'https://mars.nasa.gov/internal_resources/788/',
    retrievalDate: '2024',
    relevantUnits: 'Thermal Power (2000 Wt), Electrical Power (110-125 We), Mass (45 kg)',
    attribution: 'NASA Radioisotope Power Systems Program',
    usedInFeature: 'MMRTG Nuclear Generator component, continuous night generation, dust storm resilience',
    summary:
      'Powered by 4.8 kg of Plutonium-238 dioxide, using PbTe/TAGS thermoelectric couples to provide steady electrical power (~125 W) regardless of solar distance or orbital night shadows, with a half-life of 87.7 years.',
    formulaOrData: 'Electrical power: ~125 W continuous; Eclipse degradation: 0 W; Pu-238 half-life: 87.7 years',
  },
  {
    id: 'src-trace-gas-methane',
    title: 'ExoMars Trace Gas Orbiter (TGO) Atmospheric Chemistry & Methane Detection',
    category: 'payload',
    provider: 'ESA / Roscosmos / NASA Planetary Data System',
    canonicalUrl: 'https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Exploration/ExoMars',
    retrievalDate: '2024',
    relevantUnits: 'Methane mixing ratio (ppbv), Spectral resolution (cm⁻¹)',
    attribution: 'ESA ExoMars Science Team / ACS & NOMAD Instruments',
    usedInFeature: 'Trace Gas Sounder instrument, Atmospheric Trace Gas science objective (+90 pts)',
    summary:
      'The Trace Gas Orbiter conducts high-sensitivity solar occultation spectrometry capable of detecting atmospheric trace gases like methane at concentrations below 0.05 parts per billion by volume (ppbv).',
    formulaOrData: 'Detection threshold: < 0.05 ppbv methane; Spectral range: 0.7 - 17.0 um',
  },
  {
    id: 'src-mola-topography',
    title: 'Mars Global Surveyor (MGS) Mars Orbiter Laser Altimeter (MOLA) Topography',
    category: 'geodesy',
    provider: 'NASA / Goddard Space Flight Center (GSFC)',
    canonicalUrl: 'https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/',
    retrievalDate: '2024',
    relevantUnits: 'Elevation relative to areoid datum (m), Landmark coordinates (lat/lon)',
    attribution: 'NASA GSFC / MGS MOLA Science Team',
    usedInFeature: 'Interactive 3D Martian Landmarks (Olympus Mons, Valles Marineris, Jezero, Gale, Planum Boreum)',
    summary:
      'Precise laser altimetry mapped the topography of Mars, establishing reference coordinates and elevations for landmark geological formations including Olympus Mons (peak: 21,287 m) and Valles Marineris (canyon depth: ~7,000 m).',
    formulaOrData: 'Olympus Mons peak: +21.3 km; Valles Marineris trench: -7 km; Jezero delta: -2.5 km',
  },
];
