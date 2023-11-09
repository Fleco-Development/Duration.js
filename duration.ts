import { Temporal, toTemporalInstant } from '@js-temporal/polyfill';

Date.prototype.toTemporalInstant = toTemporalInstant;

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
	'w': 'weeks',
	'mo': 'months',
	'y': 'years',
};

/**
 * Properties for setting/adding/subtracing a duration.
 * @public
 */
export interface TemporalDuration {
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

/**
 * Contains all of the different types of timestamps that can be used in Discord.
 * @public
 */
export enum DiscordTimestamp {
	/**
	 * @example "12:00AM"
	 */
	ShortTime = 't',
	/**
	 * @example "12:00:00AM"
	 */
	LongTime = 'T',
	/**
	 * @example "01/01/1970"
	 */
	ShortDate = 'd',
	/**
	 * @example "January 01, 1970"
	 */
	LongDate = 'D',
	/**
	 * @example "January 01, 1970 at 12:00AM"
	 */
	ShortDateTime = 'f',
	/**
	 * @example "Monday, January 01, 1970 at 12:00AM"
	 */
	LongDateTime = 'F',
	/**
	 * @example "2 seconds ago"
	 */
	Relative = 'R',
}

/**
 * Additional options when adding/subtracting from a duration.
 * @public
 */
export interface DurationOptions {
	relativeTo?: RelativeDurationOptions,
}

/**
 * Options for a starting point when adding/subtracting
 * @public
 */
export interface RelativeDurationOptions {
	/**
	* Starting date
	*/
	date: Date,
	/**
	* Time zone
	* @defaultValue `UTC`
	*/
	timeZone?: string,
}

export class Duration {

	public duration: Temporal.Duration;

	/**
	 * @param duration - Starting duration
	 */
	constructor(duration: string) {

		this.duration = this.parseString(duration);

	}

	/**
	 * Adds to the current duration
	 * @see {@link https://www.fleco.cloud/packages/duration/classes/duration/#add | Duration#add}
	 * @param duration - Total time to add
	 * @param options - Options for adding a duration
	 * @returns Current duration
	 */
	public add(duration: string | TemporalDuration, options?: DurationOptions): Duration {

		if (typeof duration === 'string') {

			const dur = this.parseString(duration);

			const relative = options?.relativeTo?.date.toTemporalInstant().toString({ timeZone: options.relativeTo.timeZone ?? 'UTC' });

			this.duration = this.duration.add(dur, { relativeTo: relative ?? Temporal.Now.plainDateISO() });

		}
		else {

			const relative = options?.relativeTo?.date.toTemporalInstant().toString({ timeZone: options.relativeTo.timeZone ?? 'UTC' });

			this.duration = this.duration.add(duration, { relativeTo: relative ?? Temporal.Now.plainDateISO() });

		}

		return this;

	}

	/**
	 * Subtracts from the current duration
	 * @see {@link https://www.fleco.cloud/packages/duration/classes/duration/#sub | Duration#sub}
	 * @param duration - Total time to subtract
	 * @param options - Options for subtracting a duration
	 * @returns Current duration
	 */
	public sub(duration: string | TemporalDuration, options?: DurationOptions): Duration {

		if (typeof duration === 'string') {

			const dur = this.parseString(duration);

			const relative = options?.relativeTo?.date.toTemporalInstant().toString({ timeZone: options.relativeTo.timeZone ?? 'UTC' });

			this.duration = this.duration.subtract(dur, { relativeTo: relative ?? Temporal.Now.plainDateISO() });

		}
		else {

			const relative = options?.relativeTo?.date.toTemporalInstant().toString({ timeZone: options.relativeTo.timeZone ?? 'UTC' });

			this.duration = this.duration.subtract(duration, { relativeTo: relative ?? Temporal.Now.plainDateISO() });

		}

		return this;

	}

	/**
	 * Outputs the end date of the duration
	 * @see {@link https://www.fleco.cloud/packages/duration/classes/duration/#endDate | Duration#endDate} for documentation
	 * @returns Date
	 */
	public endDate(): Date {

		const currentDate = Temporal.Now;

		return new Date(currentDate.instant().epochMilliseconds + this.duration.total({ unit: 'milliseconds', relativeTo: currentDate.plainDateTimeISO() }));

	}

	/**
	 * Outputs a timestamp string for Discord.
	 * @see {@link https://www.fleco.cloud/packages/duration/classes/duration/#toDiscordTimestamp | Duration#toDiscordTimestamp} for documentation
	 * @param [type=DiscordTimestamp.ShortDateTime] - Type of timestamp
	 */
	public toDiscordTimestamp(type: DiscordTimestamp = DiscordTimestamp.ShortDateTime): string {

		const end = Temporal.Now.instant().epochSeconds + this.duration.total({ unit: 'seconds', relativeTo: Temporal.Now.plainDateISO() });

		return `<t:${end}:${type}>`;

	}

	private parseString(duration: string): Temporal.Duration {

		const unitRegex = /([-+\d.]+)([a-zµμ]+)/g;

		const durations: TemporalDuration = {};

		let match: RegExpExecArray | null;

		if (!unitRegex.test(duration)) {
			throw new Error(`invalid duration: ${duration}`);
		}

		unitRegex.lastIndex = 0;

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

			durations[unitMap[unit as keyof typeof unitMap] as keyof TemporalDuration] = value;

		}

		return Temporal.Duration.from(durations);

	}

}