import pricing from "./pricing.json";

export namespace Config
{
	export type PlanName = "100MB" | "1GB" | "10GB";
	export type Currency = "USD" | "EUR";
	export type BillingPeriod = "month" | "year";
	export type Locale = "en-us" | "en" | "it-it" | "it";

	export class Pricing
	{
		public static Plan(name: Config.PlanName): Plan
		{
			return new Plan(pricing[name]);
		}
	}

	export const DefaultDateFormatOptions: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		timeZoneName: "short",
	};
}

interface PlanObject
{
	price: {
		USD:
		{
			month: number,
			year: number,
		},
		EUR:
		{
			month: number,
			year: number,
		}
	}
}

class Plan
{
	constructor(private plan: PlanObject)
	{}

	public Price(currency: Config.Currency, billingPeriod: Config.BillingPeriod)
	{
		return this.plan.price[currency][billingPeriod];
	}
}