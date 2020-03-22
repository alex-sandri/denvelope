import { Utilities } from "./Utilities";
import { Component } from "./Component";
import { Translation } from "./Translation";

export class Modal
{
    public readonly element : HTMLDivElement = <HTMLDivElement>document.querySelector(".modal").cloneNode(true);

    private spinner : HTMLSpanElement = this.element.querySelector(".spinner");

    public readonly Content : HTMLDivElement = this.element.querySelector(".content");

    public readonly CloseButton : HTMLButtonElement = this.element.querySelector(".close");
    public readonly ConfirmButton : HTMLButtonElement = this.element.querySelector(".confirm");
    public readonly UpdateButton : HTMLButtonElement = this.element.querySelector(".update");

    public OnClose : () => any;
    public OnConfirm : () => any;
    public OnUpdate : () => any;

    constructor (options ?: Object)
    {
        if (Utilities.IsSet(options))
        {
            if (options.hasOwnProperty("title")) this.Title = (<any>options).title;
            if (options.hasOwnProperty("subtitle")) this.Subtitle = (<any>options).subtitle;

            if (options.hasOwnProperty("allow"))
            {
                if ((<string[]>(<any>options).allow).includes("close")) Utilities.ShowElement(this.CloseButton, "block");
                if ((<string[]>(<any>options).allow).includes("confirm")) Utilities.ShowElement(this.ConfirmButton, "block");
                if ((<string[]>(<any>options).allow).includes("update")) Utilities.ShowElement(this.UpdateButton, "block");
            }
            
            if (options.hasOwnProperty("floating") && (<any>options).floating) Utilities.AddClass(this.element, "floating");

            if (options.hasOwnProperty("animate") && !(<any>options).animate) Utilities.AddClass(this.element, "no-animate");

            if (options.hasOwnProperty("aside") && (<any>options).aside) Utilities.AddClass(this.element, "aside");

            if (options.hasOwnProperty("loading") && !(<any>options).loading) Utilities.HideElement(this.spinner);
        }

        this.OnClose = this.OnConfirm = this.OnUpdate = () => {};

        document.body.appendChild(this.element);
    }

    /**
     * @param unique If set to true all other modals currently shown will be removed, except non-unique ones
     */
    public Show = (unique ?: boolean) : void =>
    {
        this.CloseButton.addEventListener("click", () =>
        {
            this.Hide();
            this.Remove();
        });

        this.ConfirmButton.addEventListener("click", this.OnConfirm);
        this.UpdateButton.addEventListener("click", this.OnUpdate);
        
        if (Utilities.IsSet(unique) && unique) document.querySelectorAll(".modal.show:not(.keep-alive)").forEach(element => element.remove());
        else Utilities.AddClass(this.element, "keep-alive"); // Do not remove the modal, unless the user decides to

        if (!Utilities.HasClass(this.element, "show"))
        {
            if (this.Content.innerHTML.trim() === "") Utilities.ShowElement(this.spinner, "block");

            Utilities.RemoveClass(this.element, "hide");
            Utilities.AddClass(this.element, "show");
        }

        document.addEventListener("mouseup", this.HideOnOuterClick);

        window.addEventListener("keydown", e =>
        {
            const key = e.key.toLowerCase();

            if (["escape"].includes(key)) e.preventDefault();

            if (key === "escape") this.HideAndRemove();
        });
    }

    public Hide = () : void =>
    {
        Utilities.RemoveClass(this.element, "show");
        Utilities.AddClass(this.element, "hide");
    }

    public Remove = () : void =>
    {
        this.OnClose();
        
        setTimeout(() => this.element.remove(), <number><unknown>getComputedStyle(this.element).getPropertyValue("animation-duration").replace(/[a-z]+/g, "") * 1000);

        document.removeEventListener("click", this.HideOnOuterClick);
    }

    public HideAndRemove = () : void =>
    {
        this.Hide();
        this.Remove();
    }

    public set Title (title : string)
    {
        const titleElement = document.createElement("h1");

        titleElement.className = "title";
        titleElement.innerHTML = title;

        this.Content.querySelector(".heading").insertAdjacentElement("afterbegin", titleElement);
    }

    public set Subtitle (subtitle : string)
    {
        const subtitleElement = document.createElement("h4");

        subtitleElement.className = "subtitle";
        subtitleElement.innerHTML = subtitle;

        this.Content.querySelector(".heading").insertAdjacentElement("beforeend", subtitleElement);
    }

    public AppendContent = (data : any[]) : void =>
    {
        Utilities.HideElement(this.spinner);
    
        data.filter(Utilities.IsSet).forEach(element => this.Content.append(element));

        this.Content.querySelectorAll("input").forEach(element => element.addEventListener("keyup", e =>
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
        Utilities.ShowElement(this.spinner, "block");

        this.Content.childNodes.forEach(child => !Utilities.HasClass(<HTMLElement>child, "heading") ? child.remove() : null);
    }

    private HideOnOuterClick = (e : Event) : void =>
    {
        if (!this.element.contains(<HTMLElement>e.target) && !Utilities.HasClass(this.element, "keep-alive")) this.HideAndRemove();
    }
}

export class UploadModal extends Modal
{
    public ProgressBar : HTMLSpanElement;

    public TransferSize : HTMLSpanElement;

    public OnPause : () => any;
    public OnResume : () => any;
    public OnCancel : () => any;

    constructor (name : string, size : number)
    {
        super({
            subtitle: name,
            floating: true,
            animate: false,
            aside: true
        });

        this.AppendContent([
            new Component("div", {
                class: "transfer-info",
                children: [
                    new Component("div", {
                        class: "progress-bar-container",
                        children: [
                            this.ProgressBar = new Component("span", {
                                class: "progress-bar"
                            }).element
                        ]
                    }).element,
                    new Component("p", {
                        class: "status",
                        children: [
                            this.TransferSize = new Component("span", {
                                class: "transfer-size",
                                innerHTML: 0
                            }).element,
                            new Component("span", {
                                class: "tot-size",
                                innerHTML: ` / ${Utilities.FormatStorage(size)}`
                            }).element
                        ]
                    }).element
                ]
            }).element,
            new Component("div", {
                class: "upload-controls",
                children: [
                    // Pause Button
                    new Component("button", {
                        class: "pause upload-control",
                        children: [
                            new Component("i", {
                                class: "fas fa-pause fa-fw"
                            }).element
                        ]
                    }).element,
                    // Resume Button
                    new Component("button", {
                        class: "resume upload-control",
                        children: [
                            new Component("i", {
                                class: "fas fa-play fa-fw"
                            }).element
                        ]
                    }).element,
                    // Cancel Button
                    new Component("button", {
                        class: "cancel upload-control",
                        children: [
                            new Component("i", {
                                class: "fas fa-times fa-fw"
                            }).element
                        ]
                    }).element
                ]
            }).element
        ]);

        const pauseButton : HTMLButtonElement = this.element.querySelector(".pause");
        const resumeButton : HTMLButtonElement = this.element.querySelector(".resume");
        const cancelButton : HTMLButtonElement = this.element.querySelector(".cancel");

        pauseButton.addEventListener("click", () =>
        {
            Utilities.HideElement(pauseButton);
            Utilities.ShowElement(resumeButton, "block");

            this.OnPause();
        });

        resumeButton.addEventListener("click", () =>
        {
            Utilities.HideElement(resumeButton);
            Utilities.ShowElement(pauseButton, "block");

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

    constructor (name : string, size : number)
    {
        super({
            subtitle: `${Translation.Get("api->messages->file->downloading")}: ${name}`,
            floating: true,
            animate: false,
            aside: true
        });

        this.AppendContent([
            new Component("div", {
                class: "transfer-info",
                children: [
                    new Component("div", {
                        class: "progress-bar-container",
                        children: [
                            this.ProgressBar = new Component("span", {
                                class: "progress-bar"
                            }).element
                        ]
                    }).element,
                    new Component("p", {
                        class: "status",
                        children: [
                            this.TransferSize = new Component("span", {
                                class: "transfer-size",
                                innerHTML: 0
                            }).element,
                            new Component("span", {
                                class: "tot-size",
                                innerHTML: ` / ${Utilities.FormatStorage(size)}`
                            }).element
                        ]
                    }).element
                ]
            }).element
        ]);

        this.Show();
    }
}