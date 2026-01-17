import { 
    Scene, 
    CameraActor, 
    RenderSystem, 
    PhysicsSystem, 
    Vector3, 
    BoxActor 
} from '@swarnos/engine';
import { Bird } from './actors/Bird';
import { Pipe } from './actors/Pipe';

export class FlappyScene extends Scene {
    private bird: Bird | null = null;
    private pipeSpawnTimer: number = 0;
    private pipeSpawnInterval: number = 1.8;
    private score: number = 0;
    private isGameOver: boolean = false;

    constructor() {
        super();

        // 1. Systems
        const renderSystem = new RenderSystem();
        this.addSystem(renderSystem);

        const physicsSystem = new PhysicsSystem();
        physicsSystem.gravity = new Vector3(0, -1500, 0);
        this.addSystem(physicsSystem);

        // 2. Camera
        const cameraActor = CameraActor.createStandard();
        cameraActor.transform.position.set(0, 0, 100);
        this.addActor(cameraActor);
        renderSystem.setMainCamera(cameraActor.cameraComponent);

        // 3. Ground
        const ground = new BoxActor(0, -620, 1200, 100, 0x8B4513, 1.0);
        ground.name = 'Ground';
        this.addActor(ground);

        // 4. Initial Game State
        this.resetGame();
    }

    private resetGame(): void {
        // Remove old bird and pipes if any
        if (this.bird) {
            this.bird.destroy();
        }
        
        // Clear all pipes
        this.actors.forEach(a => {
            if (a instanceof Pipe) {
                a.destroy();
            }
        });

        this.bird = new Bird();
        this.bird.transform.position.set(-150, 0, 0);
        this.addActor(this.bird);

        this.score = 0;
        this.isGameOver = false;
        this.pipeSpawnTimer = 0;
        console.log("Game Started! Score: 0");
    }

    private spawnPipe(): void {
        const gap = 250;
        const width = 80;
        const centerY = (Math.random() - 0.5) * 400;

        // Top Pipe
        const topHeight = 1000;
        const topY = centerY + gap / 2 + topHeight / 2;
        const topPipe = new Pipe(600, topY, width, topHeight);
        this.addActor(topPipe);

        // Bottom Pipe
        const bottomHeight = 1000;
        const bottomY = centerY - gap / 2 - bottomHeight / 2;
        const bottomPipe = new Pipe(600, bottomY, width, bottomHeight);
        this.addActor(bottomPipe);
    }

    public override tick(dt: number): void {
        super.tick(dt);

        const input = this.engine.input;

        if (this.isGameOver) {
            if (input.getActionDown('Flap')) {
                this.resetGame();
            }
            return;
        }

        if (this.bird?.isDead) {
            this.isGameOver = true;
            console.log("Game Over! Final Score:", this.score);
            return;
        }

        // Handle Input
        if (input.getActionDown('Flap')) {
            this.bird?.flap();
        }

        // Pipe Spawning
        this.pipeSpawnTimer += dt;
        if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
            this.pipeSpawnTimer = 0;
            this.spawnPipe();
        }

        // Update Score
        this.actors.forEach(a => {
            if (a instanceof Pipe && !a.passed && this.bird) {
                if (a.transform.position.x < this.bird.transform.position.x) {
                    a.passed = true;
                    // Since pipes come in pairs (top/bottom), we only count every 2 pipes as 1 point
                    // Or we just flag both and count once. 
                    // Let's count every pair.
                    const otherPipesAtSameX = this.actors.filter(p => p instanceof Pipe && p !== a && Math.abs(p.transform.position.x - a.transform.position.x) < 1);
                    otherPipesAtSameX.forEach(p => (p as Pipe).passed = true);
                    
                    this.score++;
                    console.log("Score:", this.score);
                }
            }
        });
    }
}
