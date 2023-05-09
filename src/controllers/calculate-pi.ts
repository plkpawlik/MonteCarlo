import { createRoot, createSignal } from "solid-js";

// controllers
import CanvasController from "./canvas";
import RandomController from "./random";
import ResultController from "./result";

export default class CalculatePiController {
	public static readonly colorOut = "rgba(134, 187, 216, 0.3)";
	public static readonly colorIn = "rgba(240, 84, 79, 0.6)";

	private chartRandom: CanvasController;
	private chartResult: CanvasController;
	private circle: CanvasController;

	private random: RandomController;
	private result: ResultController;

	private frame: number = 0;
	private anim: boolean = false;

	private readonly signals = createRoot(function () {
		const [pi, setPi] = createSignal(0);

		return { pi, setPi };
	});

	constructor(private mainParent: Element, private sideParent: Element) {
		this.circle = new CanvasController(this.mainParent);
		this.chartRandom = new CanvasController(this.mainParent);
		this.chartResult = new CanvasController(this.sideParent);

		this.random = new RandomController(this.chartRandom.cvs);
		this.result = new ResultController(this.chartResult.cvs);

		// callbacks
		this.circle.onUpdate = () => this.drawCircle();

		// adjust
		window.dispatchEvent(new Event("resize"));
	}

	public get pi() {
		return this.signals.pi;
	}

	public start(): void {
		if (this.anim) return;

		this.anim = true;

		this.random.clear();
		this.result.clear();

		this.signals.setPi(0);

		const animate = () => {
			this.addNewRandomPoint();
			this.addNewResultPoint();

			this.random.update();
			this.result.update();

			this.frame = requestAnimationFrame(animate);
		};

		animate();
	}

	public stop(): void {
		cancelAnimationFrame(this.frame);

		this.anim = false;
	}

	private addNewRandomPoint(): void {
		const x = Math.random();
		const y = Math.random();
		const i = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) <= 0.5 ? 1 : 0;

		this.random.datasets[i].data.push({ x, y });
	}

	private addNewResultPoint(): void {
		const numIn = this.random.datasets[1].data.length;
		const numOut = this.random.datasets[0].data.length;

		const dt = numIn + numOut;
		const pi = (4 * numIn) / dt;

		this.result.datasets[0].data.push({ x: dt, y: pi });
		this.signals.setPi(pi);
	}

	private drawCircle(): void {
		const width = this.mainParent.clientWidth;
		const height = this.mainParent.clientHeight;
		const radius = Math.max(width, height);

		this.circle.ctx.fillStyle = CalculatePiController.colorOut;
		this.circle.ctx.fillRect(0, 0, width, height);
		this.circle.ctx.roundRect(0, 0, width, height, radius);
		this.circle.ctx.fillStyle = CalculatePiController.colorIn;
		this.circle.ctx.fill();
	}
}