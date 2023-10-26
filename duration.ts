import { Temporal } from '@js-temporal/polyfill';

const unitRegex = /([-+\d.]+)([a-zµμ]+)/g;

const unitMap = {
	'ns': 'nanoseconds',
	'us': 'microseconds',
	'µs': 'microseconds',
	'μs': 'microseconds',
	'ms': 'milliseconds',
	's': 'seconds',
	'm': 'minutes',
	'h': 'hours',
	'd': 'days',
	'mo': 'months',
	'y': 'years',
};

export interface DurationOptions {
	years?: number,
	months?: number,
	weeks?: number,
	days?: number,
	hours?: number,
	minutes?: number,
	seconds?: number,
	milliseconds?: number,
	microseconds?: number,
	nanoseconds?: number,
}

export class Duration {

	public duration: Temporal.Duration;

	constructor(duration: string) {

		this.duration = this.parseString(duration);

	}

	public add(duration: string | DurationOptions): Duration {

		if (typeof duration === 'string') {

			const dur = this.parseString(duration);

			this.duration = this.duration.add(dur);

		}
		else {

			this.duration = this.duration.add(duration);

		}

		return this;

	}

	public sub(duration: string | DurationOptions): Duration {

		if (typeof duration === 'string') {

			const dur = this.parseString(duration);

			this.duration = this.duration.subtract(dur);

		}
		else {

			this.duration = this.duration.subtract(duration);

		}

		return this;

	}

	private parseString(duration: string): Temporal.Duration {

		const durations: DurationOptions = {};

		let match: RegExpExecArray | null;

		if (!unitRegex.test(duration)) {
			throw new Error(`invalid duration: ${duration}`);
		}

		while ((match = unitRegex.exec(duration)) !== null) {

			// This is necessary to avoid infinite loops with zero-width matches
			if (match.index === unitRegex.lastIndex) {
				unitRegex.lastIndex++;
			}

			const value = parseInt(match[1]!);
			const unit = match[2];

			if (isNaN(value) || !unit) {
				throw new Error(`invalid duration : ${duration}`);
			}

			if (!unitMap[unit as keyof typeof unitMap]) {
				throw new Error(`invalid unit : ${unit}`);
			}

			durations[unitMap[unit as keyof typeof unitMap] as keyof DurationOptions] = value;

		}

		return Temporal.Duration.from(durations);

	}

}