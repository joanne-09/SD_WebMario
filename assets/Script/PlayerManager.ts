import Player from "./Player";
const { ccclass, property } = cc._decorator;

enum PlayerDirection {
    NONE,
    LEFT,
    RIGHT,
}

@ccclass("PlayerManager")
export default class PlayerManager extends cc.Component {
    @property(Player)
    player: Player = null;
    @property(cc.Node)
    background: cc.Node = null;

    private moveDirection: PlayerDirection = PlayerDirection.NONE;

    static sceneGravity(gravity: cc.Vec2 = cc.v2(0, -1000)) {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = gravity;
    }

    // Life cycle methods
    onLoad() {
        PlayerManager.sceneGravity();

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.moveDirection = PlayerDirection.LEFT;
                this.player.playerMove(this.moveDirection);
                break;
            case cc.macro.KEY.d:
                this.moveDirection = PlayerDirection.RIGHT;
                this.player.playerMove(this.moveDirection);
                break;
            case cc.macro.KEY.w:
                if (this.player.isOnGround && !this.player.isJumping) {
                    this.player.isJumping = true;
                }
                break;
        }
    }

    onKeyUp(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                if (this.moveDirection === PlayerDirection.LEFT) {
                    this.moveDirection = PlayerDirection.NONE;
                    this.player.playerMove(this.moveDirection);
                }
                break;
            case cc.macro.KEY.d:
                if (this.moveDirection === PlayerDirection.RIGHT) {
                    this.moveDirection = PlayerDirection.NONE;
                    this.player.playerMove(this.moveDirection);
                }
                break;
        }
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }
}