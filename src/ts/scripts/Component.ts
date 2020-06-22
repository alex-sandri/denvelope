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

export class Input extends Component
{
	constructor(protected options: any)
	{
		super("div", {
			class: options.class ?? "input",
			children: [
				new Component("input", { ...options.attributes }).element,
				...(options.children ?? []),
			],
		});
	}
}

export class InputWithIcon extends Input
{
	constructor(protected options: any)
	{
		super({
			class: "input-with-icon",
			children: [
				new Component("div", {
					class: "input-icon",
					aria: { hidden: true },
					tabindex: -1,
					children: [
						new Component("i", { class: options.iconClassName }).element,
					],
				}).element,
			],
			attributes: options.attributes,
		});

		if (options.attributes?.type === "password") this.element.querySelector(".input-icon").addEventListener("click", () =>
		{
			this.element.querySelector("input").type = this.element.querySelector("input").type === "password"
				? "text"
				: "password";
		});
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