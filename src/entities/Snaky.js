import Enemy from "./Enemy";
import initAnims from './anims/snakyAnims';
import Projectiles from '../attacks/Projectiles';

export default class Snaky extends Enemy {
    constructor(scene, x, y){
        super(scene, x, y, 'snaky');
        initAnims(scene.anims);
    }

    init(){
        super.init();
        this.speed = 25;

        this.projectiles = new Projectiles(this.scene, 'fireball-1');
        this.timeSinceLastAttack = 0;
        this.attackSpeed = this.getAttackSpeed();
        this.lastDirection = null;

        this.setSize(12, 45);
        this.setOffset(10, 15);
    }

    update(time, delta){
        super.update(time, delta);

        if(!this.active) return;

        if(this.body.velocity.x > 0){
            this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
        } else {
            this.lastDirection = Phaser.Physics.Arcade.FACING_LEFT;
        }

        if(this.timeSinceLastAttack + this.attackSpeed <= time){
            this.projectiles.fireProjectile(this, 'fireball');
            
            this.timeSinceLastAttack = time;
            this.attackSpeed = this.getAttackSpeed();
        }

        if(!this.active) return;

        if (this.isPlayingAnims('snaky-hurt')) return;
        
        this.play('snaky-walk', true);
    }

    getAttackSpeed(){
        return Phaser.Math.Between(1000, 4000)
    }

    takesHit(source){
        super.takesHit(source);
        this.play('snaky-hurt', true);
    }
}

