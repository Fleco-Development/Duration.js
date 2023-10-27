import { Duration } from './duration.js';

const duration = new Duration('1d');

// console.log(duration.endDate());
console.log(duration.toDiscordTimestamp());