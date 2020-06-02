import { IsSet, HasClass } from "./Utilities";

export class Component
{
    public element : HTMLElement;

    constructor (protected type : string, protected options ?: Object)
    {
        this.element = document.createElement(type);

        if (IsSet(options))
        {
            if (options.hasOwnProperty("aria"))
            {
                Array.from(Object.keys((<any>options).aria)).forEach((option, i) =>
                    this.element.setAttribute("aria-" + option, Object.values(<Object>(<any>options).aria)[i]));

                delete (<any>options).aria;
            }

            if (options.hasOwnProperty("children"))
            {
                (<HTMLElement[]>(<any>options).children).forEach(element => this.element.appendChild(element));

                delete (<any>options).children;
            }

            if (options.hasOwnProperty("data"))
            {
                Array.from(Object.keys((<any>options).data)).forEach((option, i) =>
                    this.element.setAttribute("data-" + option, Object.values(<Object>(<any>options).data)[i]));

                delete (<any>options).data;
            }

            if (options.hasOwnProperty("style"))
            {
                const previousStyles : any = {};

                Array.from(Object.keys((<any>options).style)).filter(option => ![":hover", ":focus"].includes(option)).forEach((option, i) =>
                    this.element.style[option as any] = previousStyles[option] = Object.values(<Object>(<any>options).style)[i]);

                if ((<any>options).style.hasOwnProperty(":hover"))
                {
                    const hoverStyles : Object = (<any>options).style[":hover"];

                    Array.from(Object.keys(hoverStyles)).forEach((option, i) =>
                    {
                        this.element.addEventListener("mouseenter", () => !HasClass(this.element, "no-hover") ? this.element.style[option as any] = Object.values(hoverStyles)[i] : null);
                        this.element.addEventListener("mouseleave", () => this.element.style[option as any] = previousStyles[option] || "");
                    });
                }

                delete (<any>options).style;
            }

            if (options.hasOwnProperty("innerText"))
            {
                this.element.innerText = (<any>options).innerText;

                delete (<any>options).innerText;
            }
            
            Array.from(Object.keys(options)).forEach((option, i) => this.element.setAttribute(option, Object.values(options)[i]));
        }
    }
}

export class Input extends Component
{
    constructor (protected options : Object)
    {
        super("div", {
            class: IsSet((<any>options).class) ? (<any>options).class : "input",
            children: [
                new Component("input", {
                    ...(<Component[]>(<any>options).attributes)
                }).element,
                ...(<Component[]>(<any>options).children || [])
            ]
        });
    }
}

export class InputWithIcon extends Input
{
    constructor (protected options : Object)
    {
        super({
            class: "input-with-icon",
            children: [
                new Component("button", {
                    type: "button",
                    class: "input-icon",
                    aria: {
                        hidden: true
                    },
                    tabindex: -1,
                    children: [
                        new Component("i", {
                            class: (<any>options).iconClassName,
                        }).element
                    ]
                }).element
            ],
            attributes: (<any>options).attributes
        });

        if ((<any>options).attributes?.type === "password")
            this.element.querySelector(".input-icon").addEventListener("click", () =>
            {
                this.element.querySelector("input").type =
                    this.element.querySelector("input").type === "password"
                        ? "text"
                        : "password";
            });
    }
}

export class Spinner extends Component
{
    constructor ()
    {
        super("span", {
            class: "spinner",
            children: [
                new Component("i", {
                    class: "fas fa-circle-notch fa-fw"
                }).element
            ]
        });
    }
}