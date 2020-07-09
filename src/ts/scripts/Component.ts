import Translation from "./Translation";

export class Component
{
	public element : HTMLElement;

	constructor(protected type : string, protected options ?: any)
	{
		this.element = document.createElement(type);

		if (options)
		{
			if (options.aria)
			{
				Array.from(Object.keys(options.aria)).forEach((option, i) =>
					this.element.setAttribute(`aria-${option}`, Object.values(<Object>options.aria)[i]));

				delete options.aria;
			}

			if (options.children)
			{
				(<HTMLElement[]>options.children).forEach(element => this.element.appendChild(element));

				delete options.children;
			}

			if (options.data)
			{
				Array.from(Object.keys(options.data)).forEach((option, i) =>
					this.element.setAttribute(`data-${option}`, Object.values(<Object>options.data)[i]));

				delete options.data;
			}

			if (options.style)
			{
				const previousStyles : any = {};

				Object.keys(options.style).forEach((option, i) =>
				{
					this.element.style[option as any]
						= previousStyles[option]
						= Object.values(<Object>options.style)[i];
				});

				delete options.style;
			}

			if (options.innerText)
			{
				this.element.innerText = options.innerText;

				delete options.innerText;
			}

			Array
				.from(Object.keys(options))
				.forEach((option, i) =>
					this.element.setAttribute(option, Object.values(<Object>options)[i]));
		}
	}
}

interface InputComponentOptions
{
	labelTranslationId: string,
	attributes?: {
		id?: string,
		type?: string,
	},
}

export class Input extends Component
{
	public input: HTMLInputElement;

	constructor(protected options: InputComponentOptions)
	{
		super("div", {
			class: "input",
			children: [
				new Component("span", {
					class: "label",
					children: [ Translation.GetElement(options.labelTranslationId) ],
				}).element,
				new Component("input", options.attributes).element,
			],
		});

		this.input = this.element.querySelector("input") as HTMLInputElement;
	}
}

export class Spinner extends Component
{
	constructor()
	{
		super("span", {
			class: "spinner",
			children: [
				new Component("i", {
					class: "fas fa-circle-notch fa-fw",
				}).element,
			],
		});
	}
}