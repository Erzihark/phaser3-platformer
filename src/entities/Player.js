import Phaser from "phaser";
import HealthBar from "../hud/HealthBar";
import initAnimations from './anims/playerAnims';
import collidable from "../mixins/collidable";
import anims from '../mixins/anims';
import Projectiles from "../attacks/Projectiles";
import MeleeWeapon from "../attacks/MeleeWeapon";
import { getTimeStamp } from "../utils/functions";
import EventEmitter from "../events/Emitter";

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y){
        super(scene, x, y, 'player');

        scene.add.existing(this)
        scene.physics.add.existing(this);

        //mixins, this function adds attributes and methods from one class to another
        Object.assign(this, collidable);
        Object.assign(this, anims)

        this.init();
        this.initEvents();
    }

    init(){

        this.gravity = 500;
        this.playerSpeed = 150;
        this.jumpCount = 0;
        this.consecutiveJumps = 1;
        this.hasBeenHit = false;
        this.isSliding = false;
        this.bounceVelocity = 250;
        this.cursors = this.scene.input.keyboard.createCursorKeys();

        this.jumpSound = this.scene.sound.add('jump', {volume: 0.2});
        this.projectileSound = this.scene.sound.add('projectile-launch', {volume: 0.2});
        this.stepSound = this.scene.sound.add('step', {volume: 0.2});
        this.swipeSound = this.scene.sound.add('swipe', {volume: 0.2});


        this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
        this.projectiles = new Projectiles(this.scene, 'iceball-1');
        this.meleeWeapon = new MeleeWeapon(this.scene, 0, 0, 'sword-default');
        this.timeSinceLastSwing = null;

        this.health = 1000;
        this.hp = new HealthBar(
            this.scene,
            this.scene.config.leftTopCorner.x + 5,
            this.scene.config.leftTopCorner.y + 5,
            2,
            this.health
        )

        this.body.setSize(20, 38)
        this.body.setGravityY(500);
        this.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1)

        initAnimations(this.scene.anims);

        this.handleAttacks();
        this.handleMovements();

        this.scene.time.addEvent({
            delay: 300,
            repeat: -1,
            callbackScope: this,
            callback: () =>{
                if(this.isPlayingAnims('run'))
                this.stepSound.play();
            }
        })
    }

    initEvents(){
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this)
    }

    update(time, delta){
        if(this.hasBeenHit || this.isSliding || !this.body) return;

        if(this.getBounds().top > this.scene.config.height + 100){
            EventEmitter.emit('PLAYER_LOSE');
        }

        const {left, right, space, up} = this.cursors;
        const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
        const isUpJustDown = Phaser.Input.Keyboard.JustDown(up);

        const onFloor = this.body.onFloor();

        

        if(left.isDown){
            this.lastDirection = Phaser.Physics.Arcade.FACING_LEFT;
            this.setVelocityX(-this.playerSpeed);
            this.setFlipX(true);
        } else if (right.isDown){
            this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
            this.setVelocityX(this.playerSpeed);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        if((isSpaceJustDown || isUpJustDown) && (onFloor || this.jumpCount < this.consecutiveJumps)){
            this.jumpSound.play();
            this.setVelocityY(-this.playerSpeed * 1.7);
            this.jumpCount++;
        } 

        if(onFloor){
            this.jumpCount = 0;
        }

        if(this.isPlayingAnims('throw') || this.isPlayingAnims('slide')) return;

        //second param is to prevent this animation from playing again if its already playing
        onFloor ? 
            this.body.velocity.x !== 0 ?
                this.play('run', true) : this.play('idle', true) :
            this.play('jump', true)
    }

    bounceOff(source){
        if(source.body){
            this.body.touching.right ? 
            this.setVelocityX(-this.bounceVelocity) : 
            this.setVelocityX(this.bounceVelocity);
        } else {
            this.body.blocked.right ? 
            this.setVelocityX(-this.bounceVelocity/2) : 
            this.setVelocityX(this.bounceVelocity/2);
        }
        

        setTimeout(() => this.setVelocityY(-this.bounceVelocity), 0);
    }

    handleAttacks(){
        this.scene.input.keyboard.on('keydown-Q', ()=>{
            this.projectileSound.play();
            this.play('throw', true);
            this.projectiles.fireProjectile(this, 'iceball');
        });

        this.scene.input.keyboard.on('keydown-E', ()=>{

            if(this.timeSinceLastSwing && this.timeSinceLastSwing + this.meleeWeapon.attackSpeed > getTimeStamp()) return;
            this.swipeSound.play();
            this.play('throw', true);
            this.meleeWeapon.swing(this);
            this.timeSinceLastSwing = getTimeStamp();
        });
    }

    handleMovements(){
        this.scene.input.keyboard.on('keydown-DOWN', ()=>{
            if(!this.body.onFloor()) return;
            this.body.setSize(this.width, this.height/2);
            this.setOffset(0, this.height/2);
            this.setVelocityX(0);
            this.play('slide', true);
            this.isSliding = true;

        });
        this.scene.input.keyboard.on('keyup-DOWN', ()=>{
            this.body.setSize(this.width, 38);
            this.setOffset(0, 0);
            this.isSliding = false;

        });
    }

    playDamageTween(){
        return this.scene.tweens.add({
            targets: this,
            duration: 100,
            repeat: -1,
            tint: 0xffffff
        })
    }

    takesHit(source){
        if(this.hasBeenHit) return;

        this.health -= source.damage || source.properties.damage || 0;

        if(this.health <= 0){
            EventEmitter.emit('PLAYER_LOSE');
            this.hasBeenHit = false;
            return;
        }

        this.hasBeenHit = true;
        this.bounceOff(source);
        const hitAnim = this.playDamageTween();

        this.hp.decrease(this.health);

        typeof source.deliversHit !== 'undefined' && source.deliversHit(this);

        

        this.scene.time.delayedCall(1000, ()=> {
            this.hasBeenHit = false;
            hitAnim.stop();
            this.clearTint();
        });
    }
}

export default Player