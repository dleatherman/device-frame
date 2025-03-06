class DeviceFrame extends HTMLElement {
	static tagName = "device-frame";

	static attrs = {
		mode: "mode", // values: "dark", "light"
		brand: "brand", // values: "apple", "android"
		padded: "padded",
		shadow: "shadow",
		time: "time",
	};

	static style = `
:host {
	--df-aspect-ratio: var(--df-ar, 9/19.25);
	--df-camera-size: var(--df-camera, .8rem);
	--df-internal-bg: var(--df-background, transparent);
	--df-internal-fg: var(--df-foreground, inherit);
	--df-internal-border: var(--df-internal-border-width, .4rem) solid var(--df-internal-fg);
	--df-outer-bezel: var(--df-bezel, 0);
	--df-internal-shadow-hsl: var(--df-shadow-hsl, 0deg 0% 75%);
	--df-padding-start: var(--df-padding, 0);
	--df-padding-end: var(--df-padding, 0);
	--df-radius-outer: var(--df-radius, 3rem);
	--font-family: system-ui, sans-serif;
}
:host([${DeviceFrame.attrs.mode}="light"]) {
	--df-internal-bg: var(--df-background, #fff);
	--df-internal-fg: var(--df-foreground, #111);
}
:host([${DeviceFrame.attrs.mode}="dark"]) {
	--df-internal-bg: var(--df-background, #111);
	--df-internal-fg: var(--df-foreground, #fff);
	--df-internal-shadow-hsl: var(--df-shadow-hsl, 0deg 0% 25%);
}
:host([${DeviceFrame.attrs.padded}]) {
	--df-padding-start: 3rem;
	--df-padding-end: 1rem;
}
:host([${DeviceFrame.attrs.brand}="android"]) .device {
	--df-aspect-ratio: 9/19.5;
	--df-camera-size: 1.2rem;
	--df-radius-outer: var(--df-radius, 3.35rem);
}
.device {
	aspect-ratio: var(--df-aspect-ratio);
	background: var(--df-internal-bg);
	border-radius: var(--df-radius-outer);
	border: var(--df-internal-border);
	color: var(--df-internal-fg);
	display: grid;
	font-family: var(--font-family);
	font-size: 1rem;
	font-weight: 400;
	grid-template: "hed-left hed-center hed-right"
	"screen screen screen"
	"footer footer footer";
	overflow: hidden;
}
:host([${DeviceFrame.attrs.shadow}]) .device {
	/* via https://www.joshwcomeau.com/shadow-palette/ */
	border: var(--df-internal-border);
	box-shadow: 0px 0.3px 0.5px hsl(var(--df-internal-shadow-hsl) / 0),
		0.1px 2.4px 3.6px hsl(var(--df-internal-shadow-hsl) / 0.07),
		0.1px 4.3px 6.5px hsl(var(--df-internal-shadow-hsl) / 0.14),
		0.2px 6.7px 10.1px hsl(var(--df-internal-shadow-hsl) / 0.22),
		0.3px 10.6px 15.9px hsl(var(--df-internal-shadow-hsl) / 0.29),
		0.5px 16.5px 24.8px hsl(var(--df-internal-shadow-hsl) / 0.36);
}
.hed {
	align-items: center;
	display: grid;
	grid-area: hed-left / 1 / 2 / hed-right;
	grid-template-columns: 1fr 1fr 1fr;
	font-size: .8rem;
	font-weight: 500;
	max-height: 3.6rem;
	text-align: center;
	z-index: 1;
}
.android .hed-island {
	background: transparent;
	justify-content: center;
	padding: 0;
	width: auto;
}
.hed-island {
	align-items: center;
	box-sizing: border-box;
	background: var(--df-internal-fg);
	border-radius: 3rem;
	display: flex;
	justify-content: flex-end;
	margin-block: var(--df-camera-size);
	margin-inline: auto;
	padding: calc(var(--df-camera-size) * .5) calc(var(--df-camera-size) * .75);
	width: 85%;
}
.hed-island::after {
	background-color: var(--df-internal-bg);
	background-image: radial-gradient(50% 50% at 50% 50%, #393752 10%, #0F0F2A 11%, #0F0F2A 40%, #161424 40.01%, #161424 65%, #0E0B0F 65.01%);
	border-radius: 100%;
	content: '';
	display: block;
	height: var(--df-camera-size);
	width: var(--df-camera-size);
	z-index: 1;
}
.main {
	border-radius: calc(var(--df-radius-outer) - .75rem);
	grid-area: hed-left / hed-left / footer / span 3;
	overflow: auto;
	padding: var(--df-padding-start) var(--df-outer-bezel) var(--df-padding-end);
	scrollbar-width: none;
}
.main::-webkit-scrollbar {
  height: 0.4rem;
  width: 0.4rem;
  display: none;
}
.main::-webkit-scrollbar-thumb {
  background-color: var(--df-internal-fg);
  border-radius: 0.4rem;
  border: 0;
}
.main::-webkit-scrollbar-track {
  background: red;
  border-radius: 0.4rem;
}
.main > ::slotted(img:only-child),
.main > ::slotted(iframe:only-child) {
	display: flex;
}
`;

	setMode(isDarkMode) {
		this.setAttribute(DeviceFrame.attrs.mode, isDarkMode ? "dark" : "light");
	}

	connectedCallback() {
		if (!("replaceSync" in CSSStyleSheet.prototype) || this.shadowRoot) {
			return;
		}

		let shadowroot = this.attachShadow({ mode: "open" });

		let sheet = new CSSStyleSheet();
		sheet.replaceSync(DeviceFrame.style);
		shadowroot.adoptedStyleSheets = [sheet];

		let template = document.createElement("template");

		let prefersDarkMode = matchMedia("(prefers-color-scheme: dark)");
		if (!this.hasAttribute(DeviceFrame.attrs.mode)) {
			this.setMode(prefersDarkMode.matches);

			prefersDarkMode.addEventListener("change", (e) => {
				this.setMode(e.matches);
			});
		}

		let brand = this.getAttribute(DeviceFrame.attrs.brand) || "apple";
		let time = this.getAttribute(DeviceFrame.attrs.time) || "9:41";

		template.innerHTML = `
		<div class="device ${brand}">
			<div class="hed">
				<div class="hed-left">${time}</div>
				<div class="hed-island"></div>
				<div class="hed-right"></div>
			</div>
			<div class="main"><slot></slot></div>
		</div>`;

		shadowroot.appendChild(template.content.cloneNode(true));
	}
}

if ("customElements" in window) {
	customElements.define(DeviceFrame.tagName, DeviceFrame);
}
