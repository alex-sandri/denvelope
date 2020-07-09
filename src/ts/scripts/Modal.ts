import {
	ShowElement, AddClass, HideElement, HasClass, RemoveClass, FormatStorage,
} from "./Utilities";
import { Component } from "./Component";
import Translation from "./Translation";

export interface ModalOptions
{
	title?: string,
	titleTranslationId?: string,
	subtitle?: string,
	subtitleTranslationId?: string,
	action?: "confirm",
	floating?: boolean,
	animate?: boolean,
	aside?: boolean,
	loading?: boolean,
}

export class Modal
{
	private readonly container: HTMLDivElement = <HTMLDivElement>(<HTMLDivElement>document.querySelector(".modal-container")).cloneNode(true);

	public readonly element: HTMLDivElement = this.container.querySelector(".modal") as HTMLDivElement;

	private readonly spinner: HTMLSpanElement = this.element.querySelector(".spinner") as HTMLSpanElement;

	public readonly Content: HTMLDivElement = this.element.querySelector(".content") as HTMLDivElement;

	public readonly CloseButton: HTMLButtonElement = this.element.querySelector(".close") as HTMLButtonElement;

	public readonly ConfirmButton: HTMLButtonElement = this.element.querySelector(".confirm") as HTMLButtonElement;

	public OnClose: () => void;

	public OnConfirm: () => void;

	public OnUpdate: () => void;

	constructor(options ?: ModalOptions)
	{
		if (options?.titleTranslationId) this.TitleTranslationId = options.titleTranslationId;

		if (options?.title) this.Title = options.title;

		if (options?.subtitleTranslationId) this.SubtitleTranslationId = options.subtitleTranslationId;

		if (options?.subtitle) this.Subtitle = options.subtitle;

		switch (options?.action)
		{
			case "confirm": ShowElement(this.ConfirmButton, "block"); break;
		}

		if (options?.floating)
		{
			AddClass(this.element, "floating");

			AddClass(this.container, "no-background");
		}

		if (options?.animate === false) AddClass(this.element, "no-animate");

		if (options?.aside) AddClass(this.element, "aside");

		if (options?.loading === false) HideElement(this.spinner);
		else ShowElement(this.spinner, "block");

		this.OnClose = this.OnConfirm = this.OnUpdate = () => {};

		document.body.appendChild(this.container);
	}

	public Show = (unique ?: boolean) =>
	{
		this.CloseButton.addEventListener("click", this.HideAndRemove);

		this.ConfirmButton.addEventListener("click", this.OnConfirm);

		if (unique) document.querySelectorAll(".modal.show:not(.keep-alive)").forEach(element => (<HTMLElement>element.parentElement).remove()); // Remove also its container
		else AddClass(this.element, "keep-alive"); // Do not remove the modal, unless the user decides to

		if (!HasClass(this.element, "show"))
		{
			ShowElement(this.container);

			RemoveClass(this.element, "hide");
			AddClass(this.element, "show");
		}

		this.CloseButton.focus();

		if (getComputedStyle(this.ConfirmButton).getPropertyValue("display") !== "none" && !this.ConfirmButton.disabled) this.ConfirmButton.focus();

		(<HTMLInputElement | HTMLButtonElement | null> this.Content.querySelector("input, select, button"))?.focus();

		this.container.addEventListener("click", e =>
		{
			if (e.target === this.container) this.HideAndRemove();
		});

		window.addEventListener("keydown", e =>
		{
			const key = e.key.toLowerCase();

			if ([ "escape" ].includes(key)) e.preventDefault();

			if (key === "escape") this.HideAndRemove();
		});
	}

	public Hide = () =>
	{
		RemoveClass(this.element, "show");
		AddClass(this.element, "hide");

		setTimeout(() => HideElement(this.container), <number><unknown>getComputedStyle(this.element).getPropertyValue("animation-duration").replace(/[a-z]+/g, "") * 1000);
	}

	public Remove = () =>
	{
		this.OnClose();

		setTimeout(() => this.container.remove(), <number><unknown>getComputedStyle(this.element).getPropertyValue("animation-duration").replace(/[a-z]+/g, "") * 1000);
	}

	public HideAndRemove = () =>
	{
		this.Hide();
		this.Remove();
	}

	public set Title(title: string)
	{
		const titleElement: HTMLElement = this.element.querySelector(".title") as HTMLElement;

		titleElement.innerText = title;
	}

	public set Subtitle(subtitle: string)
	{
		const subtitleElement: HTMLElement = this.element.querySelector(".subtitle") as HTMLElement;

		subtitleElement.innerText = subtitle;
	}

	public set TitleTranslationId(id: string)
	{
		const titleElement: HTMLElement = this.element.querySelector(".title") as HTMLElement;

		titleElement.appendChild(Translation.GetElement(id));
	}

	public set SubtitleTranslationId(id: string)
	{
		const subtitleElement: HTMLElement = this.element.querySelector(".subtitle") as HTMLElement;

		subtitleElement.appendChild(Translation.GetElement(id));
	}

	public AppendContent = (data : any[]) =>
	{
		HideElement(this.spinner);

		data.filter(Boolean).forEach(element => this.Content.append(element));

		(<NodeListOf<HTMLInputElement>> this.Content.querySelectorAll("input:not([type=checkbox])")).forEach(element => element.addEventListener("keydown", e =>
		{
			if (e.key === "Enter") this.ConfirmButton.click();
		}));
	}

	public RemoveContent = () =>
	{
		ShowElement(this.spinner, "block");

		this.Content.innerHTML = "";
	}

	public ShowSpinner = () => ShowElement(this.spinner);

	public HideSpinner = () => HideElement(this.spinner);
}

export class UploadModal extends Modal
{
	public ProgressBar : HTMLSpanElement;

	public TransferSize : HTMLSpanElement;

	public OnPause: () => void;

	public OnResume: () => void;

	public OnCancel: () => void;

	constructor(name : string, size : number)
	{
		super({
			subtitle: name,
			floating: true,
			animate: false,
			aside: true,
		});

		this.AppendContent([
			new Component("div", {
				class: "transfer-info",
				children: [
					new Component("div", {
						class: "progress-bar-container",
						children: [
							this.ProgressBar = new Component("span", {
								class: "progress-bar",
							}).element,
						],
					}).element,
					new Component("p", {
						class: "status",
						children: [
							this.TransferSize = new Component("span", {
								class: "transfer-size",
								innerText: 0,
							}).element,
							new Component("span", {
								class: "tot-size",
								innerText: ` / ${FormatStorage(size)}`,
							}).element,
						],
					}).element,
				],
			}).element,
			new Component("div", {
				class: "upload-controls",
				children: [
					// Pause Button
					new Component("button", {
						class: "pause upload-control",
						children: [
							new Component("i", {
								class: "fas fa-pause fa-fw",
							}).element,
						],
					}).element,
					// Resume Button
					new Component("button", {
						class: "resume upload-control",
						children: [
							new Component("i", {
								class: "fas fa-play fa-fw",
							}).element,
						],
					}).element,
					// Cancel Button
					new Component("button", {
						class: "cancel upload-control",
						children: [
							new Component("i", {
								class: "fas fa-times fa-fw",
							}).element,
						],
					}).element,
				],
			}).element,
		]);

		this.OnPause = this.OnResume = this.OnCancel = () => {};

		const pauseButton: HTMLButtonElement = this.element.querySelector(".pause") as HTMLButtonElement;
		const resumeButton: HTMLButtonElement = this.element.querySelector(".resume") as HTMLButtonElement;
		const cancelButton: HTMLButtonElement = this.element.querySelector(".cancel") as HTMLButtonElement;

		pauseButton.addEventListener("click", () =>
		{
			HideElement(pauseButton);
			ShowElement(resumeButton, "block");

			this.OnPause();
		});

		resumeButton.addEventListener("click", () =>
		{
			HideElement(resumeButton);
			ShowElement(pauseButton, "block");

			this.OnResume();
		});

		cancelButton.addEventListener("click", this.OnCancel);

		this.Show();
	}
}

export class DownloadModal extends Modal
{
	public ProgressBar : HTMLSpanElement;

	public TransferSize : HTMLSpanElement;

	constructor(name : string, size : number)
	{
		super({
			subtitle: `${Translation.Get("api->messages->file->downloading")}: ${name}`,
			floating: true,
			animate: false,
			aside: true,
		});

		this.AppendContent([
			new Component("div", {
				class: "transfer-info",
				children: [
					new Component("div", {
						class: "progress-bar-container",
						children: [
							this.ProgressBar = new Component("span", {
								class: "progress-bar",
							}).element,
						],
					}).element,
					new Component("p", {
						class: "status",
						children: [
							this.TransferSize = new Component("span", {
								class: "transfer-size",
								innerText: "0",
							}).element,
							new Component("span", {
								class: "tot-size",
								innerText: ` / ${FormatStorage(size)}`,
							}).element,
						],
					}).element,
				],
			}).element,
		]);

		this.Show();
	}
}