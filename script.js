// NULL-002 CR-01 estimate. The historical correlation remains an explicit model assumption.
const readout = document.querySelector('.readout');
const layers = [...document.querySelectorAll('.layer')];
const correlationToggle = document.querySelector('.correlation-toggle');
const correlationPanel = document.querySelector('#correlation-panel');

const DAY_MS = 86_400_000;
const SIGNS = ['Cipactli', 'Ehécatl', 'Calli', 'Cuetzpalin', 'Cóatl', 'Miquiztli', 'Mázatl', 'Tochtli', 'Atl', 'Itzcuintli', 'Ozomatli', 'Malinalli', 'Ácatl', 'Ocelotl', 'Cuauhtli', 'Cozcacuauhtli', 'Ollin', 'Técpatl', 'Quiahuitl', 'Xóchitl'];
const VEINTENAS = ['Atlcahualo', 'Tlacaxipehualiztli', 'Tozoztontli', 'Huey Tozoztli', 'Tóxcatl', 'Etzalcualiztli', 'Tecuilhuitontli', 'Huey Tecuilhuitl', 'Tlaxochimaco', 'Xocotl Huetzi', 'Ochpaniztli', 'Teotleco', 'Tepeilhuitl', 'Quecholli', 'Panquetzaliztli', 'Atemoztli', 'Tititl', 'Izcalli'];
const YEAR_SIGNS = ['Tochtli', 'Ácatl', 'Técpatl', 'Calli'];

// 1 Cóatl = 13 August 1521 Julian, equivalent to 23 August Gregorian.
const ANCHOR = utcDate(1521, 8, 23);
// Tena's duplicated sixth nemontemi fell on 12 February 1521 Julian (= 22 February Gregorian).
const TENA_INTERCALARY_DAY = utcDate(1521, 2, 22);
// Tena's reconstructed 3 Calli year began 13 February 1521 Julian (= 23 February Gregorian).
const YEAR_EPOCH = utcDate(1521, 2, 23);

function utcDate(year, month, day) {
  return Date.UTC(year, month - 1, day);
}
function dayDifference(later, earlier) {
  return Math.round((later - earlier) / DAY_MS);
}
function mod(value, base) {
  return ((value % base) + base) % base;
}
function tonalAt(dateMs) {
  let offset = dayDifference(dateMs, ANCHOR);
  // Tena's extra day repeats the previous tonalli; it advances the solar count but not the 260-day count.
  if (dateMs < TENA_INTERCALARY_DAY) offset += 1;
  return {
    number: mod(offset, 13) + 1,
    sign: SIGNS[mod(4 + offset, 20)],
  };
}
function xiuhAt(dateMs) {
  const elapsed = dayDifference(dateMs, YEAR_EPOCH);
  const yearOffset = Math.floor(elapsed / 365);
  const dayOfYear = mod(elapsed, 365);
  const monthIndex = Math.floor(dayOfYear / 20);
  const dayInPeriod = (dayOfYear % 20) + 1;
  const yearNumber = mod(3 - 1 + yearOffset, 13) + 1;
  const yearSign = YEAR_SIGNS[mod(3 + yearOffset, 4)];
  const period = monthIndex < 18
    ? `${dayInPeriod} ${VEINTENAS[monthIndex]}`
    : `${dayInPeriod - 360} Nemontemi`;
  return { period, year: `${yearNumber} ${yearSign}` };
}
function localTodayUtcValue() {
  const now = new Date();
  return utcDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
function formatLocalDate(dateMs) {
  const date = new Date(dateMs);
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' }).format(date).toUpperCase();
}
function renderDate(dateMs) {
  const tonal = tonalAt(dateMs);
  const xiuh = xiuhAt(dateMs);
  const gregorian = formatLocalDate(dateMs);
  document.querySelector('#tonal-value').textContent = `${tonal.number} ${tonal.sign}`;
  document.querySelector('#gregorian-date').textContent = `CR-01 · ${gregorian}`;
  document.querySelector('#xiuh-value').textContent = `${xiuh.period} · ${xiuh.year}`;
  document.querySelector('#round-value').textContent = `${tonal.number} ${tonal.sign} · ${xiuh.year}`;
  document.querySelector('#round-reference').textContent = `≈ ${gregorian}`;
}

// Regression checks use Tena's cited historical pairings before rendering today's estimate.
function validateTenaAnchors() {
  const fall = tonalAt(ANCHOR);
  const entryDateJulianEquivalent = utcDate(1519, 11, 18); // 8 November Julian = 18 November Gregorian in 1519.
  const entry = tonalAt(entryDateJulianEquivalent);
  const newYear = xiuhAt(YEAR_EPOCH);
  const checks = [
    fall.number === 1 && fall.sign === 'Cóatl',
    entry.number === 8 && entry.sign === 'Ehécatl',
    newYear.period === '1 Atlcahualo' && newYear.year === '3 Calli',
  ];
  if (checks.some((passed) => !passed)) {
    document.documentElement.dataset.calendarCheck = 'failed';
    console.error('CR-01 historical anchor check failed.', { fall, entry, newYear });
  } else {
    document.documentElement.dataset.calendarCheck = 'passed';
  }
}

function activateLayer(layer) {
  const wasOpen = layer.getAttribute('aria-expanded') === 'true';
  layers.forEach((item) => {
    const open = item === layer && !wasOpen;
    item.classList.toggle('is-active', open);
    item.setAttribute('aria-expanded', String(open));
    item.querySelector('.details').hidden = !open;
  });
  readout.classList.toggle('has-focus', !wasOpen);
}

layers.forEach((layer) => {
  layer.addEventListener('click', () => activateLayer(layer));
  layer.addEventListener('mouseenter', () => {
    layers.forEach((item) => item.classList.toggle('is-hovered', item === layer));
    readout.classList.add('has-hover');
  });
  layer.addEventListener('mouseleave', () => {
    layers.forEach((item) => item.classList.remove('is-hovered'));
    readout.classList.remove('has-hover');
  });
  layer.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateLayer(layer);
    }
    if (event.key === 'Escape') {
      layer.classList.remove('is-active');
      layer.setAttribute('aria-expanded', 'false');
      layer.querySelector('.details').hidden = true;
      readout.classList.remove('has-focus');
    }
  });
});

function setCorrelation(open) {
  correlationToggle.setAttribute('aria-expanded', String(open));
  correlationPanel.hidden = !open;
  correlationToggle.querySelector('span').textContent = open ? '−' : '+';
}

correlationToggle.addEventListener('click', () => {
  setCorrelation(correlationToggle.getAttribute('aria-expanded') !== 'true');
});

document.addEventListener('click', (event) => {
  if (correlationPanel.hidden) return;
  if (correlationPanel.contains(event.target) || correlationToggle.contains(event.target)) return;
  setCorrelation(false);
});

validateTenaAnchors();
renderDate(localTodayUtcValue());
