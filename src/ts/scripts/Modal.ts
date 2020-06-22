import {
	ShowElement, AddClass, HideElement, HasClass, RemoveClass, FormatStorage,
} from "./Utilities";
import { Component } from "./Component";
import Translation from "./Translation";

interface ModalOptions
{
	title?: string,
	titleTranslationId?: string,
	subtitle?: string,
	subtitleTranslationId?: string,
	action?: "confirm" | "update",
	floating?: boolean,
	animate?: boolean,
	aside?: boolean,
	loading?: boolean,
}

export class Modal
{
	private readonly container : HTMLDivElement = <HTMLDivElement>document.querySelector(".modal-container").cloneNode(true);

	public readonly element : HTMLDivElement = this.container.querySelector(".modal");

	private readonly spinner : HTMLSpanElement = this.element.querySelector(".spinner");

	public readonly Content : HTMLDivElement = this.element.querySelector(".content");

	public readonly CloseButton : HTMLButtonElement = this.element.querySelector(".close");

	public readonly ConfirmButton : HTMLButtonElement = this.element.querySelector(".confirm");

	public readonly UpdateButton : HTMLButtonElement = this.element.querySelector(".update");

	public OnClose : () => any;

	public OnConfirm : () => any;

	public OnUpdate : () => any;

	constructor(options ?: ModalOptions)
	{
		if (options?.titleTranslationId) this.TitleTranslationId = options.titleTranslationId;

		if (options?.title) this.Title = options.title;

		if (options?.subtitleTranslationId) this.SubtitleTranslationId = options.subtitleTranslationId;

		if (options?.subtitle) this.Subtitle = options.subtitle;

		switch (options?.action)
		{
			case "confirm": ShowElement(this.ConfirmButton, "block"); break;
			case "update": ShowElement(this.UpdateButton, "block"); break;
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

	public Show = (unique ?: boolean) : void =>
	{
		this.CloseButton.addEventListener("click", () =>
		{
			this.Hide();
			this.Remove();
		});

		this.ConfirmButton.addEventListener("click", this.OnConfirm);
		this.UpdateButton.addEventListener("click", this.OnUpdate);

		if (unique) document.querySelectorAll(".modal.show:not(.keep-alive)").forEach(element => element.parentElement.remove()); // Remove also its container
		else AddClass(this.element, "keep-alive"); // Do not remove the modal, unless the user decides to

		if (!HasClass(this.element, "show"))
		{
			ShowElement(this.container);

			RemoveClass(this.element, "hide");
			AddClass(this.element, "show");
		}

		this.CloseButton.focus();

		if (getComputedStyle(this.ConfirmButton).getPropertyValue("display") !== "none" && !this.ConfirmButton.disabled) this.ConfirmButton.focus();
		else if (getComputedStyle(this.UpdateButton).getPropertyValue("display") !== "none" && !this.UpdateButton.disabled) this.UpdateButton.focus();

		(<HTMLInputElement | HTMLButtonElement | null> this.Content.querySelector("input, select, button"))?.focus();

		document.addEventListener("mouseup", this.HideOnOuterClick);

		window.addEventListener("keydown", e =>
		{
			const key = e.key.toLowerCase();

			if ([ "escape" ].includes(key)) e.preventDefault();

			if (key === "escape") this.HideAndRemove();
		});
	}

	public Hide = () : void =>
	{
		RemoveClass(this.element, "show");
		AddClass(this.element, "hide");

		setTimeout(() => HideElement(this.container), <number><unknown>getComputedStyle(this.element).getPropertyValue("animation-duration").replace(/[a-z]+/g, "") * 1000);
	}

	public Remove = () : void =>
	{
		this.OnClose();

		setTimeout(() => this.container.remove(), <number><unknown>getComputedStyle(this.element).getPropertyValue("animation-duration").replace(/[a-z]+/g, "") * 1000);

		document.removeEventListener("click", this.HideOnOuterClick);
	}

	public HideAndRemove = () : void =>
	{
		this.Hide();
		this.Remove();
	}

	public set Title(title: string)
	{
		const titleElement : HTMLElement = this.element.querySelector(".title");

		titleElement.innerText = title;
	}

	public set Subtitle(subtitle: string)
	{
		const subtitleElement : HTMLElement = this.element.querySelector(".subtitle");

		subtitleElement.innerText = subtitle;
	}

	public set TitleTranslationId(id: string)
	{
		const titleElement : HTMLElement = this.element.querySelector(".title");

		titleElement.appendChild(Translation.GetElement(id));
	}

	public set SubtitleTranslationId(id: string)
	{
		const subtitleElement : HTMLElement = this.element.querySelector(".subtitle");

		subtitleElement.appendChild(Translation.GetElement(id));
	}

	public AppendContent = (data : any[]) : void =>
	{
		HideElement(this.spinner);

		data.filter(Boolean).forEach(element => this.Content.append(element));

		(<NodeListOf<HTMLInputElement>> this.Content.querySelectorAll("input:not([type=checkbox])")).forEach(element => element.addEventListener("keydown", e =>
		{
			if (e.key === "Enter")
			{
				this.ConfirmButton.click();
				this.UpdateButton.click();
			}
		}));
	}

	public RemoveContent = () : void =>
	{
		ShowElement(this.spinner, "block");

		this.Content.innerHTML = "";
	}

	private HideOnOuterClick = (e : Event) : void =>
	{
		if (!this.element.contains(<HTMLElement>e.target) && !HasClass(this.element, "keep-alive")) this.HideAndRemove();
	}
}

export class UploadModal extends Modal
{
	public ProgressBar : HTMLSpanElement;

	public TransferSize : HTMLSpanElement;

	public OnPause : () => any;

	public OnResume : () => any;

	public OnCancel : () => any;

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

		const pauseButton : HTMLButtonElement = this.element.querySelector(".pause");
		const resumeButton : HTMLButtonElement = this.element.querySelector(".resume");
		const cancelButton : HTMLButtonElement = this.element.querySelector(".cancel");

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
		]);

		this.Show();
	}
}