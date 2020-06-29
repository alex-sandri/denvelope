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

	export const Locales: readonly Config.Locale[] = [ "en-us", "en", "it-it", "it" ];

	export namespace Data
	{
		export interface User
		{
			created: firebase.firestore.Timestamp,
			usedStorage: number,
			maxStorage: number,
			stripe?: {
				customerId: string,
				defaultPaymentMethod?: string,
				paymentMethods?: {
					id: string,
					brand: string,
					expirationMonth: number,
					expirationYear: number,
					last4: string,
				}[],
				subscriptionId?: string,
                nextRenewal?: number,
                cancelAtPeriodEnd?: boolean,
                nextPeriodMaxStorage?: number,
                invoiceUrl?: string,
                billingPeriod?: Config.BillingPeriod,
				nextBillingPeriod?: Config.BillingPeriod,
				currency?: Config.Currency,
			},
		}

		export interface Folder
		{
			created: firebase.firestore.Timestamp,
			updated: firebase.firestore.Timestamp,
			lastClientUpdateTime: firebase.firestore.Timestamp,
			name: string,
			parentId: string,
			shared: boolean,
			starred: boolean,
			trashed: boolean,
			inVault: boolean,
		}

		export interface File extends Config.Data.Folder
		{
			size: number,
		}

		export interface Preferences
		{
			backgroundImageUrl?: string,
			dateFormatOptions?: Intl.DateTimeFormatOptions,
			language?: Config.Locale,
		}

		export namespace Vault
		{
			export interface Config
			{
				pin?: string
			}

			export interface Status
			{
				locked?: boolean
			}
		}
	}
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