import { ServiceCategory } from '../types';

export interface PriceRange {
  min: number;
  max: number;
}

export const DEFAULT_COMMISSION_RATE = 0.15; // 15% QuickFix platform commission

export const LAHORE_AREAS: Array<{ name: string; coordinates: [number, number] }> = [
  { name: 'Gulberg (Central Lahore)', coordinates: [74.3436, 31.5204] },
  { name: 'DHA Phase 5 & 6', coordinates: [74.3985, 31.4728] },
  { name: 'Model Town', coordinates: [74.3218, 31.4883] },
  { name: 'Johar Town', coordinates: [74.2796, 31.4697] },
  { name: 'Lahore Cantt', coordinates: [74.3854, 31.5392] },
  { name: 'Faisal Town', coordinates: [74.3039, 31.4877] },
  { name: 'Wapda Town', coordinates: [74.2589, 31.4428] },
  { name: 'Bahria Town Lahore', coordinates: [74.1856, 31.3654] },
  { name: 'Mall Road / Anarkali', coordinates: [74.3142, 31.5657] },
  { name: 'Shadman / Jail Road', coordinates: [74.3289, 31.5381] },
];

export const SERVICE_PROBLEMS: Record<ServiceCategory, Array<{ id: string; label: string; min: number; max: number }>> = {
  plumbing: [
    { id: 'water_leak', label: 'Water Pipe / Joint Leak', min: 1500, max: 3000 },
    { id: 'blocked_drain', label: 'Blocked Drain or Toilet', min: 1800, max: 3500 },
    { id: 'broken_tap', label: 'Broken Tap or Mixer Replacement', min: 1000, max: 2200 },
    { id: 'low_water_pressure', label: 'Low Water Pressure / Motor Issue', min: 1500, max: 4000 },
    { id: 'water_heater_geyser', label: 'Gas/Electric Geyser Repair', min: 2500, max: 6000 },
    { id: 'other_plumbing', label: 'Other Plumbing Issue', min: 1200, max: 3500 },
  ],
  electrical: [
    { id: 'power_outage', label: 'Partial / Full Power Fault', min: 1200, max: 2800 },
    { id: 'switch_socket', label: 'Switch / Socket Spark or Replacement', min: 800, max: 1800 },
    { id: 'circuit_breaker', label: 'Circuit Breaker Tripping / DB Repair', min: 1500, max: 3500 },
    { id: 'short_circuit', label: 'Short Circuit / Burning Smell', min: 2000, max: 4500 },
    { id: 'ups_inverter', label: 'UPS / Inverter & Solar Wiring Fault', min: 2500, max: 6500 },
    { id: 'ceiling_fan_light', label: 'Ceiling Fan or Chandelier Installation', min: 1000, max: 2000 },
    { id: 'other_electrical', label: 'Other Electrical Issue', min: 1000, max: 3000 },
  ],
  ac_repair: [
    { id: 'not_cooling', label: 'AC Not Cooling (General)', min: 2000, max: 4000 },
    { id: 'gas_leak_refill', label: 'Refrigerant / Gas Refill (R410/R32/R22)', min: 4500, max: 9000 },
    { id: 'water_leak_indoor', label: 'Indoor Water Dripping / Leaking', min: 1500, max: 2800 },
    { id: 'ac_service_master', label: 'Master Chemical Service (Jet Wash)', min: 2200, max: 3500 },
    { id: 'pcb_electrical_fault', label: 'Inverter PCB Board Fault / Sensor Error', min: 3500, max: 8000 },
    { id: 'strange_noise', label: 'Blower Noise or Fan Motor Issue', min: 2000, max: 4500 },
    { id: 'other_ac', label: 'Other AC Problem', min: 1800, max: 5000 },
  ],
};

export function getPriceEstimate(category: ServiceCategory, problemId: string): PriceRange {
  const problems = SERVICE_PROBLEMS[category];
  if (!problems) return { min: 1500, max: 3500 };
  const found = problems.find((p) => p.id === problemId);
  return found ? { min: found.min, max: found.max } : { min: 1500, max: 3500 };
}

export function calculateCommission(
  finalPrice: number,
  customRate?: number
): {
  commissionAmount: number;
  technicianAmount: number;
  commissionRate: number;
} {
  const rate = typeof customRate === 'number' && customRate >= 0 && customRate <= 1 ? customRate : DEFAULT_COMMISSION_RATE;
  const commissionAmount = Math.round(finalPrice * rate);
  const technicianAmount = Math.max(0, finalPrice - commissionAmount);
  return {
    commissionRate: rate,
    commissionAmount,
    technicianAmount,
  };
}
