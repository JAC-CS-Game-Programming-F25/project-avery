import State from '../../lib/State.js';
import GameStateName from '../enums/GameStateName.js';

export default class LevelTransitionState extends State {
    constructor(playState) {
        super();
        this.playState = playState;

        this.targetLevelIndex = null;
        this.timer = 0;
        this.duration = 0.1; // seconds (can be 0 for instant)
    }

    /**
     * Called when entering the transition state
     */
    enter(params) {
        console.log('[Transition] enter', params);

        this.targetLevelIndex = params.levelIndex;
        this.timer = 0;

        // Immediately stop any active systems if needed
        this.playState.sympathyManager.reset();
    }

    update(dt) {
        console.log('[Transition] updating', this.timer);
        this.timer += dt;

        // Perform the level swap ONCE
        if (this.timer >= this.duration) {
            this.playState.loadLevelByIndex(this.targetLevelIndex);

            // Return to play state cleanly
            this.stateMachine.change(GameStateName.Play);
        }
    }

    render(context) {
        // Optional: leave blank for invisible transition

        // If you want a simple fade later, this is where it goes
        // context.fillStyle = 'rgba(0,0,0,0.5)';
        // context.fillRect(0, 0, canvas.width, canvas.height);
    }

    exit() {
 
        this.targetLevelIndex = null;
    }
}
