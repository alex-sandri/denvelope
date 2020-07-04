import pricing from "./pricing.json";

export namespace Config
{
	export type PlanName = "100MB" | "1GB" | "10GB";
	export type Currency = "USD" | "EUR";
	export type BillingPeriod = "month" | "year";

	export type Locale = "en-us" | "it-it" | Config.ShortLocale;
	export type ShortLocale = "en" | "it";

	export class Pricing
	{
		public static Plan(
			name: Config.PlanName,
			currency: Config.Currency,
			billingPeriod: Config.BillingPeriod,
		): Plan
		{
			return new Plan(name, currency, billingPeriod);
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
				subscriptionId?: string,
                nextRenewal?: number,
                cancelAtPeriodEnd?: boolean,
                nextPeriodMaxStorage?: number,
                billingPeriod?: Config.BillingPeriod,
				nextBillingPeriod?: Config.BillingPeriod,
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

		export interface FolderUpdate
		{
			updated?: firebase.firestore.Timestamp,
			lastClientUpdateTime?: firebase.firestore.Timestamp,
			name?: string,
			parentId?: string,
			shared?: boolean,
			starred?: boolean,
			trashed?: boolean,
			inVault?: boolean,
		}

		export interface File extends Config.Data.Folder
		{
			size: number,
		}

		export interface FileUpdate extends Config.Data.FolderUpdate
		{}

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

class Plan
{
	constructor(
		private name: Config.PlanName,
		private currency: Config.Currency,
		private billingPeriod: Config.BillingPeriod,
	)
	{}

	public get Amount()
	{
		return pricing[this.name].price[this.currency][this.billingPeriod].amount;
	}
}